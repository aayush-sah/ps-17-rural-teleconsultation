"""Auth router — OTP login + PIN role switch."""
import os
import random
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

# Demo OTP store (phone → otp)
_otp_store: dict = {}

# Demo staff for PIN role switch
DEMO_STAFF = {
    "1234": {"role": "asha_worker", "name": "Kamla Bai", "id": "staff-001"},
    "5678": {"role": "doctor", "name": "Dr. Priya Sharma", "id": "staff-002"},
    "9090": {"role": "coordinator", "name": "Arun Kumar", "id": "staff-003"},
}


class SendOTPRequest(BaseModel):
    phone: str


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str


class PINLoginRequest(BaseModel):
    pin: str
    clinic_id: str = "clinic-1"


@router.post("/send-otp")
async def send_otp(req: SendOTPRequest):
    otp = "123456" if DEMO_MODE else str(random.randint(100000, 999999))
    _otp_store[req.phone] = otp
    if not DEMO_MODE:
        # Real MSG91 OTP call here
        pass
    return {
        "success": True,
        "message": "OTP sent successfully",
        "demo_otp": otp if DEMO_MODE else None,
    }


@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    expected = _otp_store.get(req.phone)
    if DEMO_MODE or req.otp == expected:
        return {
            "success": True,
            "session_token": f"demo-token-{req.phone}",
            "patient_exists": False,
            "role": "patient",
        }
    return {"success": False, "error": "Invalid OTP"}


@router.post("/pin-login")
async def pin_login(req: PINLoginRequest):
    """Staff PIN-based role switch — no full OTP re-auth on shared tablet."""
    staff = DEMO_STAFF.get(req.pin)
    if staff:
        return {
            "success": True,
            "staff": staff,
            "session_token": f"demo-staff-{staff['id']}",
        }
    return {"success": False, "error": "Invalid PIN"}


@router.get("/demo-credentials")
async def get_demo_credentials():
    """Show demo PINs for hackathon judges."""
    return {
        "demo_otp": "123456",
        "pins": {
            "ASHA Worker (Kamla Bai)": "1234",
            "Doctor (Dr. Priya Sharma)": "5678",
            "Coordinator (Arun Kumar)": "9090",
        },
    }
