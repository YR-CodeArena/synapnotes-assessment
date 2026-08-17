"""Dashboard analytics for meetings and action items."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import ActionItem, Meeting, User
from app.routers.actions import is_overdue
from app.routers.auth import get_current_user
from app.schemas import DashboardAnalytics, MeetingListOut

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardAnalytics)
def dashboard(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> DashboardAnalytics:
    meetings_query = db.query(Meeting).options(selectinload(Meeting.action_items))
    actions_query = db.query(ActionItem).join(Meeting)
    if current_user.role != "admin":
        meetings_query = meetings_query.filter(Meeting.user_id == current_user.id)
        actions_query = actions_query.filter(Meeting.user_id == current_user.id)

    meetings = meetings_query.order_by(Meeting.meeting_date.desc(), Meeting.id.desc()).all()
    actions = actions_query.all()

    recent = [
        MeetingListOut(
            id=meeting.id,
            user_id=meeting.user_id,
            title=meeting.title,
            meeting_date=meeting.meeting_date,
            meeting_type=meeting.meeting_type,
            participants=meeting.participants or [],
            summary=meeting.summary,
            ai_processed=meeting.ai_processed,
            created_at=meeting.created_at,
            updated_at=meeting.updated_at,
            action_count=len(meeting.action_items or []),
        )
        for meeting in meetings[:6]
    ]

    return DashboardAnalytics(
        total_meetings=len(meetings),
        total_actions=len(actions),
        open_actions=sum(1 for item in actions if item.status == "Open"),
        in_progress_actions=sum(1 for item in actions if item.status == "In Progress"),
        completed_actions=sum(1 for item in actions if item.status == "Completed"),
        overdue_actions=sum(1 for item in actions if is_overdue(item)),
        recent_meetings=recent,
    )
