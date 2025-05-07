from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime, enum

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class TaskStatusEnum(enum.Enum):
    pending = "pending"
    completed = "completed"

class TaskPriorityEnum(enum.Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=False)
    status = Column(Enum(TaskStatusEnum), default=TaskStatusEnum.pending, nullable=False)
    priority = Column(Enum(TaskPriorityEnum), default=TaskPriorityEnum.medium, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", backref="tasks")

class CompletedTask(Base):
    __tablename__ = "completed_tasks"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, nullable=False)  # Reference to the original task
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(DateTime, nullable=False)
    priority = Column(Enum(TaskPriorityEnum), default=TaskPriorityEnum.medium, nullable=False)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", backref="completed_tasks")