# routers/admin.py

from fastapi import APIRouter, HTTPException, Header
from database import db
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

API_KEY = "secret123"  # ganti nanti pakai env kalau perlu

def authorize(x_api_key: Optional[str]):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

class MenuItem(BaseModel):
    name: str
    price: int

@router.post("/menu")
def add_menu(item: MenuItem, x_api_key: Optional[str] = Header(None)):
    authorize(x_api_key)
    db.menu.insert_one(item.dict())
    return {"message": "Menu item added"}

@router.put("/menu")
def update_menu(item: MenuItem, x_api_key: Optional[str] = Header(None)):
    authorize(x_api_key)
    result = db.menu.update_one(
        {"name": item.name},
        {"$set": {"price": item.price}}
    )
    if result.matched_count:
        return {"message": "Menu updated"}
    return {"message": "Item not found"}

@router.delete("/menu/{name}")
def delete_menu(name: str, x_api_key: Optional[str] = Header(None)):
    authorize(x_api_key)
    result = db.menu.delete_one({"name": name})
    if result.deleted_count:
        return {"message": "Menu deleted"}
    return {"message": "Item not found"}
