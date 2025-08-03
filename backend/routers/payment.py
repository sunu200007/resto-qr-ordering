from fastapi import APIRouter
from database import db
from pydantic import BaseModel

router = APIRouter()

class PaymentNotification(BaseModel):
    order_id: str
    status: str  # expected: "paid"

@router.post("/payment/webhook")
def payment_webhook(payload: dict):
    if payload.get("status") == "PAID":
        order_id = payload.get("external_id")
        db.orders.update_one(
            {"order_id": order_id},
            {"$set": {"payment_status": "paid"}}
        )
    return {"status": "ok"}
