import { Appointment, Medication, HealthMetric, HealthAlert, AppointmentStatus, HealthMetricStatus, AlertLevel, Professional, AppointmentType, VideoCallRecord, Patient, PharmacyPatient, PatientMedication } from './types';
import { HeartIcon, PillIcon, GlucoseIcon, CalendarIcon } from './components/Icons';

export const APPOINTMENTS_DATA: Appointment[] = [
  { 
      id: 1, 
      doctorName: 'Dr. Mike Ralph', 
      specialty: 'Cardiologist', 
      status: AppointmentStatus.Upcoming, 
      type: AppointmentType.FollowUp, 
      date: 'Today, June 6, 2025', 
      time: '4:00 PM', 
      duration: 30, 
      notes: 'Follow up on recent Blood Pressure medication changes', 
      avatar: 'https://i.pravatar.cc/150?u=doc1',
      patientName: 'Jane Doe',
      patientId: 'patient1_supabase_id', // Mock Supabase ID
      professionalId: 'pro1_supabase_id', // Mock Supabase ID
      documents: [
          { id: 'doc1', name: 'Blood Test Results.pdf', type: 'pdf', date: 'June 1, 2025' },
          { id: 'doc2', name: 'Cardiology Referral.jpg', type: 'jpg', date: 'May 20, 2025' }
      ]
  },
  { 
      id: 2, 
      doctorName: 'Dr. Lolla Kachi', 
      specialty: 'Endocrinologist', 
      status: AppointmentStatus.Completed, 
      type: AppointmentType.Consultation, 
      date: 'Today, June 4, 2025', 
      time: '8:00 PM', 
      duration: 50, 
      notes: 'Discuss recent test results & treatment options', 
      avatar: 'https://i.pravatar.cc/150?u=doc2',
      patientName: 'Jane Doe',
      patientId: 'patient1_supabase_id', // Mock Supabase ID
      professionalId: 'pro2_supabase_id', // Mock Supabase ID
      documents: []
  },
  { 
      id: 3, 
      doctorName: 'Dr. Danny Joe', 
      specialty: 'Neurologist', 
      status: AppointmentStatus.Canceled, 
      type: AppointmentType.Initial, 
      date: 'Today, June 5, 2025', 
      time: '6:00 PM', 
      duration: 60, 
      notes: 'Initial consultation for migraine symptoms', 
      avatar: 'https://i.pravatar.cc/150?u=doc3',
      patientName: 'Jane Doe',
      patientId: 'patient1_supabase_id', // Mock Supabase ID
      professionalId: 'pro3_supabase_id', // Mock Supabase ID
  },
  { 
      id: 4, 
      doctorName: 'Dr. Hephzibah O', 
      specialty: 'Endocrinologist', 
      status: AppointmentStatus.Rescheduled, 
      type: AppointmentType.Consultation, 
      date: 'Today, June 4, 2025', 
      time: '8:00 PM', 
      duration: 30, 
      notes: 'Discuss recent test results & treatment options', 
      avatar: 'https://i.pravatar.cc/150?u=doc4',
      patientName: 'Jane Doe',
      patientId: 'patient1_supabase_id', // Mock Supabase ID
      professionalId: 'pro4_supabase_id', // Mock Supabase ID
  },
];

export const MEDICATIONS_DATA: Medication[] = [
  { id: 1, name: 'Metformin', dosage: '500mg • Twice daily', percentageLeft: 65, nextDose: 'Next dose at 9:00 PM', isTaken: false },
  { id: 2, name: 'Lisinopril', dosage: '10mg • Once daily', percentageLeft: 25, nextDose: 'Next dose at 8:00 AM', isTaken: false, refillNeeded: 'Refill needed by June 28' },
  { id: 3, name: 'Vitamin C', dosage: '1000IU • Once daily', percentageLeft: 82, nextDose: 'Next dose at 8:00 AM', isTaken: true },
  { id: 4, name: 'Artovastatin', dosage: '20mg • Once daily', percentageLeft: 20, nextDose: 'Next dose at 9:00 PM', isTaken: false, refillNeeded: 'Refill needed by June 28' },
  { id: 5, name: 'Aspirin', dosage: '81mg • Once daily', percentageLeft: 90, nextDose: 'Next dose at 8:00 AM', isTaken: true },
];

