from fastapi import Request, HTTPException, status
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Store
from app.config import settings
import re

def get_tenant_from_subdomain(host: str) -> str:
    """Extract tenant subdomain from host header"""
    # Remove port if present
    host = host.split(':')[0]
    
    # Remove www. if present
    host = host.replace('www.', '')
    
    # Extract subdomain
    base_domain = settings.BASE_DOMAIN
    if host.endswith(base_domain):
        subdomain = host.replace(f'.{base_domain}', '').replace(base_domain, '')
        if subdomain and subdomain != 'api' and subdomain != 'admin':
            return subdomain
    
    # Fallback: check if host is just the base domain (main site)
    if host == base_domain:
        return None
    
    return None

def get_store_by_subdomain(db: Session, subdomain: str) -> Store:
    """Get store by subdomain"""
    if not subdomain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subdomain is required"
        )
    
    store = db.query(Store).filter(
        Store.subdomain == subdomain,
        Store.is_active == True
    ).first()
    
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    return store

async def tenant_middleware(request: Request, call_next):
    """Middleware to extract tenant from subdomain"""
    host = request.headers.get("host", "")
    subdomain = get_tenant_from_subdomain(host)
    
    # Store subdomain in request state for use in routes
    request.state.subdomain = subdomain
    request.state.tenant_id = None
    
    # If subdomain exists, get store and set tenant_id
    if subdomain:
        db = SessionLocal()
        try:
            store = get_store_by_subdomain(db, subdomain)
            request.state.tenant_id = store.id
            request.state.store = store
        except HTTPException:
            pass
        finally:
            db.close()
    
    response = await call_next(request)
    return response

