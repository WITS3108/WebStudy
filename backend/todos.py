"""Todo list endpoints: create, list, complete, and delete tasks."""

import sqlite3
from typing import Literal

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field

from backend.database import connect_db


router = APIRouter(prefix="/api/todos", tags=["todos"])
Priority = Literal["cao", "vừa", "thấp"]


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=250)
    tag: str = Field(default="Học tập", max_length=80)
    priority: Priority = "vừa"
    time: str = Field(default="08:00", pattern=r"^([01]\d|2[0-3]):[0-5]\d$")


class TodoUpdate(BaseModel):
    done: bool


def serialize(row: sqlite3.Row) -> dict:
    return {
        "id": str(row["id"]),
        "title": row["title"],
        "tag": row["tag"],
        "priority": row["priority"],
        "done": bool(row["done"]),
        "time": row["time"],
    }


@router.get("")
def list_todos():
    with connect_db() as connection:
        rows = connection.execute("SELECT * FROM todos ORDER BY time, id").fetchall()
    return [serialize(row) for row in rows]


@router.post("", status_code=201)
def create_todo(todo: TodoCreate):
    title = todo.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Tên nhiệm vụ không được để trống.")
    tag = todo.tag.strip() or "Học tập"
    with connect_db() as connection:
        cursor = connection.execute(
            "INSERT INTO todos (title, tag, priority, done, time) VALUES (?, ?, ?, 0, ?)",
            (title, tag, todo.priority, todo.time),
        )
        row = connection.execute(
            "SELECT * FROM todos WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
    return serialize(row)


@router.patch("/{todo_id}")
def update_todo(todo_id: int, update: TodoUpdate):
    with connect_db() as connection:
        cursor = connection.execute(
            "UPDATE todos SET done = ? WHERE id = ?", (int(update.done), todo_id)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhiệm vụ.")
        row = connection.execute("SELECT * FROM todos WHERE id = ?", (todo_id,)).fetchone()
    return serialize(row)


@router.delete("/completed", status_code=204)
def delete_completed_todos():
    with connect_db() as connection:
        connection.execute("DELETE FROM todos WHERE done = 1")
    return Response(status_code=204)


@router.delete("/{todo_id}", status_code=204)
def delete_todo(todo_id: int):
    with connect_db() as connection:
        cursor = connection.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Không tìm thấy nhiệm vụ.")
    return Response(status_code=204)
