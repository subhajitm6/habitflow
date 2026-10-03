from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.models.habit import Habit
from app.models.habit_completion import HabitCompletion
from collections import defaultdict
from sqlalchemy import func

def get_habit_completions(db: Session, user_id: int, start_date: date, end_date: date):
    return db.query(HabitCompletion).join(Habit).filter(
        Habit.user_id == user_id,
        HabitCompletion.completion_date >= start_date,
        HabitCompletion.completion_date <= end_date,
        HabitCompletion.completed == True
    ).all()

def calculate_current_streak(db: Session, user_id: int) -> int:
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.is_active == True).all()
    if not habits:
        return 0
    habit_ids = [h.id for h in habits]
    completions = db.query(HabitCompletion).filter(
        HabitCompletion.habit_id.in_(habit_ids),
        HabitCompletion.completed == True
    ).order_by(HabitCompletion.completion_date.desc()).all()
    
    # Calculate streak of consecutive days where AT LEAST ONE habit was completed (simple aggregate streak)
    # or you could calculate the average streak. For simple dashboard, consecutive days user did *something*.
    days_completed = sorted(list(set(c.completion_date for c in completions)), reverse=True)
    if not days_completed:
        return 0
        
    current_date = date.today()
    streak = 0
    if days_completed[0] == current_date or days_completed[0] == current_date - timedelta(days=1):
        streak = 1
        current_check = days_completed[0]
        for i in range(1, len(days_completed)):
            if days_completed[i] == current_check - timedelta(days=1):
                streak += 1
                current_check = days_completed[i]
            else:
                break
    return streak

def calculate_weekly_consistency(db: Session, user_id: int) -> float:
    today = date.today()
    start_of_week = today - timedelta(days=6)
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.is_active == True).all()
    if not habits:
        return 0.0
        
    total_possible = len(habits) * 7
    completions = get_habit_completions(db, user_id, start_of_week, today)
    
    if total_possible == 0:
        return 0.0
    return round((len(completions) / total_possible) * 100, 1)

def calculate_completion_percentage(db: Session, user_id: int) -> float:
    today = date.today()
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.is_active == True).all()
    if not habits:
        return 0.0
        
    completed_today = len(get_habit_completions(db, user_id, today, today))
    return round((completed_today / len(habits)) * 100, 1)

def get_weekly_progress(db: Session, user_id: int):
    today = date.today()
    start_of_week = today - timedelta(days=6)
    completions = get_habit_completions(db, user_id, start_of_week, today)
    
    completion_by_date = defaultdict(int)
    for c in completions:
        completion_by_date[c.completion_date] += 1
        
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.is_active == True).all()
    total_habits = len(habits)
    
    progress = []
    for i in range(7):
        d = today - timedelta(days=6-i)
        completed_count = completion_by_date.get(d, 0)
        pct = round((completed_count / total_habits) * 100, 1) if total_habits > 0 else 0.0
        progress.append({"date": d, "completion_percentage": pct})
    return progress

def get_habit_performance(db: Session, user_id: int):
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.is_active == True).all()
    today = date.today()
    start_date = today - timedelta(days=29) # last 30 days
    completions = get_habit_completions(db, user_id, start_date, today)
    
    completions_by_habit = defaultdict(int)
    for c in completions:
        completions_by_habit[c.habit_id] += 1
        
    performance = []
    for h in habits:
        pct = round((completions_by_habit.get(h.id, 0) / 30) * 100, 1)
        performance.append({"habit_id": h.id, "habit_name": h.name, "completion_percentage": pct})
    return performance

def get_monthly_overview(db: Session, user_id: int):
    today = date.today()
    start_date = today.replace(day=1)
    completions = get_habit_completions(db, user_id, start_date, today)
    
    completion_by_date = defaultdict(int)
    for c in completions:
        completion_by_date[c.completion_date] += 1
        
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.is_active == True).all()
    total_habits = len(habits)
    
    overview = []
    for i in range(1, today.day + 1):
        d = today.replace(day=i)
        completed_count = completion_by_date.get(d, 0)
        pct = round((completed_count / total_habits) * 100, 1) if total_habits > 0 else 0.0
        overview.append({"date": d, "completion_percentage": pct})
    return overview

