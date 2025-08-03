from pydantic import BaseModel
from typing import List, Optional

class OrderItem(BaseModel):
    name: str
    quantity: int
    price: int  # harga per item

class OrderCreate(BaseModel):
    table_number: int
    items: List[OrderItem]
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    order_id: str
    total: int
    payment_status: str
