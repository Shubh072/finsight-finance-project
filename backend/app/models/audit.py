from datetime import datetime
from typing import Optional
from sqlalchemy import String, Enum, ForeignKey, BigInteger, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.models.base import db

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    audit_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True)
    table_name: Mapped[str] = mapped_column(String(64), nullable=False)
    record_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    operation: Mapped[str] = mapped_column(Enum("INSERT", "UPDATE", "DELETE"), nullable=False)
    old_value: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    new_value: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

class ActivityLog(db.Model):
    __tablename__ = "activity_logs"

    activity_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    module: Mapped[str] = mapped_column(String(50), nullable=False)
    metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
