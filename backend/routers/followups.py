"""Post-consultation follow-up engine."""
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta

router = APIRouter()
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

_followups: List[dict] = []


class Medication(BaseModel):
    name: str
    dose: str
    frequency: str
    duration: str


class FollowupRequest(BaseModel):
    visit_id: str
    patient_phone: str
    patient_name: str
    medications: List[Medication]


@router.post("/schedule")
async def schedule_followups(req: FollowupRequest):
    """Schedule the post-consultation follow-up pipeline."""
    now = datetime.utcnow()
    med_names = ", ".join([m.name for m in req.medications])

    scheduled = [
        {
            "type": "medication_reminder",
            "scheduled_at": (now + timedelta(hours=1)).isoformat(),
            "message": f"Time for your first dose of {med_names}. Take as prescribed.",
            "channel": "whatsapp",
        },
        {
            "type": "checkin",
            "scheduled_at": (now + timedelta(hours=24)).isoformat(),
            "message": "How are you feeling today? Reply: 1 = Better, 2 = Same, 3 = Worse",
            "channel": "whatsapp",
        },
        {
            "type": "medication_reminder",
            "scheduled_at": (now + timedelta(hours=48)).isoformat(),
            "message": f"Reminder: Continue your {med_names} as prescribed.",
            "channel": "sms",
        },
    ]

    entry = {
        "visit_id": req.visit_id,
        "patient_name": req.patient_name,
        "patient_phone": req.patient_phone,
        "followups": scheduled,
        "created_at": now.isoformat(),
    }
    _followups.append(entry)
    return {"success": True, "scheduled": scheduled}


@router.post("/respond")
async def patient_response(visit_id: str, response_code: int):
    """Handle patient's reply to check-in (1=Better, 2=Same, 3=Worse)."""
    escalated = response_code == 3
    outcome = {1: "improving", 2: "stable", 3: "deteriorating"}[response_code]
    return {
        "outcome": outcome,
        "escalated": escalated,
        "coordinator_alerted": escalated,
        "message": "Thank you for responding. A coordinator has been alerted and will contact you." if escalated
                   else "Great! Please continue your medication as prescribed.",
    }


@router.get("/list")
async def list_followups():
    return {"followups": _followups}
