
-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Profiles table with role-based fields
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  name text,
  email text,
  avatar_url text,
  phone text,
  role text default 'patient', -- 'patient' or 'professional'
  professional_title text, -- 'Doctor' or 'Pharmacist'
  specialty text
);

-- Appointments and Clinical Schedule
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) not null,
  professional_id uuid references public.profiles(id) not null,
  scheduled_at timestamp with time zone not null,
  status text default 'upcoming', -- upcoming, completed, canceled, rescheduled
  type text not null, -- check-up, follow-up, etc.
  duration_minutes integer default 30,
  notes text,
  summary text, -- AI-generated or doctor-written summary
  created_at timestamp with time zone default now()
);

-- Video Call Sessions Log
create table if not exists public.video_call_sessions (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references public.appointments(id) not null,
  professional_id uuid references public.profiles(id),
  patient_id uuid references public.profiles(id),
  started_at timestamp with time zone default now(),
  ended_at timestamp with time zone,
  duration_seconds integer,
  recording_url text,
  quality_rating integer
);

-- Prescription Refill Requests
create table if not exists public.requested_drug_refills (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) not null,
  professional_id uuid references public.profiles(id),
  drug_name text not null,
  dosage text not null,
  status text default 'pending', -- pending, approved, declined
  requested_at timestamp with time zone default now(),
  responded_at timestamp with time zone,
  pharmacist_notes text
);

-- Patient AI Chatbot Sessions
create table if not exists public.patient_chatbot_sessions (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) not null,
  transcript jsonb, -- array of messages
  last_activity timestamp with time zone default now()
);

-- Personalized Secure Messaging (HP <-> Patient)
create table if not exists public.personalized_chat_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) not null,
  recipient_id uuid references public.profiles(id) not null,
  content text not null,
  is_read boolean default false,
  sent_at timestamp with time zone default now()
);

-- Professional Availability
create table if not exists public.professional_availability (
  id uuid default gen_random_uuid() primary key,
  professional_id uuid references public.profiles(id) not null,
  day_of_week text not null, -- e.g., 'Monday', 'Tuesday'
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default now()
  -- Removed unique constraint to allow multiple slots per day
);

