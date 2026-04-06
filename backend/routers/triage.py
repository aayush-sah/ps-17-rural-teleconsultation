"""
Two-Stage AI Triage Engine
Stage 1: Hard override rules (code-level, no LLM)
Stage 2: Groq-powered LLM classification (Llama-3)
"""
import os
import json
import re
from fastapi import APIRouter, HTTPException
from models import TriageInput, TriageOutput, Priority

router = APIRouter()

DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

# ─────────────────────────────────────────────
# STAGE 1: Hard Override Rules — ALWAYS runs first.
# Safety-critical. No LLM can override these.
# ─────────────────────────────────────────────
HARD_OVERRIDE_RULES = [
    (["chest pain", "chest tightness", "chest pressure"],
     "Potential cardiac event — immediate assessment required"),
    (["difficulty breathing", "shortness of breath", "can't breathe", "cannot breathe", "breathlessness"],
     "Respiratory emergency — airway compromise risk"),
    (["unconscious", "unresponsive", "loss of consciousness", "fainted", "collapsed"],
     "Altered consciousness — possible neurological emergency"),
    (["seizure", "convulsion", "fitting", "epileptic"],
     "Active/recent seizure — neurological emergency"),
    (["heavy bleeding", "uncontrolled bleeding", "hemorrhage"],
     "Hemorrhage risk — immediate intervention required"),
    (["stroke", "face drooping", "arm weakness", "slurred speech", "facial droop"],
     "Stroke symptoms (FAST positive) — time-critical intervention"),
    (["poisoning", "overdose", "swallowed", "ingested chemical"],
     "Poisoning/overdose — gastric decontamination may be needed"),
    (["severe allergic", "anaphylaxis", "hives and breathing"],
     "Anaphylaxis risk — epinephrine may be required"),
]


def check_hard_overrides(data: TriageInput) -> tuple[bool, str]:
    """Returns (triggered, rule_description)."""
    text = (
        f"{data.chief_complaint} {' '.join(data.associated_symptoms)}"
    ).lower()

    for keywords, rule in HARD_OVERRIDE_RULES:
        if any(kw in text for kw in keywords):
            return True, rule

    # Vitals-based hard overrides
    if data.spo2 is not None and data.spo2 < 90:
        return True, "SpO2 below 90% — critical hypoxia detected"
    if data.temp is not None and data.age <= 2 and data.temp > 40.0:
        return True, "Infant with fever above 40°C — febrile emergency"
    if data.temp is not None and data.temp > 40.0 and data.severity >= 8:
        return True, "High fever with severe self-rated severity — urgent assessment"

    return False, ""


# ─────────────────────────────────────────────
# STAGE 2: LLM Classification (stub/real)
# ─────────────────────────────────────────────
TRIAGE_SYSTEM_PROMPT = """You are a clinical triage assistant for a rural primary health centre in India.
Classify patient severity based on reported symptoms only.
You do NOT diagnose. You do NOT recommend treatment.
Output ONLY valid JSON — no preamble, no text outside the JSON.

Priority levels:
  P1 = Immediate — potential life-threatening or time-sensitive
  P2 = Moderate urgency — needs attention within 30-60 minutes
  P3 = Low urgency — stable, can wait

If confidence is below 0.70, set priority to P2 or higher.
When in doubt, escalate. Never set P3 on ambiguous flags.

Required JSON format:
{
  "priority": "P1" | "P2" | "P3",
  "confidence": 0.0-1.0,
  "reasoning": "1-2 sentences a non-medical coordinator can read",
  "flags": ["notable", "symptom", "signals"],
  "recommend_vitals": ["BP", "SpO2", "Temperature"]
}"""


def build_triage_user_prompt(data: TriageInput) -> str:
    return f"""Patient: Age {data.age}, Gender {data.gender}
Known conditions: {', '.join(data.known_conditions) or 'None'}
Current medications: {', '.join(data.current_meds) or 'None'} | Allergies: {', '.join(data.allergies) or 'None'}
Chief complaint: {data.chief_complaint} | Duration: {data.duration}
Severity (self-rated 1-10): {data.severity}
Associated symptoms: {', '.join(data.associated_symptoms) or 'None'}
Mobility: {data.mobility}
Vitals: BP={data.bp or 'Not measured'}, Temp={data.temp or 'Not measured'}°C, SpO2={data.spo2 or 'Not measured'}%
Classify this patient."""


async def classify_with_llm(data: TriageInput) -> dict:
    """Calls Groq API (real) or returns mock (demo mode)."""
    if DEMO_MODE:
        # Smart mock based on symptom content
        text = f"{data.chief_complaint} {' '.join(data.associated_symptoms)}".lower()
        if data.severity >= 7 or any(w in text for w in ["pain", "fever", "vomit"]):
            return {
                "priority": "P2",
                "confidence": 0.84,
                "reasoning": "Moderate severity with pain/fever. Needs assessment within 30-60 minutes to rule out infection or obstruction.",
                "flags": ["elevated_severity", "pain_reported"],
                "recommend_vitals": ["BP", "Temperature", "SpO2"],
            }
        return {
            "priority": "P3",
            "confidence": 0.91,
            "reasoning": "Mild symptoms with low self-rated severity. Patient is stable and can wait for routine consultation.",
            "flags": ["mild_presentation"],
            "recommend_vitals": ["Temperature"],
        }

    # Real Groq API call
    try:
        import groq
        client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": TRIAGE_SYSTEM_PROMPT},
                {"role": "user", "content": build_triage_user_prompt(data)}
            ],
            response_format={"type": "json_object"}
        )
        raw = response.choices[0].message.content.strip()
        return json.loads(raw)
    except Exception as e:
        # Fallback: escalate to P2 on LLM failure (never block patient)
        return {
            "priority": "P2",
            "confidence": 0.50,
            "reasoning": f"LLM unavailable — auto-escalated to P2 for coordinator review. Error: {str(e)[:80]}",
            "flags": ["llm_failure", "needs_review"],
            "recommend_vitals": ["BP", "Temperature", "SpO2"],
        }


@router.post("/process", response_model=TriageOutput)
async def process_triage(data: TriageInput):
    """
    Two-stage triage engine.
    Stage 1: Hard override rules (code-level, LLM-proof)
    Stage 2: LLM classification with confidence enforcement
    """
    # ── STAGE 1 ──────────────────────────────────────────
    override_triggered, override_rule = check_hard_overrides(data)

    if override_triggered:
        return TriageOutput(
            priority=Priority.P1,
            confidence=1.0,
            reasoning=override_rule,
            hard_override_triggered=True,
            override_rule=override_rule,
            flags=["hard_override"],
            recommend_vitals=["BP", "SpO2", "Temperature", "Pulse"],
        )

    # ── STAGE 2 ──────────────────────────────────────────
    llm_result = await classify_with_llm(data)

    priority = llm_result.get("priority", "P2")
    confidence = float(llm_result.get("confidence", 0.5))
    reasoning = llm_result.get("reasoning", "")
    flags = llm_result.get("flags", [])
    recommend_vitals = llm_result.get("recommend_vitals", [])

    # ── SAFETY NET: Confidence Enforcement ───────────────
    human_review_needed = False
    if confidence < 0.70 and priority == "P3":
        priority = "P2"
        reasoning += " (Auto-escalated: confidence below 70% — flagged for coordinator review)"
        flags.append("low_confidence_escalated")
        human_review_needed = True

    return TriageOutput(
        priority=Priority(priority),
        confidence=confidence,
        reasoning=reasoning,
        hard_override_triggered=False,
        flags=flags,
        recommend_vitals=recommend_vitals,
    )
