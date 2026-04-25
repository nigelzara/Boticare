import React, { useState, useMemo } from 'react';
import { PharmacyPatient, PatientMedication } from '../types';
import { XIcon, PlusIcon, CheckCircleIcon } from './Icons';

interface AddPharmacyPatientModalProps {
    onClose: () => void;
    onSave: (patient: PharmacyPatient, medications: PatientMedication[]) => void;
}

const generateUniqueCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `BOT-${seg()}-${seg()}`;
};

type Step = 1 | 2 | 3;
const FREQ_OPTIONS = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed'];

const getDefaultTimes = (f: string): string[] => {
    if (f === 'Once daily') return ['08:00'];
    if (f === 'Twice daily') return ['08:00', '20:00'];
    if (f === 'Three times daily') return ['08:00', '14:00', '20:00'];
    if (f === 'Four times daily') return ['06:00', '12:00', '18:00', '22:00'];
    return [];
};

interface MedForm { medicationName: string; dose: string; frequency: string; durationDays: number; startDate: string; doseTimes: string[]; notes: string; }
const emptyMed = (): MedForm => ({ medicationName: '', dose: '', frequency: 'Twice daily', durationDays: 7, startDate: new Date().toISOString().split('T')[0], doseTimes: ['08:00', '20:00'], notes: '' });

const InputField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
    <div>
        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">{label}{required && ' *'}</label>
        {children}
    </div>
);

const inputCls = "w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 font-bold";
const smallInputCls = "w-full bg-white dark:bg-gray-700 border-none rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 font-bold text-sm";

