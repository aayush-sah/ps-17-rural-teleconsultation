"""Prescription creation + PDF generation + MSG91 WhatsApp/SMS delivery."""
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

_prescriptions: List[dict] = []


class Medication(BaseModel):
    name: str
    dose: str
    frequency: str
    duration: str
    instructions: str = ""


class PrescriptionRequest(BaseModel):
    consultation_id: str
    visit_id: str
    patient_phone: str
    patient_name: str
    doctor_name: str = "Dr. Priya Sharma"
    clinic_name: str = "Anand Primary Health Centre"
    medications: List[Medication]
    diagnosis: str = ""
    notes: str = ""


def generate_pdf_mock(req: PrescriptionRequest) -> str:
    """Returns a stub PDF URL (real: use reportlab)."""
    return f"https://phc-demo.supabase.co/storage/v1/object/public/prescriptions/{req.visit_id}.pdf"


def send_whatsapp_mock(phone: str, pdf_url: str, patient_name: str, meds: List[Medication]) -> dict:
    """Stub MSG91 WhatsApp delivery."""
    med_lines = "\n".join([f"• {m.name} {m.dose} — {m.frequency} for {m.duration}" for m in meds])
    return {
        "channel": "whatsapp",
        "phone": phone,
        "status": "delivered",
        "message": f"✅ Prescription for {patient_name}:\n{med_lines}\n\nPDF: {pdf_url}",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/create")
async def create_prescription(req: PrescriptionRequest):
    pdf_url = generate_pdf_mock(req)

    delivery = send_whatsapp_mock(req.patient_phone, pdf_url, req.patient_name, req.medications)

    record = {
        "id": f"rx-{len(_prescriptions)+1:03d}",
        "consultation_id": req.consultation_id,
        "visit_id": req.visit_id,
        "patient_name": req.patient_name,
        "doctor_name": req.doctor_name,
        "medications": [m.dict() for m in req.medications],
        "pdf_url": pdf_url,
        "delivery": delivery,
        "created_at": datetime.utcnow().isoformat(),
    }
    _prescriptions.append(record)

    return {
        "success": True,
        "prescription": record,
        "pdf_url": pdf_url,
        "delivery_status": delivery,
        "followup_scheduled": True,
        "next_checkin": "24 hours",
    }


@router.get("/list")
async def list_prescriptions():
    return {"prescriptions": _prescriptions}
