"""SQLite connection and schema setup shared by the API modules."""

from pathlib import Path
import sqlite3


DB_PATH = Path(__file__).with_name("todos.sqlite3")


def connect_db() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    with connect_db() as connection:
        connection.execute(
            """CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                tag TEXT NOT NULL DEFAULT 'Học tập',
                priority TEXT NOT NULL CHECK(priority IN ('cao', 'vừa', 'thấp')),
                done INTEGER NOT NULL DEFAULT 0,
                time TEXT NOT NULL DEFAULT '08:00'
            )"""
        )
        connection.execute(
            """CREATE TABLE IF NOT EXISTS study_daily (
                day TEXT PRIMARY KEY,
                seconds INTEGER NOT NULL DEFAULT 0 CHECK(seconds >= 0)
            )"""
        )

        todo_count = connection.execute("SELECT COUNT(*) FROM todos").fetchone()[0]
        if todo_count == 0:
            connection.executemany(
                "INSERT INTO todos (title, tag, priority, done, time) VALUES (?, ?, ?, ?, ?)",
                [
                    ("Ôn 30 thẻ từ vựng IELTS", "Tiếng Anh", "cao", 1, "07:30"),
                    ("Làm bài tập Giải tích chương 4", "Toán", "cao", 1, "09:00"),
                    ("Đọc tài liệu Cơ sở dữ liệu (20 trang)", "CSDL", "vừa", 0, "14:00"),
                    ("Viết dàn ý bài luận Lịch sử", "Lịch sử", "vừa", 0, "16:30"),
                    ("Tổng kết ghi chú trong ngày", "Thói quen", "thấp", 0, "21:00"),
                ],
            )
