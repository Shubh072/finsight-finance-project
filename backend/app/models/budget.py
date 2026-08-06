from datetime import datetime, date
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Enum, Boolean, Date, Decimal as SqlDecimal, ForeignKey, BigInteger, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import db, AuditModel

class Budget(AuditModel):
    __tablename__ = "budgets"

    budget_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    budget_name: Mapped[str] = mapped_column(String(100), nullable=False)
    budget_type: Mapped[str] = mapped_column(Enum("monthly", "yearly"), nullable=False)
    total_limit: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), nullable=False)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(Enum("active", "completed", "exceeded"), default="active", nullable=False)

    categories = relationship("BudgetCategory", back_populates="budget", cascade="all, delete-orphan")
    alerts = relationship("BudgetAlert", back_populates="budget", cascade="all, delete-orphan")

class BudgetCategory(db.Model):
    __tablename__ = "budget_categories"

    budget_category_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    budget_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("budgets.budget_id", ondelete="CASCADE"), nullable=False)
    category_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("expense_categories.category_id", ondelete="RESTRICT"), nullable=False)
    allocated_amount: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), nullable=False)
    spent_amount: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), default=0.00, nullable=False)

    budget = relationship("Budget", back_populates="categories")
    category = relationship("ExpenseCategory")

class BudgetHistory(db.Model):
    __tablename__ = "budget_history"

    history_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    budget_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("budgets.budget_id", ondelete="CASCADE"), nullable=False)
    total_spent: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), nullable=False)
    total_limit: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), nullable=False)
    overspent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    archived_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

class BudgetAlert(db.Model):
    __tablename__ = "budget_alerts"

    alert_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    budget_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("budgets.budget_id", ondelete="CASCADE"), nullable=False)
    alert_type: Mapped[str] = mapped_column(Enum("threshold_80", "threshold_90", "exceeded"), nullable=False)
    threshold_percent: Mapped[Optional[Decimal]] = mapped_column(SqlDecimal(5, 2), nullable=True)
    triggered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    triggered_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    budget = relationship("Budget", back_populates="alerts")
+
