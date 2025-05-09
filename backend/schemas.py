from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class TaskPriority(Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"

class TaskStatus(Enum):
    pending = "pending"
    completed = "completed"

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: datetime
    priority: TaskPriority = TaskPriority.medium

class TaskCreate(TaskBase):
    user_id: int

class TaskUpdate(TaskBase):
    status: TaskStatus

class Task(TaskBase):
    id: int
    status: TaskStatus
    user_id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_admin: bool

    class Config:
        orm_mode = True

class CompletedTask(BaseModel):
    id: int
    task_id: int
    title: str
    description: Optional[str] = None
    due_date: datetime
    priority: TaskPriority
    completed_at: datetime
    user_id: int

    class Config:
        orm_mode = True

class EmailSchema(BaseModel):
    email: str

class PasswordResetSchema(BaseModel):
    email: str
    code: str
    password: str