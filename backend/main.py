from fastapi import FastAPI
from routers import menu, order, payment
from routers import admin

app = FastAPI()

app.include_router(menu.router, prefix="/menu")
app.include_router(order.router, prefix="/order")
app.include_router(payment.router, prefix="/payment")
app.include_router(admin.router, prefix="/admin")

@app.get("/")
def root():
    return {"message": "Food ordering backend running"}

