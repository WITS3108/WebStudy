"""Study time recording, weekly totals, and daily streak calculation."""

from datetime import date, datetime, timedelta

from fastapi import APIRouter, Response
from pydantic import BaseModel, Field

from backend.database import connect_db


router = APIRouter(prefix="/api/study", tags=["study stats"])
STREAK_GOAL_SECONDS = 15 * 60


class StudyTimeRecord(BaseModel):
    seconds: int = Field(ge=1, le=43200)
    study_date: date


@router.post("/record", status_code=204)
def record_study_time(record: StudyTimeRecord):
    with connect_db() as connection:
        connection.execute(
            """INSERT INTO study_daily (day, seconds) VALUES (?, ?)
               ON CONFLICT(day) DO UPDATE SET seconds = seconds + excluded.seconds""",
            (record.study_date.isoformat(), record.seconds),
        )
    return Response(status_code=204)


@router.get("/stats")
def get_study_stats(today: date | None = None):
    current_day = today or datetime.now().astimezone().date()
    monday = current_day - timedelta(days=current_day.weekday())
    with connect_db() as connection:
        rows = connection.execute(
            "SELECT day, seconds FROM study_daily WHERE day <= ?",
            (current_day.isoformat(),),
        ).fetchall()

    totals = {date.fromisoformat(row["day"]): row["seconds"] for row in rows}
    studied_days = {
        day for day, seconds in totals.items() if seconds >= STREAK_GOAL_SECONDS
    }

    # Keep yesterday's streak during today, until today ends without reaching its goal.
    cursor = current_day if current_day in studied_days else current_day - timedelta(days=1)
    streak = 0
    while cursor in studied_days:
        streak += 1
        cursor -= timedelta(days=1)

    labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
    week = []
    for offset, label in enumerate(labels):
        day = monday + timedelta(days=offset)
        seconds = totals.get(day, 0)
        week.append(
            {
                "date": day.isoformat(),
                "label": label,
                "seconds": seconds,
                "studied": day in studied_days,
                "is_today": day == current_day,
            }
        )

    today_seconds = totals.get(current_day, 0)
    return {
        "today_seconds": today_seconds,
        "week_seconds": sum(item["seconds"] for item in week),
        "streak_days": streak,
        "streak_goal_seconds": STREAK_GOAL_SECONDS,
        "week": week,
    }
