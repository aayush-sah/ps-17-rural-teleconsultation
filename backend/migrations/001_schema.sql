-- PS-17 Teleconsultation System: Full Supabase Schema
-- Run in Supabase SQL Editor

-- ─── CLINICS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  district    TEXT,
  state       TEXT DEFAULT 'Gujarat',
  phone       TEXT,
  coordinates JSONB,  -- {lat, lng}
  timezone    TEXT DEFAULT 'Asia/Kolkata',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STAFF ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id  UUID REFERENCES clinics(id),
  role       TEXT NOT NULL CHECK (role IN ('asha_worker','doctor','coordinator','admin')),
  name       TEXT NOT NULL,
  phone      TEXT UNIQUE NOT NULL,
  pin_hash   TEXT,                        -- bcrypt 4-digit PIN for shared tablet
  is_online  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PATIENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone               TEXT UNIQUE NOT NULL,
  full_name           TEXT NOT NULL,
  dob                 DATE,
  gender              TEXT,
  village             TEXT,
  abha_id             TEXT,
  known_conditions    TEXT[] DEFAULT '{}',
  allergies           TEXT[] DEFAULT '{}',
  current_meds        TEXT[] DEFAULT '{}',
  preferred_language  TEXT DEFAULT 'hi',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── VISITS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id   UUID REFERENCES patients(id),
  clinic_id    UUID REFERENCES clinics(id),
  asha_id      UUID REFERENCES staff(id),
  status       TEXT DEFAULT 'registered'
               CHECK (status IN ('registered','triaged','in_queue','in_consult','completed','referred')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ─── TRIAGE RECORDS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS triage_records (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id                UUID REFERENCES visits(id),
  raw_inputs              JSONB,
  priority                TEXT CHECK (priority IN ('P1','P2','P3')),
  confidence              FLOAT,
  reasoning               TEXT,
  hard_override_triggered BOOLEAN DEFAULT false,
  override_rule           TEXT,
  flags                   TEXT[] DEFAULT '{}',
  recommend_vitals        TEXT[] DEFAULT '{}',
  human_reviewed          BOOLEAN DEFAULT false,
  reviewed_by             UUID REFERENCES staff(id),
  review_note             TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─── QUEUE ENTRIES (Realtime enabled) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS queue_entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id   UUID REFERENCES visits(id) UNIQUE,
  clinic_id  UUID REFERENCES clinics(id),
  priority   TEXT CHECK (priority IN ('P1','P2','P3')),
  position   INT,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  called_at  TIMESTAMPTZ,
  status     TEXT DEFAULT 'waiting' CHECK (status IN ('waiting','called','no_show'))
);

-- Enable Realtime on queue_entries
ALTER PUBLICATION supabase_realtime ADD TABLE queue_entries;

-- ─── CONSULTATIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consultations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id   UUID REFERENCES visits(id),
  doctor_id  UUID REFERENCES staff(id),
  soap_brief JSONB,  -- {subjective, objective, assessment, plan}
  notes      TEXT,
  diagnosis  TEXT,
  refer_to   TEXT,
  started_at TIMESTAMPTZ,
  ended_at   TIMESTAMPTZ
);

-- ─── PRESCRIPTIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES consultations(id),
  medications     JSONB,  -- [{name, dose, frequency, duration, instructions}]
  pdf_url         TEXT,
  sent_via        TEXT[] DEFAULT '{}',
  sent_at         TIMESTAMPTZ
);

-- ─── FOLLOW-UPS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS followups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id     UUID REFERENCES visits(id),
  type         TEXT CHECK (type IN ('medication_reminder','checkin','deterioration_alert')),
  scheduled_at TIMESTAMPTZ,
  sent_at      TIMESTAMPTZ,
  response     TEXT,
  escalated    BOOLEAN DEFAULT false
);

-- ─── AUDIT LOG ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_id UUID,
  action      TEXT,
  resource    TEXT,
  resource_id UUID,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SEED DATA ─────────────────────────────────────────────────────────────
INSERT INTO clinics (id, name, district, state)
VALUES ('00000000-0000-0000-0000-000000000001', 'Anand Primary Health Centre', 'Anand', 'Gujarat')
ON CONFLICT DO NOTHING;

INSERT INTO staff (clinic_id, role, name, phone, pin_hash) VALUES
('00000000-0000-0000-0000-000000000001', 'asha_worker',  'Kamla Bai',        '9198001001', '$2b$12$DEMOASHDEMO'),
('00000000-0000-0000-0000-000000000001', 'doctor',       'Dr. Priya Sharma', '9198001002', '$2b$12$DEMODRDEMO0'),
('00000000-0000-0000-0000-000000000001', 'coordinator',  'Arun Kumar',       '9198001003', '$2b$12$DEMOCODEMO0')
ON CONFLICT DO NOTHING;
