from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Order, OrderItem, Product, Store, User, ShippingClass, OrderStatus
from app.schemas import OrderCreate, OrderResponse, OrderUpdate, OrderItemResponse
from app.auth import get_current_user
import secrets
from datetime import datetime

router = APIRouter(prefix="/api/orders", tags=["orders"])

def generate_order_number() -> str:
    """Generate unique order number"""
    return f"ORD{secrets.token_hex(4).upper()}{int(datetime.utcnow().timestamp())}"

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new order (public endpoint)"""
    if not hasattr(request.state, 'tenant_id') or not request.state.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store context required"
        )
    
    store = db.query(Store).filter(Store.id == request.state.tenant_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    # Calculate totals
    subtotal = 0.0
    items_data = []
    
    for item_data in order_data.items:
        product = db.query(Product).filter(
            Product.id == item_data.product_id,
            Product.store_id == store.id,
            Product.is_published == True
        ).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item_data.product_id} not found"
            )
        
        if product.stock < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.title}"
            )
        
        price = product.discount_price or product.price
        item_total = price * item_data.quantity
        subtotal += item_total
        
        items_data.append({
            "product": product,
            "quantity": item_data.quantity,
            "price": price,
            "total": item_total
        })
    
    # Calculate shipping
    shipping_cost = 0.0
    shipping_class = None
    if order_data.shipping_class_id:
        shipping_class = db.query(ShippingClass).filter(
            ShippingClass.id == order_data.shipping_class_id,
            ShippingClass.store_id == store.id,
            ShippingClass.is_active == True
        ).first()
        if shipping_class:
            shipping_cost = shipping_class.cost
    
    total = subtotal + shipping_cost
    
    # Create order
    order = Order(
        store_id=store.id,
        order_number=generate_order_number(),
        customer_name=order_data.customer_name,
        customer_phone=order_data.customer_phone,
        customer_email=order_data.customer_email,
        shipping_address=order_data.shipping_address,
        shipping_city=order_data.shipping_city,
        shipping_postal=order_data.shipping_postal,
        shipping_class_id=order_data.shipping_class_id,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        total=total,
        notes=order_data.notes,
        status=OrderStatus.PENDING
    )
    db.add(order)
    db.flush()
    
    # Create order items and update stock
    for item_info in items_data:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_info["product"].id,
            product_title=item_info["product"].title,
            quantity=item_info["quantity"],
            price=item_info["price"],
            total=item_info["total"]
        )
        db.add(order_item)
        
        # Update product stock
        item_info["product"].stock -= item_info["quantity"]
    
    db.commit()
    db.refresh(order)
    
    # Load items for response
    order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    return order

@router.get("", response_model=list[OrderResponse])
async def get_orders(
    request: Request,
    status_filter: OrderStatus = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get orders for current store (owner only)"""
    if not hasattr(request.state, 'tenant_id') or not request.state.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store context required"
        )
    
    store = db.query(Store).filter(
        Store.id == request.state.tenant_id,
        Store.owner_id == current_user.id
    ).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
    
    query = db.query(Order).filter(Order.store_id == store.id)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    
    orders = query.order_by(Order.created_at.desc()).all()
    
    # Load items for each order
    for order in orders:
        order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get order by ID"""
    if not hasattr(request.state, 'tenant_id') or not request.state.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store context required"
        )
    
    order = db.query(Order).join(Store).filter(
        Order.id == order_id,
        Order.store_id == request.state.tenant_id,
        Store.owner_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    return order

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_data: OrderUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update order status"""
    if not hasattr(request.state, 'tenant_id') or not request.state.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store context required"
        )
    
    order = db.query(Order).join(Store).filter(
        Order.id == order_id,
        Order.store_id == request.state.tenant_id,
        Store.owner_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order.status = order_data.status
    if order_data.notes:
        order.notes = order_data.notes
    
    db.commit()
    db.refresh(order)
    order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    return order

