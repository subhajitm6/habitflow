I have created a new Supabase project and now I want to connect my existing HabitFlow FastAPI backend to the Supabase PostgreSQL database.

Please inspect my existing project first and configure the connection properly without rebuilding or unnecessarily changing my current backend architecture.

### Goal

Connect:

HabitFlow React Frontend → FastAPI Backend → Supabase PostgreSQL

For now, focus ONLY on connecting the existing FastAPI backend with Supabase.

Do not work on Render deployment yet.

### Requirements

1. Inspect the existing FastAPI project structure, database configuration, SQLAlchemy setup, authentication, models, Alembic configuration, and environment configuration.

2. Use Supabase only as the PostgreSQL database. Keep FastAPI and SQLAlchemy as the backend/database layer already used by the project.

3. Configure the Supabase PostgreSQL connection using environment variables. Never hardcode the database password or any sensitive credentials.

4. Use the Supabase transaction pooler connection for normal application/database operations.

5. Use the Supabase session/direct connection where required for database migrations.

6. Keep the existing SQLAlchemy session and dependency architecture working.

7. Check that the PostgreSQL driver required by the existing project is installed and configured correctly.

8. Inspect and configure the existing Alembic setup so migrations can run against the Supabase database.

9. Do not manually recreate the database architecture if the existing project already contains the required models and migrations.

10. Run the existing database migrations against Supabase.

11. Verify that the HabitFlow database tables are successfully created in Supabase.

12. Start the FastAPI backend and verify that the existing API can successfully communicate with Supabase.

13. Test an existing database-related API endpoint and confirm that it is reading/writing data from Supabase rather than from a local database.

14. If the database is empty, keep it empty. Do not insert fake, demo, or mock data just to make the application appear functional.

15. Keep all existing authentication, JWT, habit, completion, and analytics functionality intact.

16. Do not modify the React frontend at this stage.

17. Do not expose database credentials, secret keys, or connection strings anywhere in the frontend or API responses.

18. Make sure environment files containing secrets are ignored by Git and are not committed to the repository.

### Important

Before making changes, inspect the existing implementation and reuse what is already there.

Do not create duplicate database configurations, duplicate models, duplicate migrations, or duplicate services.

If something is already correctly configured, leave it unchanged.

If you encounter an error, investigate and fix the root cause instead of bypassing it with mock data or temporary hardcoded values.

### Final verification

After completing the work, verify all of the following:

* FastAPI starts successfully.
* FastAPI can connect to Supabase PostgreSQL.
* Database migrations run successfully.
* HabitFlow tables exist in Supabase.
* Existing database APIs work correctly.
* Existing authentication still works.
* Existing habit functionality still works.
* No sensitive credentials are exposed.
* No mock database or fake data is being used.
* React frontend has not been unnecessarily modified.

At the end, give me a simple summary of:

1. What you changed
2. What was already correct
3. Whether Supabase connection is working
4. Whether migrations completed successfully
5. Whether any errors remain

Do not proceed to Render deployment yet. Stop after the FastAPI → Supabase connection is successfully completed and verified.

also check backend .env file i also mention url