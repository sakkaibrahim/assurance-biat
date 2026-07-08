from __future__ import annotations

from typing import Sequence

from app.database.db import SessionLocal
from app.database.models import ClientTable
from app.schemas.client import ClientCreate, ClientUpdate


def _to_client_read(row: ClientTable):
    return ClientRead(
        id=row.id,
        first_name=row.first_name,
        last_name=row.last_name,
        email=row.email,
        phone=row.phone,
        address=row.address,
        policy_number=row.policy_number,
        contract_type=row.contract_type,
        expiration_date=row.expiration_date,
        notes=row.notes,
        created_at=row.created_at,
    )


def list_clients() -> Sequence[ClientTable]:
    with SessionLocal() as session:
        return session.query(ClientTable).order_by(ClientTable.last_name.asc()).all()


def get_client(client_id: int) -> ClientTable | None:
    with SessionLocal() as session:
        return session.query(ClientTable).filter(ClientTable.id == client_id).first()


def create_client(payload: ClientCreate) -> ClientTable:
    with SessionLocal() as session:
        client = ClientTable(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            phone=payload.phone,
            address=payload.address,
            policy_number=payload.policy_number,
            contract_type=payload.contract_type,
            expiration_date=payload.expiration_date,
            notes=payload.notes,
        )
        session.add(client)
        session.commit()
        session.refresh(client)
        return client


def update_client(client_id: int, payload: ClientUpdate) -> ClientTable | None:
    with SessionLocal() as session:
        client = session.query(ClientTable).filter(ClientTable.id == client_id).first()
        if client is None:
            return None

        updates = payload.model_dump(exclude_unset=True)
        for key, value in updates.items():
            if value is not None:
                setattr(client, key, value)

        session.commit()
        session.refresh(client)
        return client


def delete_client(client_id: int) -> bool:
    with SessionLocal() as session:
        client = session.query(ClientTable).filter(ClientTable.id == client_id).first()
        if client is None:
            return False
        session.delete(client)
        session.commit()
        return True
