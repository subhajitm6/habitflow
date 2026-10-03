from sqlalchemy.orm import Session
from datetime import date
from app.models.habit import Habit
from app.models.habit_completion import HabitCompletion
from app.schemas.habit import HabitCreate, HabitUpdate

def get_habits(db: Session, user_id: int):
    return db.query(Habit).filter(Habit.user_id == user_id, Habit.is_active == True).all()

def get_habit(db: Session, habit_id: int, user_id: int):
    return db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == user_id).first()

def create_habit(db: Session, habit_in: HabitCreate, user_id: int):
    db_habit = Habit(**habit_in.model_dump(), user_id=user_id)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

def update_habit(db: Session, habit_id: int, habit_in: HabitUpdate, user_id: int):
    db_habit = get_habit(db, habit_id, user_id)
    if not db_habit:
        return None
    
    update_data = habit_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_habit, key, value)
    
    db.commit()
    db.refresh(db_habit)
    return db_habit

def delete_habit(db: Session, habit_id: int, user_id: int):
    db_habit = get_habit(db, habit_id, user_id)
    if not db_habit:
        return False
    db.delete(db_habit)
    db.commit()
    return True

def archive_habit(db: Session, habit_id: int, user_id: int):
    db_habit = get_habit(db, habit_id, user_id)
    if not db_habit:
        return None
    db_habit.is_active = False
    db.commit()
    db.refresh(db_habit)
    return db_habit

def complete_habit(db: Session, habit_id: int, completion_date: date, user_id: int):
    habit = get_habit(db, habit_id, user_id)
    if not habit:
        return None
    
    completion = db.query(HabitCompletion).filter(
        HabitCompletion.habit_id == habit_id,
        HabitCompletion.completion_date == completion_date
    ).first()

    if not completion:
        completion = HabitCompletion(habit_id=habit_id, completion_date=completion_date, completed=True)
        db.add(completion)
        db.commit()
        db.refresh(completion)
    
    return completion

def undo_complete_habit(db: Session, habit_id: int, completion_date: date, user_id: int):
    habit = get_habit(db, habit_id, user_id)
    if not habit:
        return False
    
    completion = db.query(HabitCompletion).filter(
        HabitCompletion.habit_id == habit_id,
        HabitCompletion.completion_date == completion_date
    ).first()

    if completion:
        db.delete(completion)
        db.commit()
        return True
    return False
