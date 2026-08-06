from datetime import datetime, date
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Enum, Boolean, Date, Decimal as SqlDecimal, ForeignKey, BigInteger, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.models.base import db

class Report(db.Model):
    __tablename__ = "reports"

    report_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    report_type: Mapped[str] = mapped_column(Enum("monthly", "yearly", "category", "investment"), nullable=False)
    format: Mapped[str] = mapped_column(Enum("pdf", "excel"), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(Enum("pending", "completed", "failed"), default="pending", nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

class AIRecommendation(db.Model):
    __tablename__ = "ai_recommendations"

    recommendation_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category: Mapped[str] = mapped_column(Enum("spending", "saving", "investment", "budget", "goal"), nullable=False)
    recommendation_text: Mapped[str] = mapped_column(String(500), nullable=False)
    potential_impact: Mapped[Optional[Decimal]] = mapped_column(SqlDecimal(14, 2), nullable=True)
    confidence_score: Mapped[Optional[Decimal]] = mapped_column(SqlDecimal(5, 2), nullable=True)
    is_applied: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    applied_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

class DashboardSummary(db.Model):
    __tablename__ = "dashboard_summary"

    dashboard_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    total_balance: Mapped[Decimal] = mapped_column(SqlDecimal(18, 2), default=0.00, nullable=False)
    total_income: Mapped[Decimal] = mapped_column(SqlDecimal(18, 2), default=0.00, nullable=False)
    total_expenses: Mapped[Decimal] = mapped_column(SqlDecimal(18, 2), default=0.00, nullable=False)
    monthly_savings: Mapped[Decimal] = mapped_column(SqlDecimal(18, 2), default=0.00, nullable=False)
    net_worth: Mapped[Decimal] = mapped_column(SqlDecimal(18, 2), default=0.00, nullable=False)
    investment_value: Mapped[Decimal] = mapped_column(SqlDecimal(18, 2), default=0.00, nullable=False)
    financial_health_score: Mapped[Optional[int]] = mapped_column(nullable=True)
    last_calculated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
