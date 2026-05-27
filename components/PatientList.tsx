
import React, { useState } from 'react';
import { Page, Patient } from '../types';
import { SearchIcon, FilterIcon, UserIcon, ChatIcon, FileIcon, XIcon, CalendarIcon, PlusIcon } from './Icons';
import Toast from './Toast';

const MOCK_PATIENTS: Patient[] = [];

interface PatientListProps {
    setActivePage: (p: Page) => void;
    onStartChat: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ setActivePage, onStartChat }) => {
    const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const handleSavePatient = (newPatient: Patient) => {
        setPatients(prev => [newPatient, ...prev]);
        setToast(`Patient ${newPatient.name} has been added to your practice.`);
        setIsAddModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
            
            {isAddModalOpen && (
                <AddPatientModal 
                    onClose={() => setIsAddModalOpen(false)} 
                    onSave={handleSavePatient} 
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black">Patient List</h2>
                    <p className="text-boticare-gray-dark dark:text-gray-400">View and manage clinical records for all registered patients.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 text-white font-bold px-5 py-3 rounded-xl flex items-center space-x-2 hover:bg-opacity-90 transition-all dark:bg-blue-600 dark:hover:bg-blue-700 shadow-lg shadow-blue-100 dark:shadow-none"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Patient</span>
                </button>
            </div>


        </div>
    );
};

const AddPatientModal: React.FC<{ onClose: () => void; onSave: (p: Patient) => void }> = ({ onClose, onSave }) => {
    const [form, setForm] = useState<Partial<Patient>>({
        gender: 'Female',
        status: 'Stable',
        lastVisit: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newPatient: Patient = {
            id: Date.now().toString(),
            name: form.name || 'Anonymous Patient',
            age: Number(form.age) || 30,
            gender: form.gender || 'Female',
            condition: form.condition || 'General Health',
            status: (form.status as 'Stable' | 'Critical' | 'Recovering') || 'Stable', // Explicitly cast status
            lastVisit: form.lastVisit || 'Today',
            avatar: `https://i.pravatar.cc/150?u=${form.name}`,
            supabaseId: `pat_${Date.now().toString()}` // FIX: Added mock supabaseId
        };
        onSave(newPatient);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-6 border border-white/20">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black">Register New Patient</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><XIcon className="w-6 h-6 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                            <input 
                                required 
                                type="text" 
                                onChange={e => setForm({...form, name: e.target.value})} 
                                className="w-full bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 font-bold" 
                                placeholder="Enter patient name" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Age</label>
                            <input 
                                required 
                                type="number" 
                                onChange={e => setForm({...form, age: Number(e.target.value)})} 
                                className="w-full bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 font-bold" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Gender</label>
                            <select 
                                onChange={e => setForm({...form, gender: e.target.value})} 
                                className="w-full bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 font-bold"
                            >
                                <option>Female</option>
                                <option>Male</option>
                                <option>Non-binary</option>
                                <option>Prefer not to say</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Medical Condition</label>
                            <input 
                                required 
                                type="text" 
                                onChange={e => setForm({...form, condition: e.target.value})} 
                                className="w-full bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 font-bold" 
                                placeholder="Primary diagnosis" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Current Status</label>
                            <select 
                                onChange={e => setForm({...form, status: e.target.value as any})} 
                                className="w-full bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 font-bold"
                            >
                                <option>Stable</option>
                                <option>Critical</option>
                                <option>Recovering</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Last Visit</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={form.lastVisit} 
                                    onChange={e => setForm({...form, lastVisit: e.target.value})} 
                                    className="w-full bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 font-bold pr-10" 
                                />
                                <CalendarIcon className="w-5 h-5 absolute right-3 top-3 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-colors">Discard</button>
                        <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-none transition-all">Save Patient</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientList;
