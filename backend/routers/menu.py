from fastapi import APIRouter
from database import db

router = APIRouter()

@router.get("/")
def get_menu():
    menu = list(db.menu.find({}, {"_id": 0}))
    return {"menu": menu}
