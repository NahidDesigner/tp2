from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import OrderStatus

# User Schemas
class UserBase(BaseModel):
    phone: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class Login(BaseModel):
    phone: str
    password: Optional[str] = None
    otp: Optional[str] = None

# Store Schemas
class StoreBase(BaseModel):
    name: str
    name_bn: Optional[str] = None
    logo: Optional[str] = None
    brand_color: str = "#007bff"
    currency: str = "BDT"
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    facebook_pixel_id: Optional[str] = None
    default_language: str = "bn"

class StoreCreate(StoreBase):
    subdomain: str

class StoreResponse(StoreBase):
    id: int
    subdomain: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    title: str
    title_bn: Optional[str] = None
    description: Optional[str] = None
    description_bn: Optional[str] = None
    price: float
    discount_price: Optional[float] = None
    stock: int = 0
    is_published: bool = False
    images: Optional[str] = None  # JSON array of image URLs
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    store_id: int
    slug: str
    images: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[EmailStr] = None
    shipping_address: str
    shipping_city: Optional[str] = None
    shipping_postal: Optional[str] = None
    shipping_class_id: Optional[int] = None
    items: List[OrderItemCreate]
    notes: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_title: str
    quantity: int
    price: float
    total: float
    
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    store_id: int
    order_number: str
    status: OrderStatus
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    shipping_address: str
    shipping_city: Optional[str] = None
    shipping_postal: Optional[str] = None
    subtotal: float
    shipping_cost: float
    total: float
    notes: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []
    
    class Config:
        from_attributes = True

class OrderUpdate(BaseModel):
    status: OrderStatus
    notes: Optional[str] = None

# Shipping Schemas
class ShippingClassCreate(BaseModel):
    name: str
    name_bn: Optional[str] = None
    cost: float

class ShippingClassResponse(ShippingClassCreate):
    id: int
    store_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

