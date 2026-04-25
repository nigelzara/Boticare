
import React from 'react';

export type UserRole = 'patient' | 'professional';
export type ProfessionalTitle = 'Doctor' | 'Pharmacist';

export enum Page {
  // Patient Pages
  Dashboard = 'Dashboard',
  HealthMetrics = 'Health Metrics',
  Medications = 'Medications',
  Appointments = 'Appointments',
  MyDoctors = 'My Doctors',
  ChatBot = 'Chat Bot',
  Settings = 'Settings',
  HelpSupport = 'Help & Support',
  VideoCall = 'Video Call',
  ScheduleAppointment = 'Schedule Appointment',
  
  // Professional Pages
  ProfessionalDashboard = 'Dashboard ',
  PatientList = 'Patient List',
  ProfessionalSchedule = 'My Schedule',
  PersonalChat = 'Personal Chat',
  PharmacyPatients = 'Pharmacy Patients',
}

export enum AppointmentStatus {
  Upcoming = 'Upcoming',
  Completed = 'Completed',
  Canceled = 'Canceled',
  Rescheduled = 'Rescheduled',
}

export enum AppointmentType {
    CheckUp = 'Check-up',
    FollowUp = 'Follow-up',
    Consultation = 'Consultation',
    Initial = 'Initial',
}

export interface Document {
    id: string;
    name: string;
    type: 'pdf' | 'jpg' | 'png';
    date: string;
}

export interface Appointment {
  id: number;
  doctorName: string; 
  patientName: string;
  specialty: string;
  status: AppointmentStatus;
  type: AppointmentType;
  date: string;
  time: string;
  duration: number;
  notes: string;
  avatar: string; 
  summary?: string;
  documents?: Document[];
  patientId: string; // Added for Supabase linking
  professionalId: string; // Added for Supabase linking
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  percentageLeft: number;
  nextDose: string;
  isTaken: boolean;
  refillNeeded?: string;
}

export interface PrescriptionRefillRequest {
    id: string | number; // Updated to allow both mock IDs (number) and DB UUIDs (string)
    patientName: string;
    drugName: string;
    dosage: string; // Added dosage for editing
    timeAgo: string;
    patientId: string; // Added for Supabase linking
    professionalId: string; // Added for Supabase linking
    isEditing?: boolean; // For UI state
    editedDrugName?: string; // For inline/modal editing
    editedDosage?: string; // For inline/modal editing
}

// Added HealthMetricStatus enum
export enum HealthMetricStatus {
  Normal = 'Normal',
  Warning = 'Warning',
}

// Added HistoricalDataPoint interface
export interface HistoricalDataPoint {
  date: string;
  value: number;
}

// Updated HealthMetric to use enums and interfaces
export interface HealthMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: HealthMetricStatus;
  trend: string;
  trendDirection: 'up' | 'down' | 'stable';
  history: HistoricalDataPoint[];
}

// Added AlertLevel enum
export enum AlertLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

// Added HealthAlert interface
export interface HealthAlert {
  id: number;
  title: string;
  description: string;
  level: AlertLevel;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Professional {
    id: number;
    name: string;
    specialty: string;
    avatar: string;
    rating: number;
    professionalTitle?: ProfessionalTitle; // Added professionalTitle
    // Added for MyDoctors component for displaying chat history
    lastMessage?: string; 
    lastMessageTime?: string;
    unread?: boolean;
    supabaseId: string; // Added for Supabase linking
}

export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    condition: string;
    status: 'Stable' | 'Critical' | 'Recovering';
    lastVisit: string;
    avatar: string;
    supabaseId: string; // Added for Supabase linking
}

export interface ChatMessage {
  sender: 'user' | 'ai' | 'professional' | 'patient';
  text: string;
  imageUrl?: string;
  sources?: Array<{ title: string; uri: string }>;
  timestamp: string;
  isRead?: boolean; // Added read status for messages
  status?: 'sent' | 'delivered' | 'read'; // Added granular status
}

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    role?: UserRole;
    professionalTitle?: ProfessionalTitle; // Now can be 'Doctor' or 'Pharmacist'
    specialty?: string;
    supabaseId?: string; // Added for Supabase linking
}

export interface BoticareNotification {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning';
    timestamp: string;
    read: boolean;
}

export interface AvailabilitySlot {
    id?: string;
    dayOfWeek: string;
    startTime: string; 
    endTime: string;
}

// Added VideoCallRecord interface
export interface VideoCallRecord {
    id: string;
    professionalName: string;
    professionalAvatar: string;
    date: string;
    time: string;
    duration: string | number; // Updated to support seconds
}

// Added Symptom interface
export interface Symptom {
    id: string;
    name: string;
    date: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    description: string;
}

// Added NewAppointmentDetails interface
export interface NewAppointmentDetails {
    consultationType: 'video' | 'chat';
    professional: Professional;
    date: string;
    time: string;
    notes: string;
}

export interface PharmacyPatient {
  id: string;
  uniqueCode: string;
  createdBy: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  bloodGlucose: number | null;
  temperature: number | null;
  heightCm: number | null;
  weightKg: number | null;
  bmi: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientMedication {
  id: string;
  pharmacyPatientId: string;
  medicationName: string;
  dose: string;
  frequency: string;
  durationDays: number;
  startDate: string;
  doseTimes: string[];
  isActive: boolean;
  purchasedAt: string;
  createdBy: string;
  notes: string;
}

export interface DosageReminder {
  id: string;
  patientName: string;
  medicationName: string;
  dose: string;
  scheduledTime: string;
  isOverdue: boolean;
  isTaken: boolean;
  pharmacyPatientId: string;
  medicationId: string;
}
