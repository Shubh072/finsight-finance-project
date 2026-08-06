from datetime import datetime, date
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Enum, Date, Decimal as SqlDecimal, ForeignKey, BigInteger, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import db, AuditModel

class FinancialGoal(AuditModel):
    __tablename__ = "financial_goals"

    goal_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    goal_name: Mapped[str] = mapped_column(String(150), nullable=False)
    goal_type: Mapped[str] = mapped_column(
        Enum("emergency_fund", "travel", "education", "retirement", "house", "vehicle", "wedding", "custom"), 
        nullable=False
    )
    target_amount: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), nullable=False)
    saved_amount: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), default=0.00, nullable=False)
    deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    priority: Mapped[str] = mapped_column(Enum("low", "medium", "high"), default="medium", nullable=False)
    status: Mapped[str] = mapped_column(Enum("on_track", "at_risk", "completed", "abandoned"), default="on_track", nullable=False)

    @property
    def progress_percent(self) -> Decimal:
        if self.target_amount <= 0:
            return Decimal("0.00")
        percentage = (self.saved_amount / self.target_amount) * 100
        return min(Decimal("100.00"), round(percentage, 2))

    # Relationships
    progress_ledger = relationship("GoalProgress", back_populates="goal", cascade="all, delete-orphan")

class GoalProgress(db.Model):
    __tablename__ = "goal_progress"

    progress_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    goal_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("financial_goals.goal_id", ondelete="CASCADE"), nullable=False)
    amount_added: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), nullable=False)
    recorded_date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    goal = relationship("FinancialGoal", back_populates="progress_ledger")
