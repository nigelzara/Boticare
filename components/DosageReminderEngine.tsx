import { useEffect, useRef, useCallback } from 'react';
import { PharmacyPatient, PatientMedication, DosageReminder } from '../types';

interface DosageReminderEngineProps {
    patients: PharmacyPatient[];
    medications: PatientMedication[];
    onReminder: (reminder: DosageReminder) => void;
    acknowledgedIds: Set<string>;
}

/**
 * Headless component that checks active medication schedules every 60 seconds
 * and fires reminder callbacks when a dose time is reached (within ±2 min window).
 */
const DosageReminderEngine: React.FC<DosageReminderEngineProps> = ({
    patients,
    medications,
    onReminder,
    acknowledgedIds,
}) => {
    const lastCheckRef = useRef<string>('');

    const checkReminders = useCallback(() => {
        const now = new Date();
        const currentHH = now.getHours().toString().padStart(2, '0');
        const currentMM = now.getMinutes().toString().padStart(2, '0');
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Create a check key to avoid redundant processing within the same minute
        const checkKey = `${currentHH}:${currentMM}`;
        if (checkKey === lastCheckRef.current) return;
        lastCheckRef.current = checkKey;

        const activeMeds = medications.filter(med => {
            if (!med.isActive) return false;
            if (med.frequency === 'As needed') return false;
            if (!med.doseTimes || med.doseTimes.length === 0) return false;

            // Check if medication is still within its duration
            const startDate = new Date(med.startDate);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + med.durationDays);
            return now >= startDate && now <= endDate;
        });

        activeMeds.forEach(med => {
            const patient = patients.find(p => p.id === med.pharmacyPatientId);
            if (!patient) return;

            med.doseTimes.forEach(doseTime => {
                const [doseHH, doseMM] = doseTime.split(':').map(Number);
                const doseMinutes = doseHH * 60 + doseMM;
                const diff = currentMinutes - doseMinutes;

                // Fire if within ±2 minute window
                if (Math.abs(diff) <= 2) {
                    const reminderId = `${med.id}-${doseTime}-${now.toDateString()}`;
                    
                    if (!acknowledgedIds.has(reminderId)) {
                        const reminder: DosageReminder = {
                            id: reminderId,
                            patientName: patient.name,
                            medicationName: med.medicationName,
                            dose: med.dose,
                            scheduledTime: doseTime,
                            isOverdue: diff > 0,
                            isTaken: false,
                            pharmacyPatientId: patient.id,
                            medicationId: med.id,
                        };
                        onReminder(reminder);
                    }
                }
                // Also check for overdue doses (5-30 min past)
                else if (diff > 2 && diff <= 30) {
                    const reminderId = `${med.id}-${doseTime}-${now.toDateString()}-overdue`;
                    
                    if (!acknowledgedIds.has(reminderId) && !acknowledgedIds.has(`${med.id}-${doseTime}-${now.toDateString()}`)) {
                        const reminder: DosageReminder = {
                            id: reminderId,
                            patientName: patient.name,
                            medicationName: med.medicationName,
                            dose: med.dose,
                            scheduledTime: doseTime,
                            isOverdue: true,
                            isTaken: false,
                            pharmacyPatientId: patient.id,
                            medicationId: med.id,
                        };
                        onReminder(reminder);
                    }
                }
            });
        });
    }, [patients, medications, onReminder, acknowledgedIds]);

    useEffect(() => {
        // Check immediately on mount
        checkReminders();

        // Then check every 30 seconds
        const interval = setInterval(checkReminders, 30000);
        return () => clearInterval(interval);
    }, [checkReminders]);

    // This is a headless component — no visual output
    return null;
};

export default DosageReminderEngine;
