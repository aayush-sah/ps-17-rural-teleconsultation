"""Voice transcription proxy — Whisper API or mock."""
import os
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel

router = APIRouter()
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"

DEMO_TRANSCRIPTS = [
    "Mujhe teen din se bukhaar hai aur sar mein dard ho raha hai",
    "Pet mein dard ho raha hai khana khane ke baad",
    "Khasi aur naak bah rahi hai",
    "Haath-pair mein kamzori ho rahi hai",
]
_transcript_idx = 0


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    global _transcript_idx
    if DEMO_MODE:
        # Cycle through demo transcripts
        transcript = DEMO_TRANSCRIPTS[_transcript_idx % len(DEMO_TRANSCRIPTS)]
        _transcript_idx += 1
        return {
            "transcript": transcript,
            "language": "hi",
            "translated": _translate_mock(transcript),
            "demo": True,
        }

    # Real Whisper API
    try:
        import openai
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        audio_bytes = await audio.read()
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=("audio.webm", audio_bytes, "audio/webm"),
            language="hi",
        )
        return {"transcript": response.text, "language": "hi", "demo": False}
    except Exception as e:
        return {"transcript": "", "error": str(e), "demo": False}


def _translate_mock(hindi_text: str) -> str:
    translations = {
        "Mujhe teen din se bukhaar hai aur sar mein dard ho raha hai": "I have had fever for three days with a headache",
        "Pet mein dard ho raha hai khana khane ke baad": "I have stomach pain after eating",
        "Khasi aur naak bah rahi hai": "I have a cough and runny nose",
        "Haath-pair mein kamzori ho rahi hai": "I am feeling weakness in my hands and legs",
    }
    return translations.get(hindi_text, "Symptom description (translated)")
