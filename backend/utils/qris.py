import requests
import os

XENDIT_API_KEY = os.getenv("XENDIT_API_KEY") or "xnd_development_..."  # ganti dengan API key kamu

def generate_qris(order_id: str, amount: int) -> str:
    url = "https://api.xendit.co/qr_codes"
    headers = {
        "Content-Type": "application/json",
    }
    data = {
        "external_id": order_id,
        "type": "DYNAMIC",
        "amount": amount,
        "callback_url": "https://yourdomain.com/payment/webhook",  # ganti ke endpoint kamu
    }

    response = requests.post(
        url,
        headers=headers,
        json=data,
        auth=(XENDIT_API_KEY, "")
    )

    if response.status_code == 200 or response.status_code == 201:
        result = response.json()
        return result["qr_string"]  # untuk ditampilkan sebagai QR
    else:
        raise Exception(f"Xendit Error: {response.text}")
