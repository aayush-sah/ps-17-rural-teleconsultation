<div align="center">
  <img src="https://assets.objkt.media/file/assets-graphql/QmTrfPnpZpXfNn5F1hZ4e5LpX7N1m2pE9bS9jH5C9wQG" alt="PS-17 Teleconsult Banner" width="100%" style="border-radius:20px"/>
  <br/>
  
  <h1>🏥 Rural Teleconsultation & Triage System (PS-17)</h1>
  <p><strong>AI-Powered Triage, Real-Time Queues, and Offline-First Architecture for Indian PHCs.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/AI%20Engine-Groq%20Llama--3-f59e0b?style=for-the-badge&logo=anthropic&logoColor=white" alt="Groq" />
    <img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  </p>
</div>

---

## 🚀 Overview

Rural primary health centres (PHCs) in India face chronic understaffing and unmanaged patient queues. **PS-17 Teleconsultation System** introduces a robust, 2G-friendly Progressive Web App (PWA) designed to triage patients at the edge using AI, prioritize them in real-time queues, and connect them to remote specialists instantly.

---

## 🌟 Key Features

- 🧠 **Groq-Powered AI Triage**: Two-stage triage engine. Fast, hardcoded logic catches life-threatening conditions (P1), while Llama-3 classifies remaining patients by clinical severity and urgency (P2/P3).
- ⚡ **Live Queue Management**: Supabase WebSockets ensure waiting lists update synchronously across all shared clinic tablets without refreshing.
- 📱 **Rural-Friendly Patient Assessment**: Low-literacy UI featuring multi-lingual voice transcription (Whisper AI routing) and tap-based anatomical body maps for symptom logging.
- 👨‍⚕️ **Clinical Workspace**: Embedded Daily.co WebRTC video consults, structured SOAP brief generation, and "Cloud Rx" digital prescription execution.
- 📡 **Offline & Low-Bandwidth Ready**: Built to handle 2G drop-outs using native PWA caching and sync-on-reconnect fallback design.

---

## 🛠 Tech Stack

### Frontend (User & Clinical App)
* **Framework:** Next.js 14 (App Router)
* **Styling & Motion:** Tailwind CSS v4 + Framer Motion (Optimized Glassmorphism)
* **State & Data:** React Hook Form + Supabase Client

### Backend (Logic & External APIs)
* **Server:** FastAPI (Python)
* **LLM Logic:** Groq API (Llama-3-70b-8192) for high-speed triage decisions.
* **Integrations:** MSG91 (Mocked SMS/WhatsApp delivery) + Daily.co (Telehealth)

---

## 📂 Project Architecture

```bash
📦 PS-17-Rural-Teleconsultation
 ┣ 📂 frontend/              # Next.js 14 Progressive Web App
 ┃ ┣ 📂 src/app/
 ┃ ┃ ┣ 📂 auth/          # OTP Login & Shared Tablet PIN switcher
 ┃ ┃ ┣ 📂 patient/       # ASHA Worker Intake Wizard (Body-Map, Vitals)
 ┃ ┃ ┣ 📂 doctor/        # Doctor Panel (SOAP, Daily.co Video, Prescription)
 ┃ ┃ ┗ 📂 coordinator/   # Clinic Staff Live Floor View
 ┃ ┗ 📜 tailwind.config.ts   # Custom Glassmorphism Theme
 ┗ 📂 backend/               # FastAPI Backend Network
   ┣ 📂 routers/
   ┃ ┣ 📜 triage.py          # Stage 1 + Stage 2 (Groq AI) Pipeline
   ┃ ┣ 📜 queue.py           # Real-Time Queue Socket Logic
   ┃ ┗ 📜 prescriptions.py   # PDF Cloud Generation Setup
   ┗ 📜 requirements.txt     # Python Dependencies
```


## 💻 Getting Started Locally

### Setup the Backend (FastAPI)
1. Cd into the backend and setup your environment:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # (Windows)
source venv/bin/activate # (Mac/Linux)

pip install -r requirements.txt
```
2. Populate your `.env` file with your `GROQ_API_KEY`.
3. Start the server:
```bash
uvicorn main:app --reload --port 8000
```

### Setup the Frontend (Next.js)
1. Cd into the frontend directory:
```bash
cd frontend
npm install
```
2. Setup your `.env.local` to point to the FastAPI proxy on port 8000.
3. Start the PWA Development Server:
```bash
npm run dev
```
Open `http://localhost:3000` to view the application in action.

---

<div align="center">
  <p><b>Built for the PS-17 Health Informatics Problem Statement 🇮🇳</b></p>
  <p><i>DPDPA 2023 Compliant Architecture</i></p>
</div>
