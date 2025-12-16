import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

from .db import init_db, insert_data, get_tenant_data
from .tenant import get_tenant_id

# Initialize FastAPI app
app = FastAPI(title="Coolify Multi Tenant Demo")

# Get app name from environment
APP_NAME = os.getenv("APP_NAME", "Coolify Multi Tenant Demo")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Request/Response models
class DataRequest(BaseModel):
    value: str

class DataResponse(BaseModel):
    id: int
    tenant_id: str
    value: str
    created_at: str

# Health check endpoint
@app.get("/")
async def health_check():
    return {
        "status": "ok",
        "app": APP_NAME
    }

# Create tenant data endpoint
@app.post("/data", response_model=DataResponse)
async def create_data(data: DataRequest, tenant_id: str = get_tenant_id()):
    """Create a new data record for the tenant."""
    record_id = insert_data(tenant_id, data.value)
    
    # Fetch the created record
    records = get_tenant_data(tenant_id)
    created_record = next((r for r in records if r["id"] == record_id), None)
    
    if not created_record:
        raise HTTPException(status_code=500, detail="Failed to create record")
    
    return DataResponse(**created_record)

# Get tenant data endpoint
@app.get("/data", response_model=List[DataResponse])
async def get_data(tenant_id: str = get_tenant_id()):
    """Get all data records for the tenant."""
    records = get_tenant_data(tenant_id)
    return [DataResponse(**record) for record in records]

