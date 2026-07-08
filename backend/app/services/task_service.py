from __future__ import annotations

from datetime import datetime
from typing import Sequence

from app.database.db import SessionLocal
from app.database.models import TaskTable
from app.schemas.task import Priority, Status, TaskCreate, TaskUpdate


def _to_task_read(row: TaskTable):
    return TaskRead(
        id=row.id,
        title=row.title,
        description=row.description,
        priority=Priority(row.priority),
        estimated_duration=row.estimated_duration,
        deadline=row.deadline,
        status=Status(row.status),
        assigned_user=row.assigned_user,
        client_or_dossier=row.client_or_dossier,
        created_at=row.created_at,
    )


def list_tasks(status: Status | None = None, priority: Priority | None = None) -> Sequence[TaskTable]:
    with SessionLocal() as session:
        query = session.query(TaskTable)
        if status is not None:
            query = query.filter(TaskTable.status == status.value)
        if priority is not None:
            query = query.filter(TaskTable.priority == priority.value)
        return query.order_by(TaskTable.deadline.is_(None), TaskTable.deadline.asc()).all()


def get_task(task_id: int) -> TaskTable | None:
    with SessionLocal() as session:
        return session.query(TaskTable).filter(TaskTable.id == task_id).first()


def create_task(payload: TaskCreate) -> TaskTable:
    with SessionLocal() as session:
        task = TaskTable(
            title=payload.title,
            description=payload.description,
            priority=payload.priority.value,
            estimated_duration=payload.estimated_duration,
            deadline=payload.deadline,
            assigned_user=payload.assigned_user,
            client_or_dossier=payload.client_or_dossier,
            status=Status.todo.value,
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return task


def update_task(task_id: int, payload: TaskUpdate) -> TaskTable | None:
    with SessionLocal() as session:
        task = session.query(TaskTable).filter(TaskTable.id == task_id).first()
        if task is None:
            return None

        updates = payload.model_dump(exclude_unset=True)
        for key, value in updates.items():
            if key in {"priority", "status"} and value is not None:
                value = value.value
            if value is not None:
                setattr(task, key, value)

        session.commit()
        session.refresh(task)
        return task


def delete_task(task_id: int) -> bool:
    with SessionLocal() as session:
        task = session.query(TaskTable).filter(TaskTable.id == task_id).first()
        if task is None:
            return False
        session.delete(task)
        session.commit()
        return True
