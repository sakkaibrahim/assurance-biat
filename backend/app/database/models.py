from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, func, Enum as SQLEnum, Date, Time

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


class OnboardingCaseTable(Base):
    __tablename__ = "onboarding_cases"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, nullable=True)
    client_name = Column(String(255), nullable=False)
    client_email = Column(String(255), nullable=True)
    client_phone = Column(String(50), nullable=True)
    product_type = Column(String(100), nullable=False)
    current_step = Column(Integer, nullable=False, default=1)
    status = Column(String(50), nullable=False, default="en_cours")
    start_date = Column(DateTime(timezone=True), nullable=True)
    expected_completion_date = Column(DateTime(timezone=True), nullable=True)
    assigned_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class OnboardingStepTable(Base):
    __tablename__ = "onboarding_steps"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, nullable=False, index=True)
    step_name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="a_faire")
    deadline = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    required_documents = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ClientInteractionTable(Base):
    __tablename__ = "client_interactions"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, nullable=False, index=True)
    interaction_type = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    interaction_date = Column(DateTime(timezone=True), server_default=func.now())
    next_followup_date = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DropoffRiskScoreTable(Base):
    __tablename__ = "dropoff_risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, nullable=False, index=True)
    risk_score = Column(Float, nullable=False, default=0.0)
    risk_level = Column(String(50), nullable=False, default="faible")
    risk_factors = Column(Text, nullable=True)
    suggested_action = Column(Text, nullable=True)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
