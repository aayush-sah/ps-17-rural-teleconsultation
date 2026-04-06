"""SOAP Brief Generator — runs after triage, before doctor sees patient."""
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"


class SOAPRequest(BaseModel):
    patient_name: str
    age: int
    gender: str
    chief_complaint: str
    duration: str
    severity: int
    associated_symptoms: List[str] = []
    known_conditions: List[str] = []
    allergies: List[str] = []
    current_meds: List[str] = []
    bp: Optional[str] = None
    temp: Optional[float] = None
    spo2: Optional[int] = None
    triage_priority: str = "P2"
    triage_flags: List[str] = []
    triage_reasoning: str = ""
    wait_minutes: int = 0


@router.post("/generate")
async def generate_soap(req: SOAPRequest):
    if DEMO_MODE:
        return {
            "subjective": (
                f"Patient {req.patient_name}, {req.age}y {req.gender}, presents with {req.chief_complaint} "
                f"for {req.duration}. Self-rated severity: {req.severity}/10. "
                f"Associated symptoms: {', '.join(req.associated_symptoms) or 'None reported'}."
            ),
            "objective": (
                f"Vitals: BP {req.bp or 'Not measured'} | "
                f"Temp {req.temp or 'Not measured'}°C | "
                f"SpO2 {req.spo2 or 'Not measured'}%. "
                f"Mobility: ambulatory. Triage priority: {req.triage_priority}."
            ),
            "assessment": (
                f"Triage assessment: {req.triage_reasoning} "
                f"Flags: {', '.join(req.triage_flags) or 'None'}."
            ),
            "plan": (
                "Conduct focused physical examination. "
                "Assess for primary infection vs. systemic cause. "
                "Consider CBC if fever persists > 72 hours. "
                "Review medication list for interactions."
            ),
            "allergies_flagged": req.allergies,
            "chronic_conditions": req.known_conditions,
            "wait_minutes": req.wait_minutes,
        }

    # Real Claude call
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        prompt = f"""Generate a structured SOAP note for a rural PHC doctor.
Patient: {req.patient_name}, {req.age}y {req.gender}
Chief complaint: {req.chief_complaint} for {req.duration}
Severity: {req.severity}/10
Symptoms: {', '.join(req.associated_symptoms)}
Conditions: {', '.join(req.known_conditions) or 'None'}
Allergies: {', '.join(req.allergies) or 'None'}
Meds: {', '.join(req.current_meds) or 'None'}
BP: {req.bp} | Temp: {req.temp}°C | SpO2: {req.spo2}%
Triage: {req.triage_priority} — {req.triage_reasoning}

Output JSON: {{subjective, objective, assessment, plan}} — concise, clinical language only."""

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        import json
        return {**json.loads(response.content[0].text),
                "allergies_flagged": req.allergies,
                "chronic_conditions": req.known_conditions,
                "wait_minutes": req.wait_minutes}
    except Exception:
        return {
            "subjective": f"Chief complaint: {req.chief_complaint}. Duration: {req.duration}.",
            "objective": f"Vitals: BP {req.bp} | Temp {req.temp}°C | SpO2 {req.spo2}%",
            "assessment": f"Triage {req.triage_priority}: {req.triage_reasoning}",
            "plan": "Awaiting doctor assessment.",
            "allergies_flagged": req.allergies,
            "chronic_conditions": req.known_conditions,
            "wait_minutes": req.wait_minutes,
        }
