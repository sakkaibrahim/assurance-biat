from fastapi import APIRouter

from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services.task_service import (
    create_task,
    delete_task,
    get_task,
    list_tasks,
    update_task,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskRead])
def get_tasks(status: str | None = None, priority: str | None = None):
    from app.schemas.task import Priority, Status
    status_enum = Status(status) if status else None
    priority_enum = Priority(priority) if priority else None
    return list_tasks(status=status_enum, priority=priority_enum)


@router.get("/{task_id}", response_model=TaskRead)
def get_task_route(task_id: int):
    task = get_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    return task


@router.post("", response_model=TaskRead)
def create_task_route(payload: TaskCreate):
    task = create_task(payload)
    return task


@router.put("/{task_id}", response_model=TaskRead)
def update_task_route(task_id: int, payload: TaskUpdate):
    task = update_task(task_id, payload)
    if task is None:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    return task


@router.delete("/{task_id}")
def delete_task_route(task_id: int):
    if not delete_task(task_id):
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    return {"message": "Tâche supprimée avec succès"}
