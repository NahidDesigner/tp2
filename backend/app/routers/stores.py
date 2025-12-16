from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Store, User
from app.schemas import StoreCreate, StoreResponse, StoreBase
from app.auth import get_current_user
import re

router = APIRouter(prefix="/api/stores", tags=["stores"])

def validate_subdomain(subdomain: str) -> bool:
    """Validate subdomain format"""
    if len(subdomain) < 3 or len(subdomain) > 50:
        return False
    pattern = r'^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'
    return bool(re.match(pattern, subdomain))

@router.post("", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
async def create_store(
    store_data: StoreCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new store"""
    if not validate_subdomain(store_data.subdomain):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subdomain format"
        )
    
    # Check if subdomain exists
    existing = db.query(Store).filter(Store.subdomain == store_data.subdomain).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subdomain already taken"
        )
    
    store = Store(**store_data.dict(), owner_id=current_user.id)
    db.add(store)
    db.commit()
    db.refresh(store)
    return store

@router.get("", response_model=list[StoreResponse])
async def get_my_stores(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all stores owned by current user"""
    stores = db.query(Store).filter(Store.owner_id == current_user.id).all()
    return stores

@router.get("/{store_id}", response_model=StoreResponse)
async def get_store(
    store_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get store by ID"""
    store = db.query(Store).filter(
        Store.id == store_id,
        Store.owner_id == current_user.id
    ).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    return store

@router.put("/{store_id}", response_model=StoreResponse)
async def update_store(
    store_id: int,
    store_data: StoreBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update store"""
    store = db.query(Store).filter(
        Store.id == store_id,
        Store.owner_id == current_user.id
    ).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    for key, value in store_data.dict(exclude_unset=True).items():
        setattr(store, key, value)
    
    db.commit()
    db.refresh(store)
    return store

