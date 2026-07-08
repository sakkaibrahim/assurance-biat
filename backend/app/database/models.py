from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func, Enum as SQLEnum, Date, Time

from app.database.db import Base


class UserTable(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    full_name = Column(String(255), nullable=True)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="client")
    is_admin = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ClientTable(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(String(500), nullable=True)
    policy_number = Column(String(255), nullable=True)
    contract_type = Column(String(255), nullable=True)
    expiration_date = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DocumentTable(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    source_path = Column(String(500), nullable=False)
    extracted_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ChatTable(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    user_question = Column(Text, nullable=False)
    assistant_answer = Column(Text, nullable=False)
    sources = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TaskTable(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(50), nullable=False, default="moyenne")
    estimated_duration = Column(Integer, nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="todo")
    assigned_user = Column(String(255), nullable=True)
    client_or_dossier = Column(String(255), nullable=True)
    client_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AppointmentTable(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    start_datetime = Column(DateTime(timezone=True), nullable=False)
    end_datetime = Column(DateTime(timezone=True), nullable=False)
    client_name = Column(String(255), nullable=True)
    client_id = Column(Integer, nullable=True)
    location = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="scheduled")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class NotificationTable(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
