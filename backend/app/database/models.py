from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, func

from app.database.db import Base


class UserTable(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    full_name = Column(String(255), nullable=True)
    password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, nullable=False, default=False)
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
