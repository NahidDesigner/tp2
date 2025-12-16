from fastapi import Header, HTTPException
from typing import Optional

def get_tenant_id(x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID")) -> str:
    """
    Extract and validate tenant ID from X-Tenant-ID header.
    Raises HTTP 400 if header is missing.
    """
    if not x_tenant_id:
        raise HTTPException(
            status_code=400,
            detail="X-Tenant-ID header is required"
        )
    return x_tenant_id