export const HEALTH_METRICS_DATA: HealthMetric[] = [
    { 
        id: 'hr', 
        name: 'Heart Rate', 
        value: '72', 
        unit: 'bpm', 
        status: HealthMetricStatus.Normal, 
        trend: '0% stable', 
        trendDirection: 'stable',
        history: [
            { date: 'Mon', value: 70 },
            { date: 'Tue', value: 72 },
            { date: 'Wed', value: 75 },
            { date: 'Thu', value: 71 },
            { date: 'Fri', value: 73 },
            { date: 'Sat', value: 72 },
            { date: 'Sun', value: 70 },
        ]
    },
    { 
        id: 'bp', 
        name: 'Blood Pressure', 
        value: '120', 
        unit: 'mmHg', 
        status: HealthMetricStatus.Normal, 
        trend: '0% stable', 
        trendDirection: 'stable',
        history: [
            { date: 'Mon', value: 118 },
            { date: 'Tue', value: 120 },
            { date: 'Wed', value: 122 },
            { date: 'Thu', value: 119 },
            { date: 'Fri', value: 121 },
            { date: 'Sat', value: 120 },
            { date: 'Sun', value: 120 },
        ]
    },
    { 
        id: 'bg', 
        name: 'Blood Glucose', 
        value: '110', 
        unit: 'mg/dL', 
        status: HealthMetricStatus.Warning, 
        trend: '5% increase', 
        trendDirection: 'up',
        history: [
            { date: 'Mon', value: 95 },
            { date: 'Tue', value: 98 },
            { date: 'Wed', value: 102 },
            { date: 'Thu', value: 105 },
            { date: 'Fri', value: 108 },
            { date: 'Sat', value: 110 },
            { date: 'Sun', value: 112 },
        ]
    },
];

export const HEALTH_ALERTS_DATA: HealthAlert[] = [
    { id: 1, title: 'Elevated Blood Glucose', description: 'Your blood glucose level has been above normal for the past 3 readings.', level: AlertLevel.Medium, time: '08:03 AM', icon: GlucoseIcon },
    { id: 2, title: 'Missed Medication', description: 'You missed your morning dose of Lisinopril', level: AlertLevel.High, time: '10:00 AM', icon: PillIcon },
    { id: 3, title: 'Upcoming Appointment', description: 'Reminder: You have a video consultation with Dr Ralph Mike tomorrow at 08:00 PM', level: AlertLevel.Low, time: '08:00 PM', icon: CalendarIcon },
];

export const PROFESSIONALS_DATA: Professional[] = [
  { id: 1, name: 'Dr. Mike Ralph', specialty: 'Cardiologist', avatar: 'https://i.pravatar.cc/150?u=doc1', rating: 5, supabaseId: 'pro1_supabase_id' },
  { id: 2, name: 'Pharm Will Otto', specialty: 'Neurologist', avatar: 'https://i.pravatar.cc/150?u=doc5', rating: 4, supabaseId: 'pro5_supabase_id' },
  { id: 3, name: 'Dr. Lolla Kachi', specialty: 'Oncologist', avatar: 'https://i.pravatar.cc/150?u=doc2', rating: 4, supabaseId: 'pro2_supabase_id' },
  { id: 4, name: 'Dr. Danny Joe', specialty: 'Ophthalmologist', avatar: 'https://i.pravatar.cc/150?u=doc3', rating: 5, supabaseId: 'pro3_supabase_id' },
];

export const VIDEO_CALL_HISTORY_DATA: VideoCallRecord[] = [
    { id: '1', professionalName: 'Dr. Mike Ralph', professionalAvatar: 'https://i.pravatar.cc/150?u=doc1', date: 'June 1, 2025', time: '10:00 AM', duration: '24:15' },
    { id: '2', professionalName: 'Dr. Lolla Kachi', professionalAvatar: 'https://i.pravatar.cc/150?u=doc2', date: 'May 20, 2025', time: '02:30 PM', duration: '15:00' },
];

