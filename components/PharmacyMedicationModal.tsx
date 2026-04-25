import React, { useState } from 'react';
import { PharmacyPatient, PatientMedication } from '../types';
import { XIcon, PlusIcon, PillIcon, ClockIcon, CheckCircleIcon } from './Icons';

interface PharmacyMedicationModalProps {
    patient: PharmacyPatient;
    medications: PatientMedication[];
    onClose: () => void;
    onAddMedication: (med: PatientMedication) => void;
    onToggleMedication: (medId: string) => void;
}

const FREQ_OPTIONS = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed'];
const getDefaultTimes = (f: string): string[] => {
    if (f === 'Once daily') return ['08:00'];
    if (f === 'Twice daily') return ['08:00', '20:00'];
    if (f === 'Three times daily') return ['08:00', '14:00', '20:00'];
    if (f === 'Four times daily') return ['06:00', '12:00', '18:00', '22:00'];
    return [];
};

const smallInputCls = "w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 font-bold text-sm";

const PharmacyMedicationModal: React.FC<PharmacyMedicationModalProps> = ({ patient, medications, onClose, onAddMedication, onToggleMedication }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [medName, setMedName] = useState('');
    const [dose, setDose] = useState('');
    const [frequency, setFrequency] = useState('Twice daily');
    const [duration, setDuration] = useState(7);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [doseTimes, setDoseTimes] = useState<string[]>(['08:00', '20:00']);
    const [notes, setNotes] = useState('');

    const handleFreqChange = (f: string) => {
        setFrequency(f);
        setDoseTimes(getDefaultTimes(f));
    };

    const handleAdd = () => {
        if (!medName.trim()) return;
        const newMed: PatientMedication = {
            id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            pharmacyPatientId: patient.id,
            medicationName: medName,
            dose,
            frequency,
            durationDays: duration,
            startDate,
            doseTimes,
            isActive: true,
            purchasedAt: new Date().toISOString(),
            createdBy: '',
            notes,
        };
        onAddMedication(newMed);
        setShowAddForm(false);
        setMedName(''); setDose(''); setFrequency('Twice daily'); setDuration(7); setDoseTimes(['08:00', '20:00']); setNotes('');
    };

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const getDoseStatus = (doseTime: string): 'upcoming' | 'current' | 'past' => {
        const [h, m] = doseTime.split(':').map(Number);
        const doseMin = h * 60 + m;
        const diff = doseMin - currentMinutes;
        if (diff > 30) return 'upcoming';
        if (diff >= -5) return 'current';
        return 'past';
    };

    const activeMeds = medications.filter(m => m.isActive);
    const inactiveMeds = medications.filter(m => !m.isActive);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl border border-white/20 max-h-[90vh] flex flex-col">
                <div className="p-6 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-black">Medications</h3>
                            <p className="text-xs text-gray-400 mt-1">{patient.name} • <span className="font-mono text-blue-600 dark:text-blue-400">{patient.uniqueCode}</span></p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase px-3 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-95">
                                <PlusIcon className="w-3.5 h-3.5" /> Add Med
                            </button>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><XIcon className="w-6 h-6 text-gray-400" /></button>
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-0 overflow-y-auto flex-1 space-y-4">
                    {/* Add Medication Form */}
                    {showAddForm && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 space-y-3 animate-fade-in">
                            <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">New Medication</span>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Medication Name</label><input type="text" value={medName} onChange={e => setMedName(e.target.value)} className={smallInputCls} placeholder="e.g. Amoxicillin" /></div>
                                <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Dose</label><input type="text" value={dose} onChange={e => setDose(e.target.value)} className={smallInputCls} placeholder="e.g. 500mg" /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Frequency</label><select value={frequency} onChange={e => handleFreqChange(e.target.value)} className={smallInputCls}>{FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}</select></div>
                                <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Duration (days)</label><input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 0)} className={smallInputCls} /></div>
                                <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={smallInputCls} /></div>
                            </div>
                            {frequency !== 'As needed' && doseTimes.length > 0 && (
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Dose Times</label>
                                    <div className="flex flex-wrap gap-2">{doseTimes.map((t, i) => (
                                        <input key={i} type="time" value={t} onChange={e => { const u = [...doseTimes]; u[i] = e.target.value; setDoseTimes(u); }} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 w-28" />
                                    ))}</div>
                                </div>
                            )}
                            <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Notes</label><input type="text" value={notes} onChange={e => setNotes(e.target.value)} className={smallInputCls} placeholder="e.g. Take with food" /></div>
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => setShowAddForm(false)} className="flex-1 py-2.5 bg-white dark:bg-gray-700 font-black text-xs uppercase rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 dark:border-gray-600">Cancel</button>
                                <button onClick={handleAdd} disabled={!medName.trim()} className="flex-1 py-2.5 bg-blue-600 text-white font-black text-xs uppercase rounded-xl hover:bg-blue-700 transition-all disabled:opacity-40">Save Medication</button>
                            </div>
                        </div>
                    )}

                    {/* Active Medications */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Active Medications ({activeMeds.length})</h4>
                        {activeMeds.length === 0 ? (
                            <p className="text-center text-xs text-gray-400 py-8">No active medications</p>
                        ) : (
                            <div className="space-y-3">
                                {activeMeds.map(med => {
                                    const startD = new Date(med.startDate);
                                    const endD = new Date(startD); endD.setDate(endD.getDate() + med.durationDays);
                                    const daysLeft = Math.max(0, Math.ceil((endD.getTime() - now.getTime()) / 86400000));
                                    const progress = Math.min(100, ((med.durationDays - daysLeft) / med.durationDays) * 100);

                                    return (
                                        <div key={med.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-700 transition-all">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><PillIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                                                    <div>
                                                        <p className="font-bold text-sm">{med.medicationName}</p>
                                                        <p className="text-[10px] text-gray-500">{med.dose} • {med.frequency}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => onToggleMedication(med.id)} className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg transition-colors">Stop</button>
                                            </div>

                                            {/* Dose timeline */}
                                            {med.doseTimes.length > 0 && (
                                                <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
                                                    {med.doseTimes.map((t, i) => {
                                                        const status = getDoseStatus(t);
                                                        return (
                                                            <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap ${
                                                                status === 'current' ? 'bg-blue-600 text-white animate-pulse' :
                                                                status === 'past' ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 line-through' :
                                                                'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                            }`}>
                                                                <ClockIcon className="w-3 h-3" />
                                                                {t}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Duration progress */}
                                            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                                                <span>{daysLeft} days left</span>
                                                <span>{Math.round(progress)}% complete</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                            </div>

                                            {med.notes && <p className="text-[10px] text-gray-400 italic mt-2">{med.notes}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Inactive Medications */}
                    {inactiveMeds.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Completed / Discontinued ({inactiveMeds.length})</h4>
                            <div className="space-y-2">
                                {inactiveMeds.map(med => (
                                    <div key={med.id} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl opacity-60 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircleIcon className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-500 line-through">{med.medicationName}</p>
                                                <p className="text-[10px] text-gray-400">{med.dose} • {med.frequency}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => onToggleMedication(med.id)} className="text-[9px] font-black uppercase text-green-600 hover:text-green-700 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">Reactivate</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PharmacyMedicationModal;
