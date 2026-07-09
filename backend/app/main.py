from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.api.users import router as users_router
from app.api.tasks import router as tasks_router
from app.api.planning import router as planning_router
from app.api.calendar import router as calendar_router
from app.api.notifications import router as notifications_router
from app.api.clients import router as clients_router
from app.api.onboarding import router as onboarding_router
from app.api.steps import router as steps_router
from app.api.interactions import router as interactions_router
from app.api.risk_scores import router as risk_scores_router
from app.api.dashboard import router as dashboard_router
from app.database.db import Base, engine
from app.database import models as db_models  # noqa: F401
from app.utils.config import get_settings
from app.services.auth_service import ensure_default_admin

settings = get_settings()
app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
ensure_default_admin()

app.include_router(auth_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(planning_router, prefix="/api")
app.include_router(calendar_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(clients_router, prefix="/api")
app.include_router(onboarding_router, prefix="/api")
app.include_router(steps_router, prefix="/api")
app.include_router(interactions_router, prefix="/api")
app.include_router(risk_scores_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")




@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.app_name}
