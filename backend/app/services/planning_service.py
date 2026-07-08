from __future__ import annotations

from datetime import datetime, timedelta
from typing import Sequence

from app.database.db import SessionLocal
from app.database.models import AppointmentTable, TaskTable
from app.schemas.task import Priority, Status
from app.services.task_service import list_tasks


WORK_START = 8
WORK_END = 17
PAUSE_DURATION = timedelta(minutes=15)


def _remaining_work_minutes(task_duration_minutes: int, already_worked_minutes: int) -> int:
    return max(task_duration_minutes - already_worked_minutes, 0)


def build_daily_plan(target_date: datetime) -> dict:
    tasks = list_tasks()
    pending_tasks = [
        task for task in tasks
        if task.status in {Status.todo.value, Status.in_progress.value}
        and (task.deadline is None or task.deadline.date() >= target_date.date())
    ]

    priority_order = {Priority.urgent.value: 0, Priority.high.value: 1, Priority.medium.value: 2, Priority.low.value: 3}
    pending_tasks.sort(key=lambda task: (
        priority_order.get(task.priority, 99),
        task.deadline or datetime.max,
        task.estimated_duration or 0,
    ))

    current_time = datetime(target_date.year, target_date.month, target_date.day, WORK_START, 0)
    end_of_day = datetime(target_date.year, target_date.month, target_date.day, WORK_END, 0)
    slots = []

    for task in pending_tasks:
        if current_time >= end_of_day:
            break

        duration = timedelta(minutes=task.estimated_duration or 60)
        slot_end = current_time + duration

        if slot_end > end_of_day:
            duration = end_of_day - current_time
            if duration.total_seconds() <= 0:
                break

        slots.append({
            "task_id": task.id,
            "title": task.title,
            "start": current_time,
            "end": current_time + duration,
            "priority": task.priority,
            "estimated_duration": task.estimated_duration,
        })

        current_time = current_time + duration + PAUSE_DURATION

    return {
        "date": target_date.date().isoformat(),
        "work_window": {"start": f"{WORK_START:02d}:00", "end": f"{WORK_END:02d}:00"},
        "slots": slots,
        "pending_count": len(pending_tasks),
        "scheduled_count": len(slots),
    }


def generate_weekly_summary() -> dict:
    today = datetime.now()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    with SessionLocal() as session:
        tasks = session.query(TaskTable).filter(TaskTable.created_at >= week_start).all()
        appointments = session.query(AppointmentTable).filter(AppointmentTable.start_datetime >= week_start).all()

    completed = [task for task in tasks if task.status == Status.done.value]
    pending = [task for task in tasks if task.status in {Status.todo.value, Status.in_progress.value}]

    return {
        "week_start": week_start.date().isoformat(),
        "week_end": week_end.date().isoformat(),
        "total_tasks": len(tasks),
        "completed_tasks": len(completed),
        "pending_tasks": len(pending),
        "appointments_count": len(appointments),
        "completion_rate": round((len(completed) / len(tasks)) * 100, 1) if tasks else 0.0,
    }
