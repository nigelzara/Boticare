import React, { useState } from 'react';
import { PharmacyPatient } from '../types';
import { XIcon, HeartIcon, GlucoseIcon } from './Icons';

interface PatientVitalsModalProps {
    patient: PharmacyPatient;
    onClose: () => void;
    onUpdate: (updated: PharmacyPatient) => void;
}

const getVitalStatus = (name: string, value: number | null): { label: string; color: string; bg: string } => {
    if (value === null) return { label: 'No Data', color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700' };
    switch (name) {
        case 'bp_s':
            if (value < 90) return { label: 'Low', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
            if (value <= 120) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
            if (value <= 139) return { label: 'Elevated', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' };
            return { label: 'High', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };
        case 'bp_d':
            if (value < 60) return { label: 'Low', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
            if (value <= 80) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
            if (value <= 89) return { label: 'Elevated', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' };
            return { label: 'High', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };
        case 'glucose':
            if (value < 70) return { label: 'Low', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
            if (value <= 100) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
            if (value <= 125) return { label: 'Pre-diabetic', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' };
            return { label: 'Diabetic', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };
        case 'temp':
            if (value < 36.1) return { label: 'Low', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' };
            if (value <= 37.2) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
            if (value <= 38) return { label: 'Low Fever', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' };
            return { label: 'Fever', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };
        case 'bmi':
            if (value < 18.5) return { label: 'Underweight', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
            if (value < 25) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
            if (value < 30) return { label: 'Overweight', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' };
            return { label: 'Obese', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };
        default: return { label: '—', color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700' };
    }
};

const inputCls = "w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 font-bold";

const PatientVitalsModal: React.FC<PatientVitalsModalProps> = ({ patient, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [bpS, setBpS] = useState(patient.bloodPressureSystolic?.toString() || '');
    const [bpD, setBpD] = useState(patient.bloodPressureDiastolic?.toString() || '');
    const [glucose, setGlucose] = useState(patient.bloodGlucose?.toString() || '');
    const [temp, setTemp] = useState(patient.temperature?.toString() || '');
    const [height, setHeight] = useState(patient.heightCm?.toString() || '');
    const [weight, setWeight] = useState(patient.weightKg?.toString() || '');

    const calcBmi = (): number | null => {
        const h = parseFloat(height); const w = parseFloat(weight);
        return (h > 0 && w > 0) ? parseFloat((w / ((h / 100) ** 2)).toFixed(1)) : null;
    };

    const age = patient.dateOfBirth ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / 31557600000) : null;

    const handleSave = () => {
        const updated: PharmacyPatient = {
            ...patient,
            bloodPressureSystolic: bpS ? parseInt(bpS) : null,
            bloodPressureDiastolic: bpD ? parseInt(bpD) : null,
            bloodGlucose: glucose ? parseFloat(glucose) : null,
            temperature: temp ? parseFloat(temp) : null,
            heightCm: height ? parseFloat(height) : null,
            weightKg: weight ? parseFloat(weight) : null,
            bmi: calcBmi(),
            updatedAt: new Date().toISOString(),
        };
        onUpdate(updated);
        setIsEditing(false);
    };

    const VitalCard: React.FC<{ title: string; value: string; unit: string; statusKey: string; numVal: number | null; icon?: React.ReactNode }> = ({ title, value, unit, statusKey, numVal, icon }) => {
        const status = getVitalStatus(statusKey, numVal);
        return (
            <div className={`p-4 rounded-2xl border border-gray-100 dark:border-gray-700 ${status.bg} transition-all hover:shadow-md`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{title}</span>
                    {icon}
                </div>
                <p className="text-2xl font-black">{value || '—'} <span className="text-xs font-bold text-gray-400">{value ? unit : ''}</span></p>
                <span className={`text-[10px] font-bold uppercase ${status.color}`}>{status.label}</span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl border border-white/20 max-h-[90vh] flex flex-col">
                <div className="p-6 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <img src={`https://i.pravatar.cc/150?u=${patient.id}`} className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-gray-600 shadow-lg" alt="" />
                            <div>
                                <h3 className="text-xl font-black">{patient.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-mono font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg">{patient.uniqueCode}</span>
                                    <span className="text-xs text-gray-400">{patient.gender}{age ? ` • ${age} yrs` : ''}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><XIcon className="w-6 h-6 text-gray-400" /></button>
                    </div>
                </div>

                <div className="p-6 pt-0 overflow-y-auto flex-1">
                    {!isEditing ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-black uppercase tracking-widest text-gray-500">Vital Signs</h4>
                                <button onClick={() => setIsEditing(true)} className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors">Update Vitals</button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <VitalCard title="BP (Systolic)" value={patient.bloodPressureSystolic?.toString() || ''} unit="mmHg" statusKey="bp_s" numVal={patient.bloodPressureSystolic} icon={<HeartIcon className="w-4 h-4 text-red-400" />} />
                                <VitalCard title="BP (Diastolic)" value={patient.bloodPressureDiastolic?.toString() || ''} unit="mmHg" statusKey="bp_d" numVal={patient.bloodPressureDiastolic} />
                                <VitalCard title="Blood Glucose" value={patient.bloodGlucose?.toString() || ''} unit="mg/dL" statusKey="glucose" numVal={patient.bloodGlucose} icon={<GlucoseIcon className="w-4 h-4 text-purple-400" />} />
                                <VitalCard title="Temperature" value={patient.temperature?.toString() || ''} unit="°C" statusKey="temp" numVal={patient.temperature} />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl text-center"><p className="text-[10px] font-bold text-gray-400 uppercase">Height</p><p className="text-lg font-black">{patient.heightCm ?? '—'}<span className="text-xs text-gray-400 ml-0.5">cm</span></p></div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl text-center"><p className="text-[10px] font-bold text-gray-400 uppercase">Weight</p><p className="text-lg font-black">{patient.weightKg ?? '—'}<span className="text-xs text-gray-400 ml-0.5">kg</span></p></div>
                                <div className={`p-3 rounded-xl text-center ${getVitalStatus('bmi', patient.bmi).bg}`}><p className="text-[10px] font-bold text-gray-400 uppercase">BMI</p><p className="text-lg font-black">{patient.bmi ?? '—'}</p><p className={`text-[9px] font-bold ${getVitalStatus('bmi', patient.bmi).color}`}>{getVitalStatus('bmi', patient.bmi).label}</p></div>
                            </div>
                            {patient.notes && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl"><p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Clinical Notes</p><p className="text-sm text-gray-600 dark:text-gray-300">{patient.notes}</p></div>
                            )}
                            <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                                <p><span className="font-bold">Email:</span> {patient.email || '—'}</p>
                                <p><span className="font-bold">Phone:</span> {patient.phone}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <h4 className="text-sm font-black uppercase tracking-widest text-gray-500">Update Vitals</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">BP Systolic</label><input type="number" value={bpS} onChange={e => setBpS(e.target.value)} className={inputCls} /></div>
                                <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">BP Diastolic</label><input type="number" value={bpD} onChange={e => setBpD(e.target.value)} className={inputCls} /></div>
                                <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Blood Glucose</label><input type="number" value={glucose} onChange={e => setGlucose(e.target.value)} className={inputCls} /></div>
                                <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Temperature</label><input type="number" step="0.1" value={temp} onChange={e => setTemp(e.target.value)} className={inputCls} /></div>
                                <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputCls} /></div>
                                <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputCls} /></div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 font-black text-xs uppercase rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                                <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white font-black text-xs uppercase rounded-xl hover:bg-blue-700 shadow-lg transition-all">Save Changes</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientVitalsModal;
