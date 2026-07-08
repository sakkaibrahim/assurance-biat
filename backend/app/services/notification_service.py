from __future__ import annotations

from datetime import datetime
from typing import Sequence

from app.database.db import SessionLocal
from app.database.models import NotificationTable
from app.schemas.task import NotificationCreate, NotificationRead


def _to_notification_read(row: NotificationTable) -> NotificationRead:
    return NotificationRead(
        id=row.id,
        user_id=row.user_id,
        title=row.title,
        message=row.message,
        is_read=row.is_read,
        created_at=row.created_at,
    )


def create_notification(payload: NotificationCreate) -> NotificationTable:
    with SessionLocal() as session:
        notification = NotificationTable(
            user_id=payload.user_id,
            title=payload.title,
            message=payload.message,
            is_read=False,
        )
        session.add(notification)
        session.commit()
        session.refresh(notification)
        return notification


def list_notifications(user_id: int, unread_only: bool = False) -> Sequence[NotificationTable]:
    with SessionLocal() as session:
        query = session.query(NotificationTable).filter(NotificationTable.user_id == user_id)
        if unread_only:
            query = query.filter(NotificationTable.is_read.is_(False))
        return query.order_by(NotificationTable.created_at.desc()).all()


def mark_notification_read(notification_id: int) -> NotificationTable | None:
    with SessionLocal() as session:
        notification = session.query(NotificationTable).filter(NotificationTable.id == notification_id).first()
        if notification is None:
            return None
        notification.is_read = True
        session.commit()
        session.refresh(notification)
        return notification


def delete_notification(notification_id: int) -> bool:
    with SessionLocal() as session:
        notification = session.query(NotificationTable).filter(NotificationTable.id == notification_id).first()
        if notification is None:
            return False
        session.delete(notification)
        session.commit()
        return True
