from pydantic import BaseModel, EmailStr


class User(BaseModel):
    id: int | None = None
    email: EmailStr
    full_name: str | None = None
    role: str = "client"
    is_admin: bool = False
