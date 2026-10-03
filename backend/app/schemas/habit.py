from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class HabitBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    frequency: str
    target: Optional[int] = 1
    target_unit: Optional[str] = None
    reminder_enabled: Optional[bool] = False
    reminder_time: Optional[str] = None
    color: Optional[str] = None

class HabitCreate(HabitBase):
    pass

class HabitUpdate(HabitBase):
    name: Optional[str] = None
    frequency: Optional[str] = None

class Habit(HabitBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class HabitCompletionRequest(BaseModel):
    date: date

class HabitCompletion(BaseModel):
    id: int
    habit_id: int
    completion_date: date
    completed: bool

    class Config:
        from_attributes = True
