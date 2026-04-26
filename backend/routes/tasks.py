"""Tasks routing."""

from fastapi import APIRouter, Header, HTTPException
from backend.models.task import TaskCreate, TaskUpdate, TaskResponse
from backend.services import task_service
from backend.services import vault_service
from backend.storage import store

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


async def _require_vault_access_for_task(task_id: str, x_vault_token: str | None) -> None:
    """Check vault access if task is linked to vault-protected note."""
    task = await task_service.get_task(task_id)
    if task.get("note_id"):
        note = await store.read_note(task["note_id"])
        if note and note.get("is_vault"):
            if not x_vault_token or not vault_service.verify_token(x_vault_token):
                raise HTTPException(status_code=403, detail="Vault access required")


@router.get("", response_model=list[TaskResponse])
async def list_tasks(x_vault_token: str | None = Header(None)):
    token = x_vault_token if x_vault_token and vault_service.verify_token(x_vault_token) else None
    return await task_service.list_tasks(token)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, x_vault_token: str | None = Header(None)):
    await _require_vault_access_for_task(task_id, x_vault_token)
    return await task_service.get_task(task_id)


@router.post("", response_model=TaskResponse)
async def create_task(data: TaskCreate, x_vault_token: str | None = Header(None)):
    if data.note_id:
        note = await store.read_note(data.note_id)
        if note and note.get("is_vault"):
            if not x_vault_token or not vault_service.verify_token(x_vault_token):
                raise HTTPException(status_code=403, detail="Vault access required")
    return await task_service.create_task(data)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, data: TaskUpdate, x_vault_token: str | None = Header(None)):
    await _require_vault_access_for_task(task_id, x_vault_token)
    return await task_service.update_task(task_id, data)


@router.delete("/{task_id}")
async def delete_task(task_id: str, x_vault_token: str | None = Header(None)):
    await _require_vault_access_for_task(task_id, x_vault_token)
    await task_service.delete_task(task_id)
    return {"success": True}
