import React, { useState } from 'react';
import { PharmacyPatient, PatientMedication, Page } from '../types';
import { MOCK_PHARMACY_PATIENTS, MOCK_PATIENT_MEDICATIONS } from '../constants';
import { SearchIcon, FilterIcon, PlusIcon, PillIcon, UsersIcon, ClockIcon, HeartIcon } from './Icons';
import Toast from './Toast';
import AddPharmacyPatientModal from './AddPharmacyPatientModal';
import PatientVitalsModal from './PatientVitalsModal';
import PharmacyMedicationModal from './PharmacyMedicationModal';

interface PharmacyPatientDatabaseProps {
    setActivePage: (p: Page) => void;
}

const PharmacyPatientDatabase: React.FC<PharmacyPatientDatabaseProps> = ({ setActivePage }) => {
    const [patients, setPatients] = useState<PharmacyPatient[]>(MOCK_PHARMACY_PATIENTS);
    const [medications, setMedications] = useState<PatientMedication[]>(MOCK_PATIENT_MEDICATIONS);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPatientVitals, setSelectedPatientVitals] = useState<PharmacyPatient | null>(null);
    const [selectedPatientMeds, setSelectedPatientMeds] = useState<PharmacyPatient | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [lookupCode, setLookupCode] = useState('');
    const [isLookupOpen, setIsLookupOpen] = useState(false);

    const handleSavePatient = (patient: PharmacyPatient, meds: PatientMedication[]) => {
        setPatients(prev => [patient, ...prev]);
        setMedications(prev => [...meds, ...prev]);
        setIsAddModalOpen(false);
        setToast(`Patient "${patient.name}" registered successfully! Code: ${patient.uniqueCode}`);
    };

    const handleUpdateVitals = (updated: PharmacyPatient) => {
        setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
        setSelectedPatientVitals(updated);
        setToast(`Vitals updated for ${updated.name}`);
    };

    const handleAddMedication = (med: PatientMedication) => {
        setMedications(prev => [med, ...prev]);
        setToast(`${med.medicationName} added for ${selectedPatientMeds?.name}`);
    };

    const handleToggleMedication = (medId: string) => {
        setMedications(prev => prev.map(m => m.id === medId ? { ...m, isActive: !m.isActive } : m));
    };

    const handleLookup = () => {
        const code = lookupCode.trim().toUpperCase();
        if (!code) return;
        const found = patients.find(p => p.uniqueCode === code);
        if (found) {
            setSelectedPatientVitals(found);
            setIsLookupOpen(false);
            setLookupCode('');
        } else {
            setToast(`No patient found with code "${code}"`);
        }
    };

    const getPatientMeds = (patientId: string) => medications.filter(m => m.pharmacyPatientId === patientId);

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
            {isAddModalOpen && <AddPharmacyPatientModal onClose={() => setIsAddModalOpen(false)} onSave={handleSavePatient} />}
            {selectedPatientVitals && <PatientVitalsModal patient={selectedPatientVitals} onClose={() => setSelectedPatientVitals(null)} onUpdate={handleUpdateVitals} />}
            {selectedPatientMeds && <PharmacyMedicationModal patient={selectedPatientMeds} medications={getPatientMeds(selectedPatientMeds.id)} onClose={() => setSelectedPatientMeds(null)} onAddMedication={handleAddMedication} onToggleMedication={handleToggleMedication} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black">Pharmacy Patient Database</h2>
                    <p className="text-boticare-gray-dark dark:text-gray-400">Manage patient records, vitals, medications & dosage reminders.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsLookupOpen(!isLookupOpen)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold px-4 py-3 rounded-xl flex items-center space-x-2 hover:border-blue-400 hover:text-blue-600 transition-all text-sm">
                        <SearchIcon className="w-4 h-4" />
                        <span>Lookup Code</span>
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white font-bold px-5 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none text-sm active:scale-95">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Patient</span>
                    </button>
                </div>
            </div>

            {/* Lookup bar */}
            {isLookupOpen && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-3 animate-fade-in shadow-sm">
                    <input
                        type="text"
                        value={lookupCode}
                        onChange={e => setLookupCode(e.target.value)}
                        placeholder="Enter patient unique code (e.g. BOT-XXXX-XXXX)"
                        className="flex-1 bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-4 py-2.5 font-mono font-bold focus:ring-2 focus:ring-blue-500 dark:text-white uppercase tracking-wider"
                        onKeyDown={e => e.key === 'Enter' && handleLookup()}
                    />
                    <button onClick={handleLookup} className="bg-blue-600 text-white font-black text-xs uppercase px-5 rounded-xl hover:bg-blue-700 transition-all active:scale-95">Lookup</button>
                    <button onClick={() => { setIsLookupOpen(false); setLookupCode(''); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2">✕</button>
                </div>
            )}


        </div>
    );
};

export default PharmacyPatientDatabase;
