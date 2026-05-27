
import React, { useState } from 'react';
import { Page, Patient } from '../types';
import { SearchIcon, FilterIcon, UserIcon, ChatIcon, FileIcon, XIcon, CalendarIcon, PlusIcon } from './Icons';
import Toast from './Toast';

const MOCK_PATIENTS: Patient[] = [
    { id: '1', name: 'Jane Doe', age: 34, gender: 'Female', condition: 'Hypertension', status: 'Stable', lastVisit: 'June 6, 2025', avatar: 'https://i.pravatar.cc/150?u=jane', supabaseId: 'patient1_supabase_id' },
    { id: '2', name: 'John Smith', age: 45, gender: 'Male', condition: 'Type 2 Diabetes', status: 'Critical', lastVisit: 'June 4, 2025', avatar: 'https://i.pravatar.cc/150?u=john', supabaseId: 'patient2_supabase_id' },
    { id: '3', name: 'Alice Johnson', age: 28, gender: 'Female', condition: 'Migraine', status: 'Recovering', lastVisit: 'May 20, 2025', avatar: 'https://i.pravatar.cc/150?u=alice', supabaseId: 'patient3_supabase_id' },
    { id: '4', name: 'Robert Brown', age: 62, gender: 'Male', condition: 'Arthritis', status: 'Stable', lastVisit: 'June 1, 2025', avatar: 'https://i.pravatar.cc/150?u=robert', supabaseId: 'patient4_supabase_id' },
    { id: '5', name: 'Emily Davis', age: 50, gender: 'Female', condition: 'Asthma', status: 'Stable', lastVisit: 'May 15, 2025', avatar: 'https://i.pravatar.cc/150?u=emily', supabaseId: 'patient5_supabase_id' },
];

interface PatientListProps {
    setActivePage: (p: Page) => void;
    onStartChat: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ setActivePage, onStartChat }) => {
    const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || patient.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

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

            <div className="bg-white p-4 rounded-2xl border border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700 flex flex-col md:flex-row gap-4 shadow-sm">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or condition..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-boticare-gray dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-600 dark:text-white shadow-inner"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <FilterIcon className="w-5 h-5 text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-600 dark:text-white"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Stable">Stable</option>
                        <option value="Critical">Critical</option>
                        <option value="Recovering">Recovering</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-boticare-gray-medium overflow-hidden dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Patient Details</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Condition</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Clinical Status</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Last Encounter</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-800 dark:divide-gray-700">
                            {filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm" src={patient.avatar} alt="" />
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{patient.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{patient.age} yrs • {patient.gender}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">{patient.condition}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full 
                                            ${patient.status === 'Stable' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                                              patient.status === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 
                                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-bold">{patient.lastVisit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button 
                                                onClick={() => onStartChat(patient)}
                                                className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 p-2.5 rounded-xl transition-all shadow-sm" 
                                                title="Secure Message"
                                            >
                                                <ChatIcon className="w-5 h-5" />
                                            </button>
                                            <button className="bg-gray-100 text-gray-500 hover:bg-gray-800 hover:text-white dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-white p-2.5 rounded-xl transition-all shadow-sm" title="View Dossier">
                                                <FileIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
