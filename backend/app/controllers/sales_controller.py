from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.domain import Client, Contract
from app.services.copilot import client_360


def get_client_360(db: Session, client_id: int) -> dict:
    return client_360(db, client_id)


def list_clients(
    db: Session,
    search: str | None = None,
    city: str | None = None,
    segment: str | None = None,
    limit: int = 24,
    offset: int = 0,
) -> dict:
    query = select(Client)
    count_query = select(func.count(Client.id))

    if search:
        like = f"%{search.strip()}%"
        query = query.where(
            (Client.full_name.ilike(like)) | (Client.email.ilike(like)) | (Client.city.ilike(like))
        )
        count_query = count_query.where(
            (Client.full_name.ilike(like)) | (Client.email.ilike(like)) | (Client.city.ilike(like))
        )
    if city:
        query = query.where(Client.city == city)
        count_query = count_query.where(Client.city == city)
    if segment:
        query = query.where(Client.segment == segment)
        count_query = count_query.where(Client.segment == segment)

    total = db.scalar(count_query) or 0
    rows = db.execute(query.order_by(Client.id).limit(limit).offset(offset)).scalars().all()

    client_ids = [c.id for c in rows]
    contract_counts = {}
    if client_ids:
        counts = db.execute(
            select(Contract.client_id, func.count(Contract.id), func.sum(Contract.premium))
            .where(Contract.client_id.in_(client_ids))
            .group_by(Contract.client_id)
        ).all()
        for cid, cnt, premium in counts:
            contract_counts[cid] = (cnt or 0, float(premium or 0))

    items = [
        {
            "id": c.id,
            "full_name": c.full_name,
            "email": c.email,
            "city": c.city,
            "segment": c.segment,
            "age": c.age,
            "income": c.income,
            "contracts_count": contract_counts.get(c.id, (0, 0))[0],
            "premium_total": round(contract_counts.get(c.id, (0, 0))[1], 2),
        }
        for c in rows
    ]

    return {"total": total, "limit": limit, "offset": offset, "items": items}


def list_facets(db: Session) -> dict:
    cities = [r[0] for r in db.execute(select(Client.city).distinct().order_by(Client.city)).all()]
    segments = [r[0] for r in db.execute(select(Client.segment).distinct().order_by(Client.segment)).all()]
    return {"cities": cities, "segments": segments}
