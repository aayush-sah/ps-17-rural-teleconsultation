"""Pydantic models shared across routers."""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class Priority(str, Enum):
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"


class TriageInput(BaseModel):
    visit_id: str
    patient_id: str
    age: int
    gender: str
    known_conditions: List[str] = []
    current_meds: List[str] = []
    allergies: List[str] = []
    chief_complaint: str
    duration: str
    severity: int = Field(ge=1, le=10)
    associated_symptoms: List[str] = []
    mobility: str = "ambulatory"
    bp: Optional[str] = None
    temp: Optional[float] = None
    spo2: Optional[int] = None


class TriageOutput(BaseModel):
    priority: Priority
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str
    hard_override_triggered: bool = False
    override_rule: Optional[str] = None
    flags: List[str] = []
    recommend_vitals: List[str] = []


class SOAPBrief(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str
    allergies_flagged: List[str] = []
    chronic_conditions: List[str] = []
    wait_minutes: int = 0


class Medication(BaseModel):
    name: str
    dose: str
    frequency: str
    duration: str
    instructions: str = ""


class PrescriptionCreate(BaseModel):
    consultation_id: str
    visit_id: str
    patient_phone: str
    patient_name: str
    medications: List[Medication]


class QueueJoinRequest(BaseModel):
    visit_id: str
    clinic_id: str
    priority: Priority


class FollowupScheduleRequest(BaseModel):
    visit_id: str
    patient_phone: str
    patient_name: str
    medications: List[Medication]
