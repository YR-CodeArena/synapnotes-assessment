"""SQLAlchemy ORM models for users, meetings, and action items."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False, default="member")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    meetings = relationship("Meeting", back_populates="owner", cascade="all, delete-orphan")


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    meeting_date = Column(Date, nullable=False)
    meeting_type = Column(String(64), nullable=False, default="Other")
    participants = Column(JSON, nullable=False, default=list)
    raw_transcript = Column(Text, nullable=False, default="")
    notes = Column(Text, nullable=False, default="")
    summary = Column(JSON, nullable=True)
    decisions = Column(JSON, nullable=False, default=list)
    risks = Column(JSON, nullable=False, default=list)
    unanswered_questions = Column(JSON, nullable=False, default=list)
    ai_processed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    owner = relationship("User", back_populates="meetings")
    action_items = relationship(
        "ActionItem",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="ActionItem.id",
    )


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    task_description = Column(String(1000), nullable=False)
    owner = Column(String(255), nullable=False, default="Unassigned")
    due_date = Column(String(128), nullable=False, default="Not specified")
    priority = Column(String(16), nullable=False, default="Medium")
    status = Column(String(32), nullable=False, default="Open")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    meeting = relationship("Meeting", back_populates="action_items")
