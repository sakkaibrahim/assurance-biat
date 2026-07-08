from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class Priority(str, Enum):
    low = "faible"
    medium = "moyenne"
    high = "haute"
    urgent = "urgente"


class Status(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"
    cancelled = "cancelled"


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    priority: Priority = Priority.medium
    estimated_duration: int | None = Field(gt=0)
    deadline: datetime | None = None
    assigned_user: str | None = None
    client_or_dossier: str | None = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(min_length=1, max_length=255)
    description: str | None = None
    priority: Priority | None = None
    estimated_duration: int | None = Field(gt=0)
    deadline: datetime | None = None
    status: Status | None = None
    assigned_user: str | None = None
    client_or_dossier: str | None = None


class TaskRead(TaskBase):
    id: int
    status: Status
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class AppointmentBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    start_datetime: datetime
    end_datetime: datetime
    client_name: str | None = None
    location: str | None = None
    status: str = "scheduled"


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    title: str | None = Field(min_length=1, max_length=255)
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None
    client_name: str | None = None
    location: str | None = None
    status: str | None = None


class AppointmentRead(AppointmentBase):
    id: int
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class NotificationBase(BaseModel):
    user_id: int
    title: str = Field(min_length=1, max_length=255)
    message: str


class NotificationCreate(NotificationBase):
    pass


class NotificationRead(NotificationBase):
    id: int
    is_read: bool = False
    created_at: datetime | None = None

    class Config:
        from_attributes = True
