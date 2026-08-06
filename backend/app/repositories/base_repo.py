from typing import Generic, TypeVar, Type, Optional, List
from backend.app.models.base import db
from sqlalchemy import select, desc, asc

T = TypeVar("T")

class BaseRepository(Generic[T]):
    """Generic repository implementation for clean separation of database operations"""
    
    def __init__(self, model: Type[T]):
        self.model = model

    def get_by_id(self, id: int) -> Optional[T]:
        """Fetch active record by primary key"""
        stmt = select(self.model).filter_by(deleted_at=None).filter(self.model.user_id == id if hasattr(self.model, "user_id") else True)
        # fallback simple fetch if standard filter doesn't apply
        return db.session.get(self.model, id)

    def get_all(self, page: int = 1, limit: int = 25, sort_by: str = "created_at", order: str = "desc") -> List[T]:
        """Fetch list of active items with unified sorting, order, and pagination"""
        query = select(self.model)
        
        # Soft-deletion filter
        if hasattr(self.model, "deleted_at"):
            query = query.filter(self.model.deleted_at == None)
            
        # Sorting
        sort_attr = getattr(self.model, sort_by, None)
        if sort_attr:
            if order.lower() == "desc":
                query = query.order_by(desc(sort_attr))
            else:
                query = query.order_by(asc(sort_attr))
                
        # Pagination
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        return db.session.scalars(query).all()

    def create(self, item: T) -> T:
        """Persist a new model record in database session"""
        db.session.add(item)
        db.session.commit()
        return item

    def update(self, item: T) -> T:
        """Update existing model record"""
        db.session.add(item)
        db.session.commit()
        return item

    def delete(self, item: T) -> None:
        """Perform physical or logical soft deletion of the record"""
        if hasattr(item, "soft_delete"):
            item.soft_delete()
        else:
            db.session.delete(item)
            db.session.commit()
