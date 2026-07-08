from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    password: str


class UserRegister(UserCreate):
    pass


class UserRead(UserBase):
    id: int
    role: str = "client"
    is_admin: bool = False


class AuthResponse(BaseModel):
    user: UserRead
    access_token: str
    token_type: str = "bearer"

    class Config:
        from_attributes = True
