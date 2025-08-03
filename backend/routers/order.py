from fastapi import APIRouter
from models.order import OrderCreate
from database import db
from utils.qris import generate_qris
from pydantic import BaseModel
from datetime import datetime

import uuid

router = APIRouter()

@router.post("/")
def create_order(order: OrderCreate):
    total = sum(item.price * item.quantity for item in order.items)
    order_id = str(uuid.uuid4())

    db.orders.insert_one({
        "order_id": order_id,
        "table_number": order.table_number,
        "items": [item.dict() for item in order.items],
        "notes": order.notes,
        "total": total,
        "payment_status": "pending",
        "created_at": datetime.utcnow()  # 🕒 tambahkan ini
    })

    qris_url = generate_qris(order_id, total)

    return {
        "order_id": order_id,
        "total": total,
        "qris_url": qris_url
    }




@router.get("/dapur")
def get_kitchen_orders():
    orders = list(db.orders.find(
        {"payment_status": {"$in": ["paid", "processing", "done"]}},
        {"_id": 0}
    ))
    return {"orders": orders}


class UpdateStatus(BaseModel):
    order_id: str
    status: str  # processing / done

@router.post("/update-status")
def update_order_status(data: UpdateStatus):
    allowed = ["processing", "done"]
    if data.status not in allowed:
        return {"error": "Invalid status"}

    result = db.orders.update_one(
        {"order_id": data.order_id},
        {"$set": {"payment_status": data.status}}
    )
    if result.modified_count:
        return {"message": f"Order updated to '{data.status}'"}
    return {"message": "Order not found"}

@router.get("/status/{order_id}")
def check_status(order_id: str):
    order = db.orders.find_one({"order_id": order_id}, {"_id": 0, "payment_status": 1})
    if order:
        return {"status": order["payment_status"]}
    return {"message": "Order not found"}
