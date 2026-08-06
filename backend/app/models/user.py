from datetime import datetime
from typing import Optional
from sqlalchemy import String, Enum, Boolean, Date, Decimal, ForeignKey, BigInteger, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import db, AuditModel

class User(AuditModel):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_photo: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    role: Mapped[str] = mapped_column(Enum("user", "admin", "support"), default="user", nullable=False)
    account_status: Mapped[str] = mapped_column(Enum("active", "inactive", "suspended", "deleted"), default="active", nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    failed_login_attempts: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")

class UserProfile(db.Model):
    __tablename__ = "user_profile"

    profile_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    date_of_birth: Mapped[Optional[datetime]] = mapped_column(Date, nullable=True)
    occupation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    monthly_income: Mapped[Decimal] = mapped_column(Decimal(14, 2), default=0.00, nullable=False)
    currency_preference: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    country: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    risk_tolerance: Mapped[str] = mapped_column(Enum("low", "moderate", "high"), default="moderate", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="profile")

class UserSession(db.Model):
    __tablename__ = "user_sessions"

    session_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    session_token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    refresh_token: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    device_info: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="sessions")

class LoginHistory(db.Model):
    __tablename__ = "login_history"

    login_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    device_info: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    login_status: Mapped[str] = mapped_column(Enum("success", "failed"), nullable=False)
    failure_reason: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    attempted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

class PasswordResetToken(db.Model):
    __tablename__ = "password_reset_tokens"

    token_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")

