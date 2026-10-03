from pydantic import BaseModel
from datetime import date
from typing import List

class WeeklyProgressItem(BaseModel):
    date: date
    completion_percentage: float

class HabitPerformanceItem(BaseModel):
    habit_id: int
    habit_name: str
    completion_percentage: float

class MonthlyOverviewItem(BaseModel):
    date: date
    completion_percentage: float

class DashboardSummary(BaseModel):
    total_habits: int
    completed_today: int
    completion_percentage: float
    current_streak: int
    weekly_consistency: float

class DashboardResponse(BaseModel):
    date: date
    summary: DashboardSummary
    habits: List[dict]
    weekly_progress: List[WeeklyProgressItem]
    habit_performance: List[HabitPerformanceItem]
    monthly_overview: List[MonthlyOverviewItem]
