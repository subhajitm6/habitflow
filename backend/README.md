# Habit Tracker API

This is the FastAPI backend for the Habit Tracker application.

## Prerequisites
- Python 3.10+
- PostgreSQL

## Setup Instructions

1. **Clone the repository and enter the backend directory**
2. **Create a virtual environment and install dependencies**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. **Configure Environment Variables**
   Copy `.env.example` to `.env` and update the `DATABASE_URL` with your PostgreSQL credentials.
   ```bash
   cp .env.example .env
   ```
4. **Initialize Alembic and Run Migrations**
   ```bash
   alembic init alembic
   # (Configure alembic/env.py to use your models and Base)
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```
5. **Run the Application**
   ```bash
   uvicorn app.main:app --reload
   ```

## Connecting Frontend
Ensure the frontend environment has `VITE_API_URL` pointing to `http://localhost:8000`. 
The API documentation is available at `http://localhost:8000/docs`.
