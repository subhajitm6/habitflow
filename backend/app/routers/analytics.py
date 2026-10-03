from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.schemas.analytics import WeeklyProgressItem, HabitPerformanceItem, MonthlyOverviewItem, DashboardResponse
from app.services.analytics_service import get_weekly_progress, get_habit_performance, get_monthly_overview, get_dashboard_data, get_period_analytics

router = APIRouter()
dashboard_router = APIRouter()

@router.get("")
def read_analytics(period: Optional[str] = "week", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if period not in ["week", "month", "year"]:
        period = "week"
    return get_period_analytics(db, user_id=current_user.id, period=period)

@router.get("/weekly", response_model=List[WeeklyProgressItem])
def read_weekly_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_weekly_progress(db, user_id=current_user.id)

@router.get("/performance", response_model=List[HabitPerformanceItem])
def read_habit_performance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_habit_performance(db, user_id=current_user.id)

@router.get("/monthly", response_model=List[MonthlyOverviewItem])
def read_monthly_overview(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_monthly_overview(db, user_id=current_user.id)

@dashboard_router.get("", response_model=DashboardResponse)
def read_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_dashboard_data(db, user_id=current_user.id)
