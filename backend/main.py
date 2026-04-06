"""
PS-17 Teleconsultation System — FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import triage, queue, prescriptions, voice, soap, followups, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 PS-17 Backend starting up...")
    yield
    print("🛑 PS-17 Backend shutting down...")


app = FastAPI(
    title="PS-17 Teleconsultation API",
    description="Rural PHC Teleconsultation Queue & Triage Management System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(triage.router, prefix="/api/triage", tags=["Triage"])
app.include_router(queue.router, prefix="/api/queue", tags=["Queue"])
app.include_router(soap.router, prefix="/api/soap", tags=["SOAP"])
app.include_router(prescriptions.router, prefix="/api/prescriptions", tags=["Prescriptions"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice"])
app.include_router(followups.router, prefix="/api/followups", tags=["Follow-ups"])


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "PS-17 Teleconsultation API",
        "version": "1.0.0",
        "demo_mode": True,
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
