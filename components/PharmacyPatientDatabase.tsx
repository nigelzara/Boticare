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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPatientVitals, setSelectedPatientVitals] = useState<PharmacyPatient | null>(null);
    const [selectedPatientMeds, setSelectedPatientMeds] = useState<PharmacyPatient | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [lookupCode, setLookupCode] = useState('');
    const [isLookupOpen, setIsLookupOpen] = useState(false);

    const filteredPatients = patients.filter(p => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term) || p.phone.includes(term) || p.uniqueCode.toLowerCase().includes(term);
        const matchesGender = filterGender === 'All' || p.gender === filterGender;
        return matchesSearch && matchesGender;
    });

    const getPatientMeds = (patientId: string) => medications.filter(m => m.pharmacyPatientId === patientId);
    const getActiveMedCount = (patientId: string) => getPatientMeds(patientId).filter(m => m.isActive).length;

    const totalPatients = patients.length;
    const totalActiveMeds = medications.filter(m => m.isActive).length;
    const todayReminders = medications.filter(m => m.isActive && m.doseTimes.length > 0 && m.frequency !== 'As needed').reduce((sum, m) => sum + m.doseTimes.length, 0);

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

    const getBpBadge = (s: number | null, d: number | null) => {
        if (s === null) return { label: '—', cls: 'bg-gray-100 text-gray-400 dark:bg-gray-700' };
        if (s > 140 || (d && d > 90)) return { label: `${s}/${d}`, cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
        if (s > 120) return { label: `${s}/${d}`, cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
        return { label: `${s}/${d}`, cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    };

    const getGlucoseBadge = (v: number | null) => {
        if (v === null) return { label: '—', cls: 'bg-gray-100 text-gray-400 dark:bg-gray-700' };
        if (v > 125) return { label: `${v}`, cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
        if (v > 100) return { label: `${v}`, cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
        return { label: `${v}`, cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    };

    const stats = [
        { label: 'Total Patients', value: totalPatients.toString(), icon: UsersIcon, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200' },
        { label: 'Active Meds', value: totalActiveMeds.toString(), icon: PillIcon, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
        { label: "Today's Doses", value: todayReminders.toString(), icon: ClockIcon, color: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-200' },
        { label: 'Vitals Alerts', value: patients.filter(p => (p.bloodPressureSystolic && p.bloodPressureSystolic > 140) || (p.bloodGlucose && p.bloodGlucose > 125)).length.toString(), icon: HeartIcon, color: 'from-red-500 to-rose-600', shadow: 'shadow-red-200' },
    ];

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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-xl ${stat.shadow} dark:shadow-none transition-transform hover:-translate-y-1 duration-300`}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">{stat.label}</p>
                            <stat.icon className="w-5 h-5 opacity-80" />
                        </div>
                        <p className="text-3xl font-black">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 flex flex-col md:flex-row gap-4 shadow-sm">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400" /></div>
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, or code..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white shadow-inner"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <FilterIcon className="w-5 h-5 text-gray-400" />
                    <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 dark:text-white">
                        <option value="All">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                    </select>
                </div>
            </div>

            {/* Patient Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Patient</th>
                                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Unique Code</th>
                                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">BP</th>
                                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Glucose</th>
                                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">BMI</th>
                                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Meds</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50 dark:bg-gray-800 dark:divide-gray-700">
                            {filteredPatients.map(patient => {
                                const bpBadge = getBpBadge(patient.bloodPressureSystolic, patient.bloodPressureDiastolic);
                                const glucBadge = getGlucoseBadge(patient.bloodGlucose);
                                const activeMedCnt = getActiveMedCount(patient.id);
                                const age = patient.dateOfBirth ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / 31557600000) : null;

                                return (
                                    <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm" src={`https://i.pravatar.cc/150?u=${patient.id}`} alt="" />
                                                <div className="ml-3">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{patient.name}</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{patient.gender}{age ? ` • ${age} yrs` : ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg">{patient.uniqueCode}</span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${bpBadge.cls}`}>{bpBadge.label}</span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${glucBadge.cls}`}>{glucBadge.label} {patient.bloodGlucose ? 'mg/dL' : ''}</span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-xs font-bold">{patient.bmi ?? '—'}</span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${activeMedCnt > 0 ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                                                {activeMedCnt} active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setSelectedPatientVitals(patient)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 p-2 rounded-xl transition-all text-[10px] font-bold" title="View Details">
                                                    <HeartIcon className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setSelectedPatientMeds(patient)} className="bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white dark:bg-purple-900/30 dark:text-purple-400 p-2 rounded-xl transition-all text-[10px] font-bold" title="Medications">
                                                    <PillIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredPatients.length === 0 && (
                    <div className="p-12 text-center">
                        <UsersIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-400">No patients found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search or add a new patient.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacyPatientDatabase;
