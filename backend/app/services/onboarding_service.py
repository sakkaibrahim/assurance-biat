from __future__ import annotations

from datetime import datetime
from typing import Sequence

from app.database.db import SessionLocal
from app.database.models import OnboardingCaseTable
from app.schemas.onboarding import OnboardingCaseCreate, OnboardingCaseUpdate


def _to_case_read(row: OnboardingCaseTable):
    from app.schemas.onboarding import OnboardingCaseRead, OnboardingStatus
    return OnboardingCaseRead(
        id=row.id,
        client_name=row.client_name,
        client_email=row.client_email,
        client_phone=row.client_phone,
        product_type=row.product_type,
        current_step=row.current_step,
        status=OnboardingStatus(row.status),
        expected_completion_date=row.expected_completion_date,
        assigned_agent=row.assigned_agent,
        start_date=row.start_date,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def list_cases(product_type: str | None = None, status: str | None = None, agent: str | None = None) -> Sequence[OnboardingCaseTable]:
    with SessionLocal() as session:
        query = session.query(OnboardingCaseTable)
        if product_type:
            query = query.filter(OnboardingCaseTable.product_type == product_type)
        if status:
            query = query.filter(OnboardingCaseTable.status == status)
        if agent:
            query = query.filter(OnboardingCaseTable.assigned_agent == agent)
        return query.order_by(OnboardingCaseTable.created_at.desc()).all()


def get_case(case_id: int) -> OnboardingCaseTable | None:
    with SessionLocal() as session:
        return session.query(OnboardingCaseTable).filter(OnboardingCaseTable.id == case_id).first()


def create_case(payload: OnboardingCaseCreate) -> OnboardingCaseTable:
    with SessionLocal() as session:
        case = OnboardingCaseTable(
            client_name=payload.client_name,
            client_email=payload.client_email,
            client_phone=payload.client_phone,
            product_type=payload.product_type,
            current_step=payload.current_step,
            status="en_cours",
            expected_completion_date=payload.expected_completion_date,
            assigned_agent=payload.assigned_agent,
            start_date=datetime.now(),
        )
        session.add(case)
        session.commit()
        session.refresh(case)
        return case


def update_case(case_id: int, payload: OnboardingCaseUpdate) -> OnboardingCaseTable | None:
    with SessionLocal() as session:
        case = session.query(OnboardingCaseTable).filter(OnboardingCaseTable.id == case_id).first()
        if case is None:
            return None
        updates = payload.model_dump(exclude_unset=True)
        for key, value in updates.items():
            if key == "status" and value is not None:
                value = value.value
            if value is not None:
                setattr(case, key, value)
        session.commit()
        session.refresh(case)
        return case


def delete_case(case_id: int) -> bool:
    with SessionLocal() as session:
        case = session.query(OnboardingCaseTable).filter(OnboardingCaseTable.id == case_id).first()
        if case is None:
            return False
        session.delete(case)
        session.commit()
        return True
