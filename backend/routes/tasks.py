"""Tasks routing."""

from fastapi import APIRouter
from backend.models.task import TaskCreate, TaskUpdate, TaskResponse
from backend.services import task_service

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
async def list_tasks():
    return await task_service.list_tasks()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    return await task_service.get_task(task_id)


@router.post("", response_model=TaskResponse)
async def create_task(data: TaskCreate):
    return await task_service.create_task(data)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, data: TaskUpdate):
    return await task_service.update_task(task_id, data)


@router.delete("/{task_id}")
async def delete_task(task_id: str):
    await task_service.delete_task(task_id)
    return {"success": True}
