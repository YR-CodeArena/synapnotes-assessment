"""Action item CRUD with status, owner, priority, and overdue filters."""

from datetime import date, datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import ActionItem, Meeting, User
from app.routers.auth import get_current_user
from app.schemas import ActionItemCreate, ActionItemOut, ActionItemUpdate

router = APIRouter(prefix="/api/actions", tags=["actions"])


def parse_due_date(value: str) -> Optional[date]:
    if not value or value.strip().lower() in {"not specified", "n/a", "none"}:
        return None
    text = value.strip()
    for fmt in ("%Y-%m-%d", "%d %B %Y", "%d %b %Y", "%B %d, %Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def is_overdue(item: ActionItem) -> bool:
    if item.status == "Completed":
        return False
    parsed = parse_due_date(item.due_date)
    if parsed is None:
        return False
    return parsed < date.today()


def serialize(item: ActionItem) -> ActionItemOut:
    return ActionItemOut(
        id=item.id,
        meeting_id=item.meeting_id,
        task_description=item.task_description,
        owner=item.owner,
        due_date=item.due_date,
        priority=item.priority,
        status=item.status,
        created_at=item.created_at,
        updated_at=item.updated_at,
        meeting_title=item.meeting.title if item.meeting else None,
    )


def _visible_actions(db: Session, user: User):
    query = db.query(ActionItem).options(selectinload(ActionItem.meeting)).join(Meeting)
    if user.role != "admin":
        query = query.filter(Meeting.user_id == user.id)
    return query


@router.get("", response_model=list[ActionItemOut])
def list_actions(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    meeting_id: Optional[int] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    priority: Optional[str] = Query(default=None),
    owner: Optional[str] = Query(default=None),
    overdue: Optional[bool] = Query(default=None),
) -> list[ActionItemOut]:
    query = _visible_actions(db, current_user)
    if meeting_id is not None:
        query = query.filter(ActionItem.meeting_id == meeting_id)
    if status_filter:
        query = query.filter(ActionItem.status == status_filter)
    if priority:
        query = query.filter(ActionItem.priority == priority)
    if owner:
        query = query.filter(ActionItem.owner.ilike(f"%{owner.strip()}%"))
    items = query.order_by(ActionItem.id.desc()).all()
    if overdue is True:
        items = [item for item in items if is_overdue(item)]
    return [serialize(item) for item in items]


@router.post("", response_model=ActionItemOut, status_code=status.HTTP_201_CREATED)
def create_action(
    payload: ActionItemCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ActionItemOut:
    meeting = db.get(Meeting, payload.meeting_id)
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    if current_user.role != "admin" and meeting.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    item = ActionItem(
        meeting_id=payload.meeting_id,
        task_description=payload.task_description.strip(),
        owner=payload.owner,
        due_date=payload.due_date,
        priority=payload.priority,
        status=payload.status,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    item = (
        db.query(ActionItem)
        .options(selectinload(ActionItem.meeting))
        .filter(ActionItem.id == item.id)
        .first()
    )
    return serialize(item)


@router.put("/{action_id}", response_model=ActionItemOut)
def update_action(
    action_id: int,
    payload: ActionItemUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ActionItemOut:
    item = (
        db.query(ActionItem)
        .options(selectinload(ActionItem.meeting))
        .filter(ActionItem.id == action_id)
        .first()
    )
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action item not found")
    if current_user.role != "admin" and item.meeting.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key in {"owner", "due_date"} and isinstance(value, str):
            value = value.strip() or ("Unassigned" if key == "owner" else "Not specified")
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return serialize(item)


@router.delete("/{action_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_action(
    action_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    item = (
        db.query(ActionItem)
        .options(selectinload(ActionItem.meeting))
        .filter(ActionItem.id == action_id)
        .first()
    )
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action item not found")
    if current_user.role != "admin" and item.meeting.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    db.delete(item)
    db.commit()
