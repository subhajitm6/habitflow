from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.schemas.habit import Habit, HabitCreate, HabitUpdate, HabitCompletionRequest, HabitCompletion
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.services.habit_service import (
    create_habit, get_habits, get_habit, update_habit, 
    delete_habit, archive_habit, complete_habit, undo_complete_habit
)

router = APIRouter()

@router.get("", response_model=List[Habit])
def read_habits(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_habits(db, user_id=current_user.id)

@router.post("", response_model=Habit, status_code=status.HTTP_201_CREATED)
def create_new_habit(habit_in: HabitCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_habit(db, habit_in, user_id=current_user.id)

@router.get("/{habit_id}", response_model=Habit)
def read_habit(habit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = get_habit(db, habit_id, user_id=current_user.id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit

@router.put("/{habit_id}", response_model=Habit)
def update_existing_habit(habit_id: int, habit_in: HabitUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = update_habit(db, habit_id, habit_in, user_id=current_user.id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit

@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_habit(habit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = delete_habit(db, habit_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Habit not found")

@router.patch("/{habit_id}/archive", response_model=Habit)
def archive_existing_habit(habit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    habit = archive_habit(db, habit_id, user_id=current_user.id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit

@router.post("/{habit_id}/complete", response_model=HabitCompletion)
def complete_habit_for_date(habit_id: int, req: HabitCompletionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    completion = complete_habit(db, habit_id, req.date, user_id=current_user.id)
    if not completion:
        raise HTTPException(status_code=404, detail="Habit not found")
    return completion

@router.delete("/{habit_id}/complete", status_code=status.HTTP_204_NO_CONTENT)
def undo_complete_habit_for_date(habit_id: int, req: HabitCompletionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = undo_complete_habit(db, habit_id, req.date, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Habit or completion not found")
