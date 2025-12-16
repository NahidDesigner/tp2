from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Store, Product, ShippingClass
from app.schemas import StoreResponse, ProductResponse, ShippingClassResponse

router = APIRouter(prefix="/api/public", tags=["public"])

@router.get("/store", response_model=StoreResponse)
async def get_store_info(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get public store information"""
    store = None
    
    # Try to get from subdomain
    if hasattr(request.state, 'tenant_id') and request.state.tenant_id:
        store = db.query(Store).filter(
            Store.id == request.state.tenant_id,
            Store.is_active == True
        ).first()
    
    # If no subdomain, return first active store (for testing)
    if not store:
        store = db.query(Store).filter(Store.is_active == True).first()
    
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    return store

@router.get("/products", response_model=list[ProductResponse])
async def get_public_products(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get published products for store"""
    if not hasattr(request.state, 'tenant_id') or not request.state.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store context required"
        )
    
    products = db.query(Product).filter(
        Product.store_id == request.state.tenant_id,
        Product.is_published == True
    ).all()
    return products

@router.get("/shipping-classes", response_model=list[ShippingClassResponse])
async def get_shipping_classes(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get active shipping classes for store"""
    if not hasattr(request.state, 'tenant_id') or not request.state.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store context required"
        )
    
    classes = db.query(ShippingClass).filter(
        ShippingClass.store_id == request.state.tenant_id,
        ShippingClass.is_active == True
    ).all()
    return classes