const AddPharmacyPatientModal: React.FC<AddPharmacyPatientModalProps> = ({ onClose, onSave }) => {
    const [step, setStep] = useState<Step>(1);
    const [uniqueCode] = useState(generateUniqueCode);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('Female');
    const [dob, setDob] = useState('');
    const [bpS, setBpS] = useState('');
    const [bpD, setBpD] = useState('');
    const [glucose, setGlucose] = useState('');
    const [temp, setTemp] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [meds, setMeds] = useState<MedForm[]>([emptyMed()]);

    const bmi = useMemo(() => { const h = parseFloat(height); const w = parseFloat(weight); return (h > 0 && w > 0) ? parseFloat((w / ((h / 100) ** 2)).toFixed(1)) : null; }, [height, weight]);
    const bmiCat = bmi === null ? { l: '—', c: 'text-gray-400' } : bmi < 18.5 ? { l: 'Underweight', c: 'text-yellow-600' } : bmi < 25 ? { l: 'Normal', c: 'text-green-600' } : bmi < 30 ? { l: 'Overweight', c: 'text-orange-500' } : { l: 'Obese', c: 'text-red-600' };

    const updateMed = (i: number, field: string, val: any) => { const u = [...meds]; (u[i] as any)[field] = val; setMeds(u); };
    const changeMedFreq = (i: number, f: string) => { const u = [...meds]; u[i].frequency = f; u[i].doseTimes = getDefaultTimes(f); setMeds(u); };
    const changeMedTime = (mi: number, ti: number, v: string) => { const u = [...meds]; u[mi].doseTimes[ti] = v; setMeds(u); };

    const handleSubmit = () => {
        const patient: PharmacyPatient = {
            id: `pp_${Date.now()}`, uniqueCode, createdBy: '', name: name.trim(), email: email.trim(), phone: phone.trim(),
            gender, dateOfBirth: dob,
            bloodPressureSystolic: bpS ? parseInt(bpS) : null, bloodPressureDiastolic: bpD ? parseInt(bpD) : null,
            bloodGlucose: glucose ? parseFloat(glucose) : null, temperature: temp ? parseFloat(temp) : null,
            heightCm: height ? parseFloat(height) : null, weightKg: weight ? parseFloat(weight) : null,
            bmi, notes, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        const patientMeds: PatientMedication[] = meds.filter(m => m.medicationName.trim()).map(m => ({
            id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, pharmacyPatientId: patient.id,
            medicationName: m.medicationName, dose: m.dose, frequency: m.frequency, durationDays: m.durationDays,
            startDate: m.startDate, doseTimes: m.doseTimes, isActive: true, purchasedAt: new Date().toISOString(), createdBy: '', notes: m.notes,
        }));
        onSave(patient, patientMeds);
    };

    const steps = ['Demographics', 'Vitals', 'Medication'];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl border border-white/20 max-h-[90vh] flex flex-col">
                <div className="p-6 pb-0 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-2xl font-black">Register New Patient</h3>
                            <p className="text-xs text-gray-400 mt-1 font-mono">Code: <span className="text-blue-600 dark:text-blue-400 font-bold">{uniqueCode}</span></p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><XIcon className="w-6 h-6 text-gray-400" /></button>
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                        {steps.map((label, i) => (
                            <div key={label} className="flex items-center flex-1">
                                <div className={`flex items-center gap-2 ${i + 1 <= step ? '' : 'opacity-40'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'}`}>
                                        {i + 1 < step ? <CheckCircleIcon className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">{label}</span>
                                </div>
                                {i < 2 && <div className={`h-px flex-1 mx-2 ${i + 1 < step ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-600'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 pt-2 overflow-y-auto flex-1">
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <InputField label="Full Name" required><input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Enter patient full name" /></InputField>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Email"><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="patient@email.com" /></InputField>
                                <InputField label="Phone Number" required><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="+234 xxx xxx xxxx" /></InputField>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Gender"><select value={gender} onChange={e => setGender(e.target.value)} className={inputCls}><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></InputField>
                                <InputField label="Date of Birth"><input type="date" value={dob} onChange={e => setDob(e.target.value)} className={inputCls} /></InputField>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="BP Systolic (mmHg)"><input type="number" value={bpS} onChange={e => setBpS(e.target.value)} className={inputCls} placeholder="120" /></InputField>
                                <InputField label="BP Diastolic (mmHg)"><input type="number" value={bpD} onChange={e => setBpD(e.target.value)} className={inputCls} placeholder="80" /></InputField>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Blood Glucose (mg/dL)"><input type="number" value={glucose} onChange={e => setGlucose(e.target.value)} className={inputCls} placeholder="95" /></InputField>
                                <InputField label="Temperature (°C)"><input type="number" step="0.1" value={temp} onChange={e => setTemp(e.target.value)} className={inputCls} placeholder="36.6" /></InputField>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Height (cm)"><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputCls} placeholder="170" /></InputField>
                                <InputField label="Weight (kg)"><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputCls} placeholder="70" /></InputField>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                                <div className="flex items-center justify-between">
                                    <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Calculated BMI</p><p className="text-3xl font-black mt-1">{bmi ?? '—'}</p></div>
                                    <div className="text-right">
                                        <span className={`text-sm font-bold ${bmiCat.c}`}>{bmiCat.l}</span>
                                        {bmi !== null && <div className="w-32 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2 overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${bmi < 18.5 ? 'bg-yellow-500' : bmi < 25 ? 'bg-green-500' : bmi < 30 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (bmi / 40) * 100)}%` }} /></div>}
                                    </div>
                                </div>
                            </div>
                            <InputField label="Clinical Notes"><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={inputCls + ' resize-none'} placeholder="Any allergies, existing conditions, etc." /></InputField>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="space-y-4 animate-fade-in">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Add medications purchased. Dosage reminders will be set based on dose times.</p>
                            {meds.map((med, mi) => (
                                <div key={mi} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-600 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-lg">Medication #{mi + 1}</span>
                                        {meds.length > 1 && <button onClick={() => setMeds(meds.filter((_, j) => j !== mi))} className="text-red-400 hover:text-red-600 text-[10px] font-bold uppercase">Remove</button>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Medication Name</label><input type="text" value={med.medicationName} onChange={e => updateMed(mi, 'medicationName', e.target.value)} className={smallInputCls} placeholder="e.g. Amoxicillin" /></div>
                                        <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Dose</label><input type="text" value={med.dose} onChange={e => updateMed(mi, 'dose', e.target.value)} className={smallInputCls} placeholder="e.g. 500mg" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Frequency</label><select value={med.frequency} onChange={e => changeMedFreq(mi, e.target.value)} className={smallInputCls}>{FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}</select></div>
                                        <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Duration (days)</label><input type="number" value={med.durationDays} onChange={e => updateMed(mi, 'durationDays', parseInt(e.target.value) || 0)} className={smallInputCls} /></div>
                                        <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Start Date</label><input type="date" value={med.startDate} onChange={e => updateMed(mi, 'startDate', e.target.value)} className={smallInputCls} /></div>
                                    </div>
                                    {med.frequency !== 'As needed' && med.doseTimes.length > 0 && (
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-2">Dose Times</label>
                                            <div className="flex flex-wrap gap-2">{med.doseTimes.map((t, ti) => (
                                                <div key={ti} className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-xl px-2 py-1 border border-gray-200 dark:border-gray-600">
                                                    <span className="text-[9px] font-bold text-gray-400">#{ti + 1}</span>
                                                    <input type="time" value={t} onChange={e => changeMedTime(mi, ti, e.target.value)} className="bg-transparent border-none text-sm font-bold focus:ring-0 w-24 p-0" />
                                                </div>
                                            ))}</div>
                                        </div>
                                    )}
                                    <div><label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Notes</label><input type="text" value={med.notes} onChange={e => updateMed(mi, 'notes', e.target.value)} className={smallInputCls} placeholder="e.g. Take with food" /></div>
                                </div>
                            ))}
                            <button onClick={() => setMeds([...meds, emptyMed()])} className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all text-sm font-bold flex items-center justify-center gap-2"><PlusIcon className="w-4 h-4" />Add Another Medication</button>
                        </div>
                    )}
                </div>

                <div className="p-6 pt-0 flex-shrink-0">
                    <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button onClick={() => step > 1 ? setStep((step - 1) as Step) : onClose()} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{step > 1 ? 'Back' : 'Cancel'}</button>
                        {step < 3 ? (
                            <button onClick={() => setStep((step + 1) as Step)} disabled={step === 1 && (!name.trim() || !phone.trim())} className="flex-1 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed">Continue</button>
                        ) : (
                            <button onClick={handleSubmit} className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-200 dark:shadow-none transition-all">Register Patient</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPharmacyPatientModal;
