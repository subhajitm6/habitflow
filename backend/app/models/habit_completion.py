from sqlalchemy import Column, Integer, Date, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.base import Base

class HabitCompletion(Base):
    __tablename__ = "habit_completions"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    completion_date = Column(Date, nullable=False)
    completed = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    habit = relationship("Habit", backref="completions")

    __table_args__ = (
        UniqueConstraint('habit_id', 'completion_date', name='uq_habit_completion_date'),
    )
