from fastapi import APIRouter, HTTPException

from app.schemas.client import ClientCreate, ClientRead, ClientUpdate
from app.services.client_service import (
    create_client,
    delete_client,
    get_client,
    list_clients,
    update_client,
)

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("", response_model=list[ClientRead])
def get_clients():
    return list_clients()


@router.get("/{client_id}", response_model=ClientRead)
def get_client_route(client_id: int):
    client = get_client(client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Client introuvable")
    return client


@router.post("", response_model=ClientRead)
def create_client_route(payload: ClientCreate):
    return create_client(payload)


@router.put("/{client_id}", response_model=ClientRead)
def update_client_route(client_id: int, payload: ClientUpdate):
    client = update_client(client_id, payload)
    if client is None:
        raise HTTPException(status_code=404, detail="Client introuvable")
    return client


@router.delete("/{client_id}")
def delete_client_route(client_id: int):
    if not delete_client(client_id):
        raise HTTPException(status_code=404, detail="Client introuvable")
    return {"message": "Client supprimé avec succès"}
