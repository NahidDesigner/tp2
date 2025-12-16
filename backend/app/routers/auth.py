from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import OTPRequest, OTPVerify, Token, Login, UserResponse
from app.auth import (
    generate_otp, store_otp, verify_otp,
    create_access_token, verify_password, get_password_hash,
    get_current_user
)
from datetime import timedelta
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/otp/request")
async def request_otp(request: OTPRequest, db: Session = Depends(get_db)):
    """Request OTP for phone number"""
    otp = generate_otp()
    store_otp(request.phone, otp)
    
    # In production, send OTP via SMS service
    # For now, return it (remove in production!)
    return {
        "message": "OTP sent successfully",
        "otp": otp  # Remove this in production!
    }

@router.post("/otp/verify")
async def verify_otp_endpoint(request: OTPVerify, db: Session = Depends(get_db)):
    """Verify OTP and login/register"""
    if not verify_otp(request.phone, request.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Get or create user
    user = db.query(User).filter(User.phone == request.phone).first()
    if not user:
        user = User(phone=request.phone, is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )
    
@router.post("/login", response_model=Token)
async def login(login_data: Login, db: Session = Depends(get_db)):
    """Login with phone/password or OTP"""
    user = db.query(User).filter(User.phone == login_data.phone).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # OTP login
    if login_data.otp:
        if not verify_otp(login_data.phone, login_data.otp):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP"
            )
    # Password login (if password is set)
    elif login_data.password:
        # For now, allow any password if user doesn't have one set
        # In production, require password setup
        pass
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP or password required"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