def get_dashboard_data(db: Session, user_id: int):
    today = date.today()
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.is_active == True).all()
    completions_today = get_habit_completions(db, user_id, today, today)
    completed_ids = set(c.habit_id for c in completions_today)
    
    start_of_week = today - timedelta(days=6)
    recent_completions = get_habit_completions(db, user_id, start_of_week, today)
    completions_map = defaultdict(set)
    for c in recent_completions:
        completions_map[c.habit_id].add(c.completion_date)
        
    habit_list = []
    for h in habits:
        recent = []
        for i in range(7):
            d = today - timedelta(days=6-i)
            recent.append(d in completions_map[h.id])
        
        habit_list.append({
            "id": h.id, 
            "name": h.name, 
            "frequency": h.frequency, 
            "completed_today": h.id in completed_ids,
            "recent_completions": recent
        })
    
    return {
        "date": today,
        "summary": {
            "total_habits": len(habits),
            "completed_today": len(completions_today),
            "completion_percentage": calculate_completion_percentage(db, user_id),
            "current_streak": calculate_current_streak(db, user_id),
            "weekly_consistency": calculate_weekly_consistency(db, user_id)
        },
        "habits": habit_list,
        "weekly_progress": get_weekly_progress(db, user_id),
        "habit_performance": get_habit_performance(db, user_id),
        "monthly_overview": get_monthly_overview(db, user_id)
    }

def get_period_analytics(db: Session, user_id: int, period: str):
    today = date.today()
    habits = db.query(Habit).filter(Habit.user_id == user_id, Habit.is_active == True).all()
    total_habits = len(habits)

    data = []
    average_completion = 0
    change_from_previous = 0
    best_label = ""
    best_value = -1

    if period == "week":
        # Current week
        start_date = today - timedelta(days=6)
        completions = get_habit_completions(db, user_id, start_date, today)
        comp_by_date = defaultdict(int)
        for c in completions:
            comp_by_date[c.completion_date] += 1
            
        # Prev week
        prev_start = start_date - timedelta(days=7)
        prev_end = start_date - timedelta(days=1)
        prev_completions = get_habit_completions(db, user_id, prev_start, prev_end)
        
        sum_pct = 0
        for i in range(7):
            d = start_date + timedelta(days=i)
            pct = round((comp_by_date.get(d, 0) / total_habits) * 100, 1) if total_habits > 0 else 0
            label = d.strftime("%a") # Mon, Tue, etc
            data.append({"label": label, "completion_rate": pct})
            sum_pct += pct
            if pct > best_value:
                best_value = pct
                best_label = d.strftime("%A")
                
        average_completion = round(sum_pct / 7, 1)
        prev_sum_pct = sum([round((1 / total_habits) * 100, 1) for _ in prev_completions]) if total_habits > 0 else 0
        prev_avg = round(prev_sum_pct / 7, 1)
        change_from_previous = round(average_completion - prev_avg, 1)
        
    elif period == "month":
        # Current month weeks approximation
        start_date = today.replace(day=1)
        completions = get_habit_completions(db, user_id, start_date, today)
        
        # We can group by week of the month
        weeks_data = [0, 0, 0, 0]
        weeks_count = [0, 0, 0, 0]
        for c in completions:
            week_idx = min(3, (c.completion_date.day - 1) // 7)
            weeks_data[week_idx] += 1
            
        for i in range(today.day):
            week_idx = min(3, i // 7)
            weeks_count[week_idx] += 1
            
        sum_pct = 0
        for i in range(4):
            possible = total_habits * max(1, weeks_count[i])
            pct = round((weeks_data[i] / possible) * 100, 1) if possible > 0 else 0
            data.append({"label": f"Week {i+1}", "completion_rate": pct})
            sum_pct += pct
            if pct > best_value:
                best_value = pct
                best_label = f"Week {i+1}"
                
        average_completion = round(sum_pct / 4, 1)
        # Mock previous month change for now
        change_from_previous = 0
        
    elif period == "year":
        start_date = today.replace(month=1, day=1)
        completions = get_habit_completions(db, user_id, start_date, today)
        
        month_data = defaultdict(int)
        for c in completions:
            month_data[c.completion_date.month] += 1
            
        sum_pct = 0
        months_passed = today.month
        
        import calendar
        for i in range(1, 13):
            if i <= months_passed:
                days_in_month = calendar.monthrange(today.year, i)[1]
                if i == today.month:
                    days_in_month = today.day
                possible = total_habits * days_in_month
                pct = round((month_data.get(i, 0) / possible) * 100, 1) if possible > 0 else 0
            else:
                pct = 0
            
            label = date(today.year, i, 1).strftime("%b")
            data.append({"label": label, "completion_rate": pct})
            
            if i <= months_passed:
                sum_pct += pct
                if pct > best_value:
                    best_value = pct
                    best_label = date(today.year, i, 1).strftime("%B")
                    
        average_completion = round(sum_pct / months_passed, 1) if months_passed > 0 else 0
        change_from_previous = 0
        
    if best_value == -1 or total_habits == 0:
        best_label = "None"
        best_value = 0

    return {
        "period": period,
        "average_completion": average_completion,
        "change_from_previous": change_from_previous,
        "best_period": {
            "label": best_label,
            "value": best_value
        },
        "data": data
    }
