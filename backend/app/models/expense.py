from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal
from sqlalchemy import String, Enum, Boolean, Date, Decimal as SqlDecimal, ForeignKey, BigInteger, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import db, AuditModel

class ExpenseCategory(db.Model):
    __tablename__ = "expense_categories"

    category_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category_name: Mapped[str] = mapped_column(String(100), nullable=False)
    parent_category_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("expense_categories.category_id", ondelete="SET NULL"), nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Self referencing parent/child relationship
    parent = relationship("ExpenseCategory", remote_side=[category_id], backref="subcategories")

class ExpenseTransaction(AuditModel):
    __tablename__ = "expense_transactions"

    expense_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("expense_categories.category_id", ondelete="RESTRICT"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), nullable=False)
    payment_mode: Mapped[str] = mapped_column(Enum("cash", "upi", "credit_card", "debit_card", "bank_transfer", "other"), default="other", nullable=False)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    category = relationship("ExpenseCategory")
    attachments = relationship("ExpenseAttachment", back_populates="expense", cascade="all, delete-orphan")

class ExpenseAttachment(db.Model):
    __tablename__ = "expense_attachments"

    attachment_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    expense_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("expense_transactions.expense_id", ondelete="CASCADE"), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    expense = relationship("ExpenseTransaction", back_populates="attachments")

class RecurringExpense(AuditModel):
    __tablename__ = "recurring_expenses"

    recurring_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("expense_categories.category_id", ondelete="RESTRICT"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), nullable=False)
    frequency: Mapped[str] = mapped_column(Enum("daily", "weekly", "monthly", "quarterly", "yearly"), nullable=False)
    next_due_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    category = relationship("ExpenseCategory")

class MonthlyExpenseSummary(db.Model):
    __tablename__ = "monthly_expense_summary"

    summary_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    month: Mapped[int] = mapped_column(nullable=False)
    year: Mapped[int] = mapped_column(nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), default=0.00, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
