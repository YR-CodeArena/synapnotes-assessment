"""Pydantic v2 request and response schemas."""

from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

MEETING_TYPES = {
    "Client Meeting",
    "Sales Meeting",
    "Project Meeting",
    "Internal Meeting",
    "Requirement Discussion",
    "Retrospective",
    "Other",
}
PRIORITIES = {"Low", "Medium", "High"}
STATUSES = {"Open", "In Progress", "Blocked", "Completed"}
ROLES = {"admin", "member"}


class SummarySchema(BaseModel):
    purpose: str = ""
    key_points: list[str] = Field(default_factory=list)
    outcomes: list[str] = Field(default_factory=list)
    concerns: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)


class ActionItemBase(BaseModel):
    task_description: str = Field(..., min_length=1, max_length=1000)
    owner: str = "Unassigned"
    due_date: str = "Not specified"
    priority: str = "Medium"
    status: str = "Open"

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str) -> str:
        if value not in PRIORITIES:
            raise ValueError(f"priority must be one of {sorted(PRIORITIES)}")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in STATUSES:
            raise ValueError(f"status must be one of {sorted(STATUSES)}")
        return value

    @field_validator("owner")
    @classmethod
    def validate_owner(cls, value: str) -> str:
        return value.strip() or "Unassigned"

    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, value: str) -> str:
        return value.strip() or "Not specified"


class ActionItemCreate(ActionItemBase):
    meeting_id: int


class ActionItemUpdate(BaseModel):
    task_description: Optional[str] = Field(None, min_length=1, max_length=1000)
    owner: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in PRIORITIES:
            raise ValueError(f"priority must be one of {sorted(PRIORITIES)}")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in STATUSES:
            raise ValueError(f"status must be one of {sorted(STATUSES)}")
        return value


class ActionItemOut(ActionItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    created_at: datetime
    updated_at: datetime
    meeting_title: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    role: str = "member"

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        if value not in ROLES:
            raise ValueError("role must be admin or member")
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: str
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MeetingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    meeting_date: date
    meeting_type: str = "Other"
    participants: list[str] = Field(default_factory=list)
    raw_transcript: str = ""
    notes: str = ""

    @field_validator("meeting_type")
    @classmethod
    def validate_type(cls, value: str) -> str:
        if value not in MEETING_TYPES:
            raise ValueError(f"meeting_type must be one of {sorted(MEETING_TYPES)}")
        return value

    @field_validator("participants")
    @classmethod
    def clean_participants(cls, value: list[str]) -> list[str]:
        return [item.strip() for item in value if item and item.strip()]


class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    meeting_date: Optional[date] = None
    meeting_type: Optional[str] = None
    participants: Optional[list[str]] = None
    raw_transcript: Optional[str] = None
    notes: Optional[str] = None
    summary: Optional[dict[str, Any]] = None
    decisions: Optional[list[str]] = None
    risks: Optional[list[str]] = None
    unanswered_questions: Optional[list[str]] = None

    @field_validator("meeting_type")
    @classmethod
    def validate_type(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in MEETING_TYPES:
            raise ValueError(f"meeting_type must be one of {sorted(MEETING_TYPES)}")
        return value


class MeetingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    meeting_date: date
    meeting_type: str
    participants: list[str]
    raw_transcript: str
    notes: str
    summary: Optional[dict[str, Any]] = None
    decisions: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    unanswered_questions: list[str] = Field(default_factory=list)
    ai_processed: bool
    created_at: datetime
    updated_at: datetime
    action_items: list[ActionItemOut] = Field(default_factory=list)


class MeetingListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    meeting_date: date
    meeting_type: str
    participants: list[str]
    summary: Optional[dict[str, Any]] = None
    ai_processed: bool
    created_at: datetime
    updated_at: datetime
    action_count: int = 0


class DashboardAnalytics(BaseModel):
    total_meetings: int
    total_actions: int
    open_actions: int
    in_progress_actions: int
    completed_actions: int
    overdue_actions: int
    recent_meetings: list[MeetingListOut]
