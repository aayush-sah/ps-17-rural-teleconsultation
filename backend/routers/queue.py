"""Queue management router — real-time queue CRUD."""
import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

# In-memory queue for demo mode (replace with Supabase in production)
_demo_queue: List[dict] = [
    {
        "id": "q-001", "visit_id": "v-001", "clinic_id": "clinic-1",
        "patient_name": "Savitaben Patel", "age": 67, "gender": "Female",
        "priority": "P1", "position": 1, "status": "waiting",
        "chief_complaint": "Chest tightness and breathlessness",
        "wait_minutes": 22,
        "joined_at": "2026-04-07T06:00:00",
    },
    {
        "id": "q-002", "visit_id": "v-002", "clinic_id": "clinic-1",
        "patient_name": "Ramkumar Singh", "age": 45, "gender": "Male",
        "priority": "P2", "position": 2, "status": "waiting",
        "chief_complaint": "High fever for 3 days with chills",
        "wait_minutes": 35,
        "joined_at": "2026-04-07T06:10:00",
    },
    {
        "id": "q-003", "visit_id": "v-003", "clinic_id": "clinic-1",
        "patient_name": "Meena Devi", "age": 32, "gender": "Female",
        "priority": "P2", "position": 3, "status": "waiting",
        "chief_complaint": "Severe abdominal pain after eating",
        "wait_minutes": 18,
        "joined_at": "2026-04-07T06:25:00",
    },
    {
        "id": "q-004", "visit_id": "v-004", "clinic_id": "clinic-1",
        "patient_name": "Arjun Yadav", "age": 8, "gender": "Male",
        "priority": "P2", "position": 4, "status": "waiting",
        "chief_complaint": "Persistent cough and runny nose for 5 days",
        "wait_minutes": 12,
        "joined_at": "2026-04-07T06:40:00",
    },
    {
        "id": "q-005", "visit_id": "v-005", "clinic_id": "clinic-1",
        "patient_name": "Lalitaben Trivedi", "age": 55, "gender": "Female",
        "priority": "P3", "position": 5, "status": "waiting",
        "chief_complaint": "Routine BP check and diabetes follow-up",
        "wait_minutes": 8,
        "joined_at": "2026-04-07T06:50:00",
    },
    {
        "id": "q-006", "visit_id": "v-006", "clinic_id": "clinic-1",
        "patient_name": "Suresh Bhai", "age": 28, "gender": "Male",
        "priority": "P3", "position": 6, "status": "waiting",
        "chief_complaint": "Minor skin rash on forearm",
        "wait_minutes": 5,
        "joined_at": "2026-04-07T06:55:00",
    },
]


class QueueJoinRequest(BaseModel):
    visit_id: str
    clinic_id: str
    priority: str
    patient_name: str
    age: int
    gender: str
    chief_complaint: str


class QueueUpdateRequest(BaseModel):
    status: str
    note: Optional[str] = None


@router.get("/list/{clinic_id}")
async def get_queue(clinic_id: str):
    """Returns the sorted queue for a clinic: P1 → P2 → P3, then by wait time."""
    priority_order = {"P1": 0, "P2": 1, "P3": 2}
    waiting = [e for e in _demo_queue if e["status"] == "waiting"]
    sorted_queue = sorted(
        waiting,
        key=lambda x: (priority_order.get(x["priority"], 3), -x["wait_minutes"])
    )
    return {"queue": sorted_queue, "total": len(sorted_queue)}


@router.post("/join")
async def join_queue(req: QueueJoinRequest):
    """Add a patient to the queue after triage."""
    position = len([e for e in _demo_queue if e["status"] == "waiting"]) + 1
    entry = {
        "id": f"q-{len(_demo_queue)+1:03d}",
        "visit_id": req.visit_id,
        "clinic_id": req.clinic_id,
        "patient_name": req.patient_name,
        "age": req.age,
        "gender": req.gender,
        "priority": req.priority,
        "position": position,
        "status": "waiting",
        "chief_complaint": req.chief_complaint,
        "wait_minutes": 0,
        "joined_at": datetime.utcnow().isoformat(),
    }
    _demo_queue.append(entry)
    return {"success": True, "queue_entry": entry, "position": position,
            "estimated_wait_minutes": position * 10}


@router.patch("/{entry_id}/call")
async def call_patient(entry_id: str):
    """Mark patient as called for teleconsultation."""
    for entry in _demo_queue:
        if entry["id"] == entry_id:
            entry["status"] = "called"
            return {"success": True, "entry": entry}
    return {"success": False, "error": "Queue entry not found"}


@router.patch("/{entry_id}/no-show")
async def mark_no_show(entry_id: str):
    for entry in _demo_queue:
        if entry["id"] == entry_id:
            entry["status"] = "no_show"
            return {"success": True}
    return {"success": False, "error": "Queue entry not found"}


@router.get("/stats/{clinic_id}")
async def get_stats(clinic_id: str):
    today = _demo_queue
    return {
        "total": len(today),
        "waiting": len([e for e in today if e["status"] == "waiting"]),
        "called": len([e for e in today if e["status"] == "called"]),
        "no_show": len([e for e in today if e["status"] == "no_show"]),
        "p1_count": len([e for e in today if e["priority"] == "P1"]),
        "p2_count": len([e for e in today if e["priority"] == "P2"]),
        "p3_count": len([e for e in today if e["priority"] == "P3"]),
        "avg_wait_minutes": 20,
    }
