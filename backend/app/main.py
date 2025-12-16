from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.database import init_db
from app.middleware import tenant_middleware
from app.routers import auth, stores, products, orders, public, uploads
from app.config import settings
import os

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="BD Traders Multi-Tenant SaaS Platform"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tenant middleware (must be before routes)
@app.middleware("http")
async def tenant_middleware_wrapper(request: Request, call_next):
    return await tenant_middleware(request, call_next)

# Include routers
app.include_router(auth.router)
app.include_router(stores.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(public.router)
app.include_router(uploads.router)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    # Mount static files for uploaded images
    upload_dir = settings.UPLOAD_DIR
    if os.path.exists(upload_dir):
        app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "BD Traders SaaS Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
