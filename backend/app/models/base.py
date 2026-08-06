from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import DateTime, BigInteger, String

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

class AuditModel(db.Model):
    """Abstract model class providing audit fields and soft-deletion capability"""
    __abstract__ = True

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    created_by: Mapped[int] = mapped_column(BigInteger, nullable=True)
    updated_by: Mapped[int] = mapped_column(BigInteger, nullable=True)

    def soft_delete(self, operator_id=None):
        """Perform compliance-friendly soft deletion on the record"""
        self.deleted_at = datetime.utcnow()
        if operator_id:
            self.updated_by = operator_id
        db.session.add(self)
        db.session.commit()

    def restore(self, operator_id=None):
        """Restore a soft-deleted record"""
        self.deleted_at = None
        if operator_id:
            self.updated_by = operator_id
        db.session.add(self)
        db.session.commit()