// FIX: Added explicit Patient[] type annotation to ensure strict typing for MOCK_PATIENTS
export const MOCK_PATIENTS: Patient[] = [
    { id: '1', name: 'Jane Doe', age: 34, gender: 'Female', condition: 'Hypertension', status: 'Stable', lastVisit: 'June 6, 2025', avatar: 'https://i.pravatar.cc/150?u=jane', supabaseId: 'patient1_supabase_id' },
    { id: '2', name: 'John Smith', age: 45, gender: 'Male', condition: 'Type 2 Diabetes', status: 'Critical', lastVisit: 'June 4, 2025', avatar: 'https://i.pravatar.cc/150?u=john', supabaseId: 'patient2_supabase_id' },
    { id: '3', name: 'Alice Johnson', age: 28, gender: 'Female', condition: 'Migraine', status: 'Recovering', lastVisit: 'May 20, 2025', avatar: 'https://i.pravatar.cc/150?u=alice', supabaseId: 'patient3_supabase_id' },
    { id: '4', name: 'Robert Brown', age: 62, gender: 'Male', condition: 'Arthritis', status: 'Stable', lastVisit: 'June 1, 2025', avatar: 'https://i.pravatar.cc/150?u=robert', supabaseId: 'patient4_supabase_id' },
    { id: '5', name: 'Emily Davis', age: 50, gender: 'Female', condition: 'Asthma', status: 'Stable', lastVisit: 'May 15, 2025', avatar: 'https://i.pravatar.cc/150?u=emily', supabaseId: 'patient5_supabase_id' },
];

// Helper to get a time string near now for demo reminders
const getNearTime = (offsetMinutes: number): string => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + offsetMinutes);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export const MOCK_PHARMACY_PATIENTS: PharmacyPatient[] = [
    {
        id: 'pp1', uniqueCode: 'BOT-7K3A-X9P2', createdBy: 'pro1_supabase_id',
        name: 'Adaeze Okonkwo', email: 'adaeze.o@email.com', phone: '+234 801 234 5678',
        gender: 'Female', dateOfBirth: '1990-03-15',
        bloodPressureSystolic: 118, bloodPressureDiastolic: 76,
        bloodGlucose: 95, temperature: 36.6, heightCm: 165, weightKg: 62,
        bmi: 22.8, notes: 'Regular customer. No known drug allergies.',
        createdAt: '2025-05-01T10:00:00Z', updatedAt: '2025-06-06T14:30:00Z'
    },
    {
        id: 'pp2', uniqueCode: 'BOT-M2F8-Q4L7', createdBy: 'pro1_supabase_id',
        name: 'Chukwuemeka Nwosu', email: 'emeka.n@email.com', phone: '+234 802 345 6789',
        gender: 'Male', dateOfBirth: '1978-11-22',
        bloodPressureSystolic: 142, bloodPressureDiastolic: 92,
        bloodGlucose: 135, temperature: 37.1, heightCm: 178, weightKg: 95,
        bmi: 30.0, notes: 'Hypertensive. Type 2 diabetes diagnosed 2022. Monitor BP closely.',
        createdAt: '2025-04-15T09:00:00Z', updatedAt: '2025-06-05T11:00:00Z'
    },
    {
        id: 'pp3', uniqueCode: 'BOT-R5J1-W8N6', createdBy: 'pro1_supabase_id',
        name: 'Fatima Abdullahi', email: 'fatima.a@email.com', phone: '+234 803 456 7890',
        gender: 'Female', dateOfBirth: '1985-07-08',
        bloodPressureSystolic: 110, bloodPressureDiastolic: 70,
        bloodGlucose: 88, temperature: 36.4, heightCm: 160, weightKg: 55,
        bmi: 21.5, notes: 'Asthma patient. Uses inhaler PRN.',
        createdAt: '2025-03-20T08:00:00Z', updatedAt: '2025-06-01T16:00:00Z'
    },
    {
        id: 'pp4', uniqueCode: 'BOT-D9H3-Y6T5', createdBy: 'pro1_supabase_id',
        name: 'Oluwaseun Adeyemi', email: 'seun.a@email.com', phone: '+234 804 567 8901',
        gender: 'Male', dateOfBirth: '1995-01-30',
        bloodPressureSystolic: 120, bloodPressureDiastolic: 80,
        bloodGlucose: 92, temperature: 36.8, heightCm: 182, weightKg: 78,
        bmi: 23.5, notes: 'Post-malaria recovery. Complete course of antimalarials.',
        createdAt: '2025-06-01T12:00:00Z', updatedAt: '2025-06-06T09:00:00Z'
    },
    {
        id: 'pp5', uniqueCode: 'BOT-G4K7-Z2B9', createdBy: 'pro1_supabase_id',
        name: 'Ngozi Eze', email: 'ngozi.e@email.com', phone: '+234 805 678 9012',
        gender: 'Female', dateOfBirth: '1968-09-12',
        bloodPressureSystolic: 155, bloodPressureDiastolic: 98,
        bloodGlucose: 160, temperature: 36.9, heightCm: 158, weightKg: 82,
        bmi: 32.8, notes: 'Diabetic + hypertensive. High cardiovascular risk. Monthly checkups.',
        createdAt: '2025-02-10T07:00:00Z', updatedAt: '2025-06-04T13:00:00Z'
    },
];

