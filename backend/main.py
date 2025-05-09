from fastapi import FastAPI, Depends, HTTPException, Request, Response, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from datetime import datetime
from enum import Enum
import os

from database import SessionLocal, engine
import models
import schemas
from auth import sign_up, confirm_sign_up, login, forgot_password, confirm_forgot_password

# WARNING: The following code drops all tables (with CASCADE) and then creates them.
# Do NOT use this in production as it will delete your existing data.
with engine.begin() as connection:
    for table in reversed(models.Base.metadata.sorted_tables):
        connection.execute(text(f"DROP TABLE IF EXISTS {table.name} CASCADE"))
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["http://54.219.163.27", "http://54.219.163.27:80", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

class AuthDetails(BaseModel):
    email: str
    password: str

class ConfirmDetails(BaseModel):
    email: str
    code: str

class EventCreate(BaseModel):
    title: str
    description: str
    date: str

class TaskStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"

class TaskCreate(BaseModel):
    title: str
    description: str
    due_date: datetime
    status: TaskStatus = TaskStatus.PENDING

class TaskUpdate(BaseModel):
    title: str
    description: str
    due_date: datetime
    status: TaskStatus = TaskStatus.PENDING

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def create_default_user():
    db = SessionLocal()
    default_user = db.query(models.User).filter(models.User.id == 1).first()
    if not default_user:
        default_user = models.User(id=1, email="test@example.com", hashed_password="testpassword")
        db.add(default_user)
        db.commit()
        db.refresh(default_user)
        print("Default user with id=1 created")
    db.close()

@app.post("/auth/signup")
def signup_endpoint(auth_details: AuthDetails):
    if len(auth_details.password) < 8:
        raise HTTPException(status_code=400, detail="Password is not strong enough")
    result = sign_up(auth_details.email, auth_details.password)
    return {"message": "Signup successful. A verification code has been sent to your email.", "result": result}

@app.post("/auth/confirm")
def confirm_endpoint(confirm_details: ConfirmDetails):
    result = confirm_sign_up(confirm_details.email, confirm_details.code)
    return {"message": "Signup confirmed. You can now log in.", "result": result}

@app.post("/auth/login")
def login_endpoint(auth_details: AuthDetails):
    try:
        result = login(auth_details.email, auth_details.password)
        auth_result = result.get("AuthenticationResult")
        if not auth_result:
            raise HTTPException(status_code=400, detail="Authentication failed")
            
        access_token = auth_result.get("AccessToken")
        id_token = auth_result.get("IdToken")
        refresh_token = auth_result.get("RefreshToken", None)
        
        response = JSONResponse({"message": "Login successful"})
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            path="/",
            domain="54.219.163.27",
            max_age=3600
        )
        response.set_cookie(
            key="id_token",
            value=id_token,
            httponly=True,
            secure=False,
            samesite="lax",
            path="/",
            max_age=3600
        )
        if refresh_token:
            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=False,
                samesite="lax",
                path="/",
                max_age=86400
            )
        return response
    except HTTPException as e:
        raise e

@app.get("/auth/session")
def session_endpoint(request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"message": "Session active"}

@app.post("/auth/logout")
def logout_endpoint(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("id_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logout successful"}

@app.get("/tasks/dashboard")
def get_dashboard(user_id: int = Query(...), db: Session = Depends(get_db)):
    active_tasks_count = db.query(models.Task).filter(models.Task.user_id == user_id).count()
    # Count completed tasks from the history table
    completed_tasks_count = db.query(models.CompletedTask).filter(models.CompletedTask.user_id == user_id).count()
    
    total = active_tasks_count + completed_tasks_count
    pending = active_tasks_count  # tasks table holds only pending tasks now
    completion_rate = (completed_tasks_count / total * 100) if total > 0 else 0
    
    return {
        "total": total,
        "pending": pending,
        "completed": completed_tasks_count,
        "completion_rate": completion_rate
    }

@app.get("/completed-tasks")
def get_completed_tasks(user_id: int = Query(...), db: Session = Depends(get_db)):
    completed_tasks = db.query(models.CompletedTask).filter(models.CompletedTask.user_id == user_id).all()
    return completed_tasks

@app.get("/tasks/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db)):
    task_obj = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task_obj:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_obj

@app.get("/tasks/")
def get_tasks(user_id: int, page: int = 1, per_page: int = 10, db: Session = Depends(get_db)):
    offset = (page - 1) * per_page
    query = db.query(models.Task).filter(models.Task.user_id == user_id).order_by(models.Task.due_date)
    tasks = query.offset(offset).limit(per_page).all()
    total_tasks = query.count()
    total_pages = (total_tasks + per_page - 1) // per_page
    return {"tasks": tasks, "totalPages": total_pages}

@app.post("/tasks/")
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(
         title=task.title,
         description=task.description,
         due_date=task.due_date,
         status="pending",
         user_id=task.user_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    task_obj = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task_obj:
        raise HTTPException(status_code=404, detail="Task not found")
    
    previous_status = task_obj.status

    task_obj.title = task.title
    task_obj.description = task.description
    task_obj.due_date = task.due_date
    task_obj.priority = models.TaskPriorityEnum(task.priority.value)
    task_obj.status = models.TaskStatusEnum(task.status.value)
    db.commit()

    if previous_status != models.TaskStatusEnum.completed and task_obj.status == models.TaskStatusEnum.completed:
        completed_task = models.CompletedTask(
            task_id=task_obj.id,
            title=task_obj.title,
            description=task_obj.description,
            due_date=task_obj.due_date,
            priority=task_obj.priority,
            user_id=task_obj.user_id,
            completed_at=datetime.utcnow()
        )
        db.add(completed_task)
        db.delete(task_obj)
        db.commit()
        return completed_task

    return task_obj

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
         raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted"}

@app.post("/auth/forgot-password")
def forgot_password_endpoint(email_data: schemas.EmailSchema):
    try:
        response = forgot_password(email_data.email)
        return {"message": "Password reset code sent to your email"}
    except Exception as e:
        print(f"Forgot password error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/reset-password")
def reset_password_endpoint(reset_data: schemas.PasswordResetSchema):
    response = confirm_forgot_password(
        reset_data.email, 
        reset_data.code, 
        reset_data.password
    )
    return {"message": "Password has been reset successfully"}