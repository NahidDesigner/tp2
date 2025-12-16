from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, Store, User
from app.schemas import ProductCreate, ProductResponse, ProductUpdate
from app.auth import get_current_user
import re
import secrets
import json

router = APIRouter(prefix="/api/products", tags=["products"])

def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug[:200]

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new product"""
    # Get store from tenant_id (subdomain) or use first store of user
    store = None
    
    if hasattr(request.state, 'tenant_id') and request.state.tenant_id:
        # Use store from subdomain
        store = db.query(Store).filter(
            Store.id == request.state.tenant_id,
            Store.owner_id == current_user.id
        ).first()
    else:
        # No subdomain - use first store of current user
        store = db.query(Store).filter(
            Store.owner_id == current_user.id
        ).first()
    
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No store found. Please create a store first."
        )
    
    slug = generate_slug(product_data.title)
    # Ensure unique slug
    base_slug = slug
    counter = 1
    while db.query(Product).filter(Product.slug == slug, Product.store_id == store.id).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    product_dict = product_data.dict()
    # Handle images - if it's a string (JSON), keep it, otherwise convert to JSON
    if 'images' in product_dict and product_dict['images']:
        if isinstance(product_dict['images'], list):
            import json
            product_dict['images'] = json.dumps(product_dict['images'])
    
    product = Product(
        **product_dict,
        store_id=store.id,
        slug=slug
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.get("", response_model=list[ProductResponse])
async def get_products(
    request: Request,
    published_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get products for current store"""
    store_id = None
    
    if hasattr(request.state, 'tenant_id') and request.state.tenant_id:
        # Use store from subdomain
        store_id = request.state.tenant_id
    else:
        # No subdomain - use first store of current user
        store = db.query(Store).filter(
            Store.owner_id == current_user.id
        ).first()
        if store:
            store_id = store.id
    
    if not store_id:
        return []  # Return empty list if no store
    
    query = db.query(Product).filter(Product.store_id == store_id)
    if published_only:
        query = query.filter(Product.is_published == True)
    
    products = query.all()
    return products

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get product by ID"""
    store_id = None
    
    if hasattr(request.state, 'tenant_id') and request.state.tenant_id:
        store_id = request.state.tenant_id
    else:
        store = db.query(Store).filter(Store.owner_id == current_user.id).first()
        if store:
            store_id = store.id
    
    if not store_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.store_id == store_id
    ).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.get("/slug/{slug}", response_model=ProductResponse)
async def get_product_by_slug(
    slug: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get product by slug (for public landing pages)"""
    # Try to get from subdomain first
    store_id = None
    if hasattr(request.state, 'tenant_id') and request.state.tenant_id:
        store_id = request.state.tenant_id
    
    # If no subdomain, search all stores (for testing - in production, require subdomain)
    if not store_id:
        # Find product by slug across all stores (for development/testing)
        product = db.query(Product).filter(
            Product.slug == slug,
            Product.is_published == True
        ).first()
    else:
        # Find product in specific store
        product = db.query(Product).filter(
            Product.slug == slug,
            Product.store_id == store_id,
            Product.is_published == True
        ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update product"""
    store_id = None
    
    if hasattr(request.state, 'tenant_id') and request.state.tenant_id:
        store_id = request.state.tenant_id
    else:
        store = db.query(Store).filter(Store.owner_id == current_user.id).first()
        if store:
            store_id = store.id
    
    if not store_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    product = db.query(Product).join(Store).filter(
        Product.id == product_id,
        Product.store_id == store_id,
        Store.owner_id == current_user.id
    ).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product_dict = product_data.dict(exclude_unset=True)
    # Handle images - if it's a string (JSON), keep it, otherwise convert to JSON
    if 'images' in product_dict and product_dict['images']:
        if isinstance(product_dict['images'], list):
            import json
            product_dict['images'] = json.dumps(product_dict['images'])
    
    for key, value in product_dict.items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete product"""
    store_id = None
    
    if hasattr(request.state, 'tenant_id') and request.state.tenant_id:
        store_id = request.state.tenant_id
    else:
        store = db.query(Store).filter(Store.owner_id == current_user.id).first()
        if store:
            store_id = store.id
    
    if not store_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    product = db.query(Product).join(Store).filter(
        Product.id == product_id,
        Product.store_id == store_id,
        Store.owner_id == current_user.id
    ).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    db.delete(product)
    db.commit()
    return None