export const MOCK_PATIENT_MEDICATIONS: PatientMedication[] = [
    {
        id: 'pm1', pharmacyPatientId: 'pp1', medicationName: 'Amoxicillin',
        dose: '500mg', frequency: 'Three times daily', durationDays: 7,
        startDate: '2025-06-04', doseTimes: ['08:00', '14:00', '20:00'],
        isActive: true, purchasedAt: '2025-06-04T10:00:00Z',
        createdBy: 'pro1_supabase_id', notes: 'For upper respiratory tract infection'
    },
    {
        id: 'pm2', pharmacyPatientId: 'pp2', medicationName: 'Metformin',
        dose: '500mg', frequency: 'Twice daily', durationDays: 90,
        startDate: '2025-04-15', doseTimes: ['08:00', '20:00'],
        isActive: true, purchasedAt: '2025-04-15T09:30:00Z',
        createdBy: 'pro1_supabase_id', notes: 'Type 2 diabetes management'
    },
    {
        id: 'pm3', pharmacyPatientId: 'pp2', medicationName: 'Amlodipine',
        dose: '5mg', frequency: 'Once daily', durationDays: 30,
        startDate: '2025-06-01', doseTimes: ['08:00'],
        isActive: true, purchasedAt: '2025-06-01T11:00:00Z',
        createdBy: 'pro1_supabase_id', notes: 'Blood pressure control'
    },
    {
        id: 'pm4', pharmacyPatientId: 'pp3', medicationName: 'Salbutamol Inhaler',
        dose: '100mcg', frequency: 'As needed', durationDays: 30,
        startDate: '2025-05-20', doseTimes: [],
        isActive: true, purchasedAt: '2025-05-20T14:00:00Z',
        createdBy: 'pro1_supabase_id', notes: 'Rescue inhaler for acute asthma symptoms'
    },
    {
        id: 'pm5', pharmacyPatientId: 'pp4', medicationName: 'Artemether-Lumefantrine',
        dose: '80/480mg', frequency: 'Twice daily', durationDays: 3,
        startDate: '2025-06-04', doseTimes: [getNearTime(2), getNearTime(60)],
        isActive: true, purchasedAt: '2025-06-04T12:30:00Z',
        createdBy: 'pro1_supabase_id', notes: 'Antimalarial treatment. Take with food.'
    },
    {
        id: 'pm6', pharmacyPatientId: 'pp5', medicationName: 'Metformin',
        dose: '1000mg', frequency: 'Twice daily', durationDays: 90,
        startDate: '2025-05-01', doseTimes: ['07:00', '19:00'],
        isActive: true, purchasedAt: '2025-05-01T08:00:00Z',
        createdBy: 'pro1_supabase_id', notes: 'Diabetes management. Extended release.'
    },
    {
        id: 'pm7', pharmacyPatientId: 'pp5', medicationName: 'Lisinopril',
        dose: '10mg', frequency: 'Once daily', durationDays: 30,
        startDate: '2025-06-01', doseTimes: ['08:00'],
        isActive: true, purchasedAt: '2025-06-01T08:00:00Z',
        createdBy: 'pro1_supabase_id', notes: 'ACE inhibitor for hypertension'
    },
    {
        id: 'pm8', pharmacyPatientId: 'pp1', medicationName: 'Paracetamol',
        dose: '500mg', frequency: 'Three times daily', durationDays: 5,
        startDate: '2025-06-04', doseTimes: ['08:00', '14:00', '20:00'],
        isActive: true, purchasedAt: '2025-06-04T10:00:00Z',
        createdBy: 'pro1_supabase_id', notes: 'For fever and pain relief'
    },
];