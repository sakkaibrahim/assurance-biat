from fastapi import APIRouter

from app.schemas.task import AppointmentCreate, AppointmentRead, AppointmentUpdate
from app.services.calendar_service import (
    create_appointment,
    delete_appointment,
    get_appointment,
    list_appointments,
    update_appointment,
)

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("", response_model=list[AppointmentRead])
def get_appointments(start_date: str | None = None, end_date: str | None = None):
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None
    return list_appointments(start, end)


@router.get("/{appointment_id}", response_model=AppointmentRead)
def get_appointment_route(appointment_id: int):
    appointment = get_appointment(appointment_id)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")
    return appointment


@router.post("", response_model=AppointmentRead)
def create_appointment_route(payload: AppointmentCreate):
    return create_appointment(payload)


@router.put("/{appointment_id}", response_model=AppointmentRead)
def update_appointment_route(appointment_id: int, payload: AppointmentUpdate):
    appointment = update_appointment(appointment_id, payload)
    if appointment is None:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")
    return appointment


@router.delete("/{appointment_id}")
def delete_appointment_route(appointment_id: int):
    if not delete_appointment(appointment_id):
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")
    return {"message": "Rendez-vous supprimé avec succès"}
