from datetime import date, datetime
from enum import Enum

from sqlalchemy import Date, DateTime, Enum as SqlEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class ProductType(str, Enum):
    auto = "auto"
    home = "home"
    health = "health"
    life = "life"
    travel = "travel"
    business = "business"


class ClaimStatus(str, Enum):
    open = "open"
    approved = "approved"
    rejected = "rejected"
    paid = "paid"


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160), index=True)
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    city: Mapped[str] = mapped_column(String(80), index=True)
    segment: Mapped[str] = mapped_column(String(40), index=True)
    age: Mapped[int] = mapped_column(Integer)
    income: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    contracts: Mapped[list["Contract"]] = relationship(back_populates="client")
    claims: Mapped[list["Claim"]] = relationship(back_populates="client")
    interactions: Mapped[list["Interaction"]] = relationship(back_populates="client")


class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), index=True)
    product: Mapped[ProductType] = mapped_column(SqlEnum(ProductType), index=True)
    premium: Mapped[float] = mapped_column(Float)
    coverage_amount: Mapped[float] = mapped_column(Float)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(30), index=True)
    region_risk_score: Mapped[float] = mapped_column(Float, default=0.2)

    client: Mapped[Client] = relationship(back_populates="contracts")
    payments: Mapped[list["Payment"]] = relationship(back_populates="contract")


class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), index=True)
    product: Mapped[ProductType] = mapped_column(SqlEnum(ProductType), index=True)
    status: Mapped[ClaimStatus] = mapped_column(SqlEnum(ClaimStatus), index=True)
    amount: Mapped[float] = mapped_column(Float)
    claim_date: Mapped[date] = mapped_column(Date)
    description: Mapped[str] = mapped_column(Text)

    client: Mapped[Client] = relationship(back_populates="claims")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    contract_id: Mapped[int] = mapped_column(ForeignKey("contracts.id"), index=True)
    amount: Mapped[float] = mapped_column(Float)
    due_date: Mapped[date] = mapped_column(Date)
    paid_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(30), index=True)

    contract: Mapped[Contract] = relationship(back_populates="payments")


class Interaction(Base):
    __tablename__ = "interactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), index=True)
    channel: Mapped[str] = mapped_column(String(40))
    intent: Mapped[str] = mapped_column(String(80), index=True)
    sentiment: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    notes: Mapped[str] = mapped_column(Text)

    client: Mapped[Client] = relationship(back_populates="interactions")

