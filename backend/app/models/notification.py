from datetime import datetime
from typing import Optional
from sqlalchemy import String, Enum, Boolean, ForeignKey, BigInteger, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.models.base import db

class Notification(db.Model):
    __tablename__ = "notifications"

    notification_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    notification_type: Mapped[str] = mapped_column(
        Enum("budget_alert", "goal_alert", "investment_alert", "system"), 
        nullable=False
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
