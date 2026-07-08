from fastapi import APIRouter, HTTPException

from app.schemas.task import NotificationCreate, NotificationRead
from app.services.notification_service import (
    create_notification,
    delete_notification,
    list_notifications,
    mark_notification_read,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationRead])
def get_notifications(user_id: int = 1, unread_only: bool = False):
    return list_notifications(user_id=user_id, unread_only=unread_only)


@router.post("", response_model=NotificationRead)
def create_notification_route(payload: NotificationCreate):
    return create_notification(payload)


@router.put("/{notification_id}/read")
def mark_notification_read_route(notification_id: int):
    notification = mark_notification_read(notification_id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    return {"message": "Notification marquée comme lue", "notification_id": notification_id}


@router.delete("/{notification_id}")
def delete_notification_route(notification_id: int):
    if not delete_notification(notification_id):
        raise HTTPException(status_code=404, detail="Notification introuvable")
    return {"message": "Notification supprimée avec succès"}
