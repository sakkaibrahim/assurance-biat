from __future__ import annotations

from datetime import datetime
from typing import Sequence

from app.database.db import SessionLocal
from app.database.models import OnboardingStepTable
from app.schemas.onboarding import OnboardingStepCreate, OnboardingStepUpdate, StepStatus


def _to_step_read(row: OnboardingStepTable):
    from app.schemas.onboarding import OnboardingStepRead
    return OnboardingStepRead(
        id=row.id,
        case_id=row.case_id,
        step_name=row.step_name,
        status=StepStatus(row.status),
        deadline=row.deadline,
        completed_at=row.completed_at,
        required_documents=row.required_documents,
        notes=row.notes,
        created_at=row.created_at,
    )


def list_steps(case_id: int | None = None) -> Sequence[OnboardingStepTable]:
    with SessionLocal() as session:
        query = session.query(OnboardingStepTable)
        if case_id is not None:
            query = query.filter(OnboardingStepTable.case_id == case_id)
        return query.order_by(OnboardingStepTable.deadline.is_(None), OnboardingStepTable.deadline.asc()).all()


def get_step(step_id: int) -> OnboardingStepTable | None:
    with SessionLocal() as session:
        return session.query(OnboardingStepTable).filter(OnboardingStepTable.id == step_id).first()


def create_step(payload: OnboardingStepCreate) -> OnboardingStepTable:
    with SessionLocal() as session:
        step = OnboardingStepTable(
            case_id=payload.case_id,
            step_name=payload.step_name,
            status=payload.status.value,
            deadline=payload.deadline,
            required_documents=payload.required_documents,
            notes=payload.notes,
        )
        session.add(step)
        session.commit()
        session.refresh(step)
        return step


def update_step(step_id: int, payload: OnboardingStepUpdate) -> OnboardingStepTable | None:
    with SessionLocal() as session:
        step = session.query(OnboardingStepTable).filter(OnboardingStepTable.id == step_id).first()
        if step is None:
            return None
        updates = payload.model_dump(exclude_unset=True)
        for key, value in updates.items():
            if key == "status" and value is not None:
                value = value.value
            if key == "completed_at" and value is not None:
                pass
            if value is not None:
                setattr(step, key, value)
        if payload.status == StepStatus.terminee and step.completed_at is None:
            step.completed_at = datetime.now()
        session.commit()
        session.refresh(step)
        return step


def delete_step(step_id: int) -> bool:
    with SessionLocal() as session:
        step = session.query(OnboardingStepTable).filter(OnboardingStepTable.id == step_id).first()
        if step is None:
            return False
        session.delete(step)
        session.commit()
        return True


def get_overdue_steps() -> Sequence[OnboardingStepTable]:
    with SessionLocal() as session:
        return session.query(OnboardingStepTable).filter(
            OnboardingStepTable.status.notin_(["terminee", "bloquee"]),
            OnboardingStepTable.deadline < datetime.now(),
        ).all()
