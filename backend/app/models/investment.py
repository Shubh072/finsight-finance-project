from datetime import datetime, date
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Enum, Date, Decimal as SqlDecimal, ForeignKey, BigInteger, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import db, AuditModel

class Investment(AuditModel):
    __tablename__ = "investments"

    investment_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    asset_type: Mapped[str] = mapped_column(
        Enum("stock", "mutual_fund", "etf", "gold", "bond", "crypto", "fixed_deposit", "real_estate"), 
        nullable=False
    )
    asset_name: Mapped[str] = mapped_column(String(150), nullable=False)
    symbol: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    quantity: Mapped[Decimal] = mapped_column(SqlDecimal(18, 6), nullable=False)
    buy_price: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), nullable=False)
    current_price: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), default=0.00, nullable=False)
    purchase_date: Mapped[date] = mapped_column(Date, nullable=False)
    risk_score: Mapped[Optional[int]] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(Enum("active", "sold", "matured"), default="active", nullable=False)

    # Generated attributes
    @property
    def invested_value(self) -> Decimal:
        return self.quantity * self.buy_price

    @property
    def current_value(self) -> Decimal:
        return self.quantity * self.current_price

    @property
    def profit_loss(self) -> Decimal:
        return self.current_value - self.invested_value

    # Relationships
    transactions = relationship("InvestmentTransaction", back_populates="investment", cascade="all, delete-orphan")

class InvestmentTransaction(db.Model):
    __tablename__ = "investment_transactions"

    investment_txn_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    investment_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("investments.investment_id", ondelete="CASCADE"), nullable=False)
    txn_type: Mapped[str] = mapped_column(Enum("buy", "sell", "dividend", "bonus"), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(SqlDecimal(18, 6), nullable=False)
    price: Mapped[Decimal] = mapped_column(SqlDecimal(14, 2), nullable=False)
    txn_date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    investment = relationship("Investment", back_populates="transactions")

class PortfolioSummary(db.Model):
    __tablename__ = "portfolio_summary"

    portfolio_summary_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_invested: Mapped[Decimal] = mapped_column(SqlDecimal(18, 2), nullable=False)
    current_value: Mapped[Decimal] = mapped_column(SqlDecimal(18, 2), nullable=False)
    profit_loss: Mapped[Decimal] = mapped_column(SqlDecimal(18, 2), nullable=False)
    roi_percent: Mapped[Decimal] = mapped_column(SqlDecimal(8, 4), nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