-- Pharmacy Patient Database
create table if not exists public.pharmacy_patients (
  id uuid default gen_random_uuid() primary key,
  unique_code text unique not null,
  created_by uuid references public.profiles(id) not null,
  name text not null,
  email text,
  phone text not null,
  gender text,
  date_of_birth date,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  blood_glucose numeric,
  temperature numeric,
  height_cm numeric,
  weight_kg numeric,
  bmi numeric,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Patient Medications (for dosage reminders)
create table if not exists public.patient_medications (
  id uuid default gen_random_uuid() primary key,
  pharmacy_patient_id uuid references public.pharmacy_patients(id) on delete cascade not null,
  medication_name text not null,
  dose text not null,
  frequency text not null,
  duration_days integer not null,
  start_date date not null,
  dose_times jsonb default '[]'::jsonb,
  is_active boolean default true,
  purchased_at timestamp with time zone default now(),
  created_by uuid references public.profiles(id) not null,
  notes text
);

-- Security Policies (RLS)
alter table public.profiles enable row level security;
alter table public.appointments enable row level security;
alter table public.personalized_chat_messages enable row level security;
alter table public.requested_drug_refills enable row level security;
alter table public.professional_availability enable row level security;
alter table public.video_call_sessions enable row level security;
alter table public.pharmacy_patients enable row level security;
alter table public.patient_medications enable row level security;

-- Drop existing policies to allow re-running script without errors
drop policy if exists "Users can see their own data" on public.profiles;
drop policy if exists "HPs can see patients they interact with" on public.profiles;
drop policy if exists "Patients can see their HPs" on public.profiles;
drop policy if exists "Everyone can create profiles" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

drop policy if exists "HPs can manage their own appointments" on public.appointments;
drop policy if exists "Patients can view their appointments" on public.appointments;
drop policy if exists "Patients can create their own appointments" on public.appointments;

drop policy if exists "Users can send and receive personal messages" on public.personalized_chat_messages;

drop policy if exists "HPs can manage refill requests for their patients" on public.requested_drug_refills;
drop policy if exists "Patients can view and create their own refill requests" on public.requested_drug_refills;

drop policy if exists "Patients can manage their chatbot sessions" on public.patient_chatbot_sessions;

drop policy if exists "Professionals can manage their own availability" on public.professional_availability;

drop policy if exists "Users can view their own video call sessions" on public.video_call_sessions;
drop policy if exists "Users can create video call sessions linked to their appointments" on public.video_call_sessions;

-- Re-create Policies

-- Profiles
create policy "Users can see their own data" on public.profiles for select using (auth.uid() = id);
create policy "HPs can see patients they interact with" on public.profiles for select using (
  id IN (SELECT patient_id FROM public.appointments WHERE professional_id = auth.uid()) OR
  id IN (SELECT patient_id FROM public.requested_drug_refills WHERE professional_id = auth.uid()) OR
  id IN (SELECT recipient_id FROM public.personalized_chat_messages WHERE sender_id = auth.uid())
);
create policy "Patients can see their HPs" on public.profiles for select using (
  id IN (SELECT professional_id FROM public.appointments WHERE patient_id = auth.uid()) OR
  id IN (SELECT professional_id FROM public.requested_drug_refills WHERE patient_id = auth.uid()) OR
  id IN (SELECT sender_id FROM public.personalized_chat_messages WHERE recipient_id = auth.uid())
);
create policy "Everyone can create profiles" on public.profiles for insert with check (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Appointments
create policy "HPs can manage their own appointments" on public.appointments
  for all using (professional_id = auth.uid()) with check (professional_id = auth.uid());
create policy "Patients can view their appointments" on public.appointments
  for select using (patient_id = auth.uid());
create policy "Patients can create their own appointments" on public.appointments
  for insert with check (patient_id = auth.uid());

-- Personalized Chat Messages
create policy "Users can send and receive personal messages" on public.personalized_chat_messages
  for all using (sender_id = auth.uid() OR recipient_id = auth.uid()) with check (sender_id = auth.uid());

-- Requested Drug Refills
create policy "HPs can manage refill requests for their patients" on public.requested_drug_refills
  for all using (professional_id = auth.uid()) with check (professional_id = auth.uid());
create policy "Patients can view and create their own refill requests" on public.requested_drug_refills
  for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());

-- Patient Chatbot Sessions
create policy "Patients can manage their chatbot sessions" on public.patient_chatbot_sessions
  for all using (patient_id = auth.uid()) with check (patient_id = auth.uid());

-- Professional Availability
create policy "Professionals can manage their own availability" on public.professional_availability
  for all using (professional_id = auth.uid()) with check (professional_id = auth.uid());

-- Video Call Sessions
create policy "Users can view their own video call sessions" on public.video_call_sessions
  for select using (
    auth.uid() IN (SELECT patient_id FROM public.appointments WHERE id = appointment_id) OR
    auth.uid() IN (SELECT professional_id FROM public.appointments WHERE id = appointment_id)
  );
create policy "Users can create video call sessions linked to their appointments" on public.video_call_sessions
  for insert with check (
    auth.uid() IN (SELECT patient_id FROM public.appointments WHERE id = appointment_id) OR
    auth.uid() IN (SELECT professional_id FROM public.appointments WHERE id = appointment_id)
  );

-- Pharmacy Patients
drop policy if exists "Pharmacists can manage their own patients" on public.pharmacy_patients;
drop policy if exists "Any professional can lookup patients by code" on public.pharmacy_patients;
create policy "Pharmacists can manage their own patients" on public.pharmacy_patients
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "Any professional can lookup patients by code" on public.pharmacy_patients
  for select using (true); -- Code-based authorization; entering correct code = sufficient

-- Patient Medications
drop policy if exists "Pharmacists can manage medications for their patients" on public.patient_medications;
drop policy if exists "Any professional can view medications" on public.patient_medications;
create policy "Pharmacists can manage medications for their patients" on public.patient_medications
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "Any professional can view medications" on public.patient_medications
  for select using (true);
