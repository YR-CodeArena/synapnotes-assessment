"""Meeting CRUD with automatic AI extraction."""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from app.ai_service import process_meeting_transcript
from app.database import get_db
from app.models import ActionItem, Meeting, User
from app.routers.auth import get_current_user
from app.schemas import MeetingCreate, MeetingListOut, MeetingOut, MeetingUpdate

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


def _apply_extraction(meeting: Meeting, db: Session, replace_actions: bool) -> None:
    result = process_meeting_transcript(meeting.raw_transcript or "", meeting.title)
    meeting.summary = result.get("summary")
    meeting.decisions = result.get("decisions") or []
    meeting.risks = result.get("risks") or []
    meeting.unanswered_questions = result.get("unanswered_questions") or []
    meeting.ai_processed = True
    if replace_actions:
        db.query(ActionItem).filter(ActionItem.meeting_id == meeting.id).delete()
    for item in result.get("action_items") or []:
        db.add(
            ActionItem(
                meeting_id=meeting.id,
                task_description=item["task_description"],
                owner=item.get("owner") or "Unassigned",
                due_date=item.get("due_date") or "Not specified",
                priority=item.get("priority") or "Medium",
                status=item.get("status") or "Open",
            )
        )


def _visible_query(db: Session, user: User):
    query = db.query(Meeting).options(selectinload(Meeting.action_items))
    if user.role != "admin":
        query = query.filter(Meeting.user_id == user.id)
    return query


def _ensure_access(meeting: Meeting, user: User) -> None:
    if user.role != "admin" and meeting.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def _to_list_item(meeting: Meeting) -> MeetingListOut:
    return MeetingListOut(
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


@router.get("", response_model=list[MeetingListOut])
def list_meetings(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    search: Optional[str] = Query(default=None),
    meeting_type: Optional[str] = Query(default=None),
) -> list[MeetingListOut]:
    query = _visible_query(db, current_user)
    if meeting_type and meeting_type != "All":
        query = query.filter(Meeting.meeting_type == meeting_type)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Meeting.title.ilike(term),
                Meeting.raw_transcript.ilike(term),
                Meeting.notes.ilike(term),
            )
        )
    meetings = query.order_by(Meeting.meeting_date.desc(), Meeting.id.desc()).all()
    if search:
        needle = search.strip().lower()
        meetings = [
            meeting
            for meeting in meetings
            if needle in (meeting.title or "").lower()
            or needle in (meeting.raw_transcript or "").lower()
            or any(needle in (person or "").lower() for person in (meeting.participants or []))
        ]
    return [_to_list_item(meeting) for meeting in meetings]


@router.post("", response_model=MeetingOut, status_code=status.HTTP_201_CREATED)
def create_meeting(
    payload: MeetingCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> MeetingOut:
    meeting = Meeting(
        user_id=current_user.id,
        title=payload.title.strip(),
        meeting_date=payload.meeting_date,
        meeting_type=payload.meeting_type,
        participants=payload.participants,
        raw_transcript=payload.raw_transcript or "",
        notes=payload.notes or "",
        summary=None,
        decisions=[],
        risks=[],
        unanswered_questions=[],
        ai_processed=False,
    )
    db.add(meeting)
    db.flush()
    _apply_extraction(meeting, db, replace_actions=False)
    db.commit()
    meeting = (
        db.query(Meeting)
        .options(selectinload(Meeting.action_items))
        .filter(Meeting.id == meeting.id)
        .first()
    )
    return MeetingOut.model_validate(meeting)


@router.get("/{meeting_id}", response_model=MeetingOut)
def get_meeting(
    meeting_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> MeetingOut:
    meeting = (
        db.query(Meeting)
        .options(selectinload(Meeting.action_items))
        .filter(Meeting.id == meeting_id)
        .first()
    )
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    _ensure_access(meeting, current_user)
    return MeetingOut.model_validate(meeting)


@router.put("/{meeting_id}", response_model=MeetingOut)
def update_meeting(
    meeting_id: int,
    payload: MeetingUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> MeetingOut:
    meeting = (
        db.query(Meeting)
        .options(selectinload(Meeting.action_items))
        .filter(Meeting.id == meeting_id)
        .first()
    )
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    _ensure_access(meeting, current_user)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(meeting, key, value)
    db.commit()
    db.refresh(meeting)
    return MeetingOut.model_validate(meeting)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(
    meeting_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    meeting = db.get(Meeting, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    _ensure_access(meeting, current_user)
    db.delete(meeting)
    db.commit()


@router.post("/{meeting_id}/reprocess-ai", response_model=MeetingOut)
def reprocess_ai(
    meeting_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> MeetingOut:
    meeting = (
        db.query(Meeting)
        .options(selectinload(Meeting.action_items))
        .filter(Meeting.id == meeting_id)
        .first()
    )
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    _ensure_access(meeting, current_user)
    _apply_extraction(meeting, db, replace_actions=True)
    db.commit()
    meeting = (
        db.query(Meeting)
        .options(selectinload(Meeting.action_items))
        .filter(Meeting.id == meeting.id)
        .first()
    )
    return MeetingOut.model_validate(meeting)
