from datetime import datetime
from pydantic import BaseModel, Field


class ClientBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=255)
    last_name: str = Field(min_length=1, max_length=255)
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    policy_number: str | None = None
    contract_type: str | None = None
    expiration_date: datetime | None = None
    notes: str | None = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    first_name: str | None = Field(min_length=1, max_length=255)
    last_name: str | None = Field(min_length=1, max_length=255)
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    policy_number: str | None = None
    contract_type: str | None = None
    expiration_date: datetime | None = None
    notes: str | None = None


class ClientRead(ClientBase):
    id: int
    created_at: datetime | None = None

    class Config:
        from_attributes = True
