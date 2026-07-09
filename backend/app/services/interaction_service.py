from __future__ import annotations

from datetime import datetime
from typing import Sequence

from app.database.db import SessionLocal
from app.database.models import ClientInteractionTable
from app.schemas.onboarding import ClientInteractionCreate, ClientInteractionUpdate, InteractionType


def _to_interaction_read(row: ClientInteractionTable):
    from app.schemas.onboarding import ClientInteractionRead
    return ClientInteractionRead(
        id=row.id,
        case_id=row.case_id,
        interaction_type=InteractionType(row.interaction_type),
        notes=row.notes,
        interaction_date=row.interaction_date,
        next_followup_date=row.next_followup_date,
        created_by=row.created_by,
        created_at=row.created_at,
    )


def list_interactions(case_id: int | None = None) -> Sequence[ClientInteractionTable]:
    with SessionLocal() as session:
        query = session.query(ClientInteractionTable)
        if case_id is not None:
            query = query.filter(ClientInteractionTable.case_id == case_id)
        return query.order_by(ClientInteractionTable.interaction_date.desc()).all()


def get_interaction(interaction_id: int) -> ClientInteractionTable | None:
    with SessionLocal() as session:
        return session.query(ClientInteractionTable).filter(ClientInteractionTable.id == interaction_id).first()


def create_interaction(payload: ClientInteractionCreate) -> ClientInteractionTable:
    with SessionLocal() as session:
        interaction = ClientInteractionTable(
            case_id=payload.case_id,
            interaction_type=payload.interaction_type.value,
            notes=payload.notes,
            next_followup_date=payload.next_followup_date,
            created_by=payload.created_by,
        )
        session.add(interaction)
        session.commit()
        session.refresh(interaction)
        return interaction


def update_interaction(interaction_id: int, payload: ClientInteractionUpdate) -> ClientInteractionTable | None:
    with SessionLocal() as session:
        interaction = session.query(ClientInteractionTable).filter(ClientInteractionTable.id == interaction_id).first()
        if interaction is None:
            return None
        updates = payload.model_dump(exclude_unset=True)
        for key, value in updates.items():
            if key == "interaction_type" and value is not None:
                value = value.value
            if value is not None:
                setattr(interaction, key, value)
        session.commit()
        session.refresh(interaction)
        return interaction


def delete_interaction(interaction_id: int) -> bool:
    with SessionLocal() as session:
        interaction = session.query(ClientInteractionTable).filter(ClientInteractionTable.id == interaction_id).first()
        if interaction is None:
            return False
        session.delete(interaction)
        session.commit()
        return True
