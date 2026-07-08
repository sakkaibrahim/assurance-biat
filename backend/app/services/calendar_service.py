from __future__ import annotations

from datetime import datetime
from typing import Sequence

from app.database.db import SessionLocal
from app.database.models import AppointmentTable
from app.schemas.task import AppointmentCreate, AppointmentUpdate, AppointmentRead


def _to_appointment_read(row: AppointmentTable):
    return AppointmentRead(
        id=row.id,
        title=row.title,
        start_datetime=row.start_datetime,
        end_datetime=row.end_datetime,
        client_name=row.client_name,
        location=row.location,
        status=row.status,
        created_at=row.created_at,
    )


def list_appointments(start_date: datetime | None = None, end_date: datetime | None = None) -> Sequence[AppointmentTable]:
    with SessionLocal() as session:
        query = session.query(AppointmentTable)
        if start_date is not None:
            query = query.filter(AppointmentTable.start_datetime >= start_date)
        if end_date is not None:
            query = query.filter(AppointmentTable.end_datetime <= end_date)
        return query.order_by(AppointmentTable.start_datetime.asc()).all()


def get_appointment(appointment_id: int) -> AppointmentTable | None:
    with SessionLocal() as session:
        return session.query(AppointmentTable).filter(AppointmentTable.id == appointment_id).first()


def create_appointment(payload: AppointmentCreate) -> AppointmentTable:
    with SessionLocal() as session:
        appointment = AppointmentTable(
            title=payload.title,
            start_datetime=payload.start_datetime,
            end_datetime=payload.end_datetime,
            client_name=payload.client_name,
            location=payload.location,
            status=payload.status,
        )
        session.add(appointment)
        session.commit()
        session.refresh(appointment)
        return appointment


def update_appointment(appointment_id: int, payload: AppointmentUpdate) -> AppointmentTable | None:
    with SessionLocal() as session:
        appointment = session.query(AppointmentTable).filter(AppointmentTable.id == appointment_id).first()
        if appointment is None:
            return None

        updates = payload.model_dump(exclude_unset=True)
        for key, value in updates.items():
            if value is not None:
                setattr(appointment, key, value)

        session.commit()
        session.refresh(appointment)
        return appointment


def delete_appointment(appointment_id: int) -> bool:
    with SessionLocal() as session:
        appointment = session.query(AppointmentTable).filter(AppointmentTable.id == appointment_id).first()
        if appointment is None:
            return False
        session.delete(appointment)
        session.commit()
        return True
