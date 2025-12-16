from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App
    APP_NAME: str = "BD Traders SaaS"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "postgresql://bdtraders:bdtraders123@db:5432/bdtraders"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_SECRET_KEY: str = "your-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Multi-tenancy
    BASE_DOMAIN: str = "72.61.239.193.sslip.io"
    
    # Email
    EMAIL_FROM: str = "noreply@bdtraders.com"
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # WhatsApp
    WHATSAPP_API_URL: Optional[str] = None
    WHATSAPP_API_KEY: Optional[str] = None
    
    # Facebook/Meta
    FACEBOOK_PIXEL_ID: Optional[str] = None
    META_ACCESS_TOKEN: Optional[str] = None
    
    # File uploads
    UPLOAD_DIR: str = "/app/uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

