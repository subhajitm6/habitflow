from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, habits, analytics
import app.models.user
import app.models.habit
import app.models.habit_completion

app = FastAPI(title="Habit Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(habits.router, prefix="/api/habits", tags=["Habits", "Completions"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(analytics.dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Habit Tracker API"}
