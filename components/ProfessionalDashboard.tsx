
import React, { useState, useEffect } from 'react';
import { UsersIcon, CalendarIcon, AlertIcon, CheckCircleIcon, ArrowRightIcon, PillIcon, XIcon, PenIcon } from './Icons'; // Added PenIcon
import { APPOINTMENTS_DATA, MOCK_PATIENTS } from '../constants';
import { Page, PrescriptionRefillRequest, UserProfile } from '../types';
import Toast from './Toast';
import { updateRefillRequest } from '../services/geminiService'; // Import new service
import { supabase } from '../services/supabaseClient';

interface ProfessionalDashboardProps {
    setActivePage: (page: Page) => void;
    userProfile: UserProfile;
    onAddNotification: (msg: string) => void;
}

const INITIAL_REFILLS: PrescriptionRefillRequest[] = [
    { id: 1, patientName: 'John Smith', drugName: 'Metformin', dosage: '500mg • Twice daily', timeAgo: '2h ago', patientId: 'patient2_supabase_id', professionalId: 'pro1_supabase_id' },
    { id: 2, patientName: 'Emily Davis', drugName: 'Lisinopril', dosage: '10mg • Once daily', timeAgo: '5h ago', patientId: 'patient5_supabase_id', professionalId: 'pro1_supabase_id' },
    { id: 3, patientName: 'Robert Brown', drugName: 'Artovastatin', dosage: '20mg • Once daily', timeAgo: '8h ago', patientId: 'patient4_supabase_id', professionalId: 'pro1_supabase_id' },
];

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ setActivePage, userProfile, onAddNotification }) => {
    const [refills, setRefills] = useState<PrescriptionRefillRequest[]>(INITIAL_REFILLS);
    const [toast, setToast] = useState<{ message: string; type: 'success' } | null>(null);
    const [isApptModalOpen, setIsApptModalOpen] = useState(false);
    const [editingRefill, setEditingRefill] = useState<PrescriptionRefillRequest | null>(null);

    // In a real app, fetch refills from Supabase for the current professional
    useEffect(() => {
        // Mock fetching of refill requests, assuming a Supabase ID for the professional
        // const fetchRefills = async () => {
        //     if (!userProfile.supabaseId) return;
        //     const { data, error } = await supabase.from('requested_drug_refills').select('*').eq('professional_id', userProfile.supabaseId);
        //     if (error) { console.error('Error fetching refills:', error); return; }
        //     setRefills(data.map(r => ({
        //         id: r.id,
        //         patientName: MOCK_PATIENTS.find(p => p.supabaseId === r.patient_id)?.name || 'Unknown Patient',
        //         drugName: r.drug_name,
        //         dosage: r.dosage,
        //         timeAgo: 'from DB', // Calculate dynamically
        //         patientId: r.patient_id,
        //         professionalId: r.professional_id,
        //     })));
        // };
        // fetchRefills();
    }, [userProfile.supabaseId]);


    const stats = [
        { label: 'Total Patients', value: '1,248', icon: UsersIcon, color: 'bg-blue-500', trend: '+12 this month' },
        { label: 'Appointments Today', value: '8', icon: CalendarIcon, color: 'bg-purple-500', trend: '2 remaining' },
        { label: 'Critical Alerts', value: '3', icon: AlertIcon, color: 'bg-red-500', trend: 'Requires attention' },
        { label: 'Tasks Completed', value: '15', icon: CheckCircleIcon, color: 'bg-green-500', trend: '95% efficiency' },
    ];

    const upcomingAppointments = APPOINTMENTS_DATA.slice(0, 3).map(app => ({
        ...app,
        avatar: `https://i.pravatar.cc/150?u=${app.patientName}`
    }));

    const handleApprove = async (request: PrescriptionRefillRequest) => {
        // Use edited values if available, otherwise original values
        const finalDrugName = request.editedDrugName || request.drugName;
        const finalDosage = request.editedDosage || request.dosage;

        const success = await updateRefillRequest(request.id, { drugName: finalDrugName, dosage: finalDosage, status: 'approved' });
        if (success) {
            setToast({ message: `Confirmed refill for ${finalDrugName}. Patient ${request.patientName} notified.`, type: 'success' });
            
            const professionalName = userProfile.name || 'Your Doctor';
            const title = userProfile.professionalTitle || 'Dr.';
            onAddNotification(`${title} ${professionalName} confirmed your prescription refill for ${finalDrugName}.`);
            
            setRefills(prev => prev.filter(r => r.id !== request.id));
        } else {
            setToast({ message: `Failed to approve refill for ${finalDrugName}.`, type: 'success' }); // Use success for now, ideally an error type
        }
    };

    const handleDecline = async (request: PrescriptionRefillRequest) => {
        const finalDrugName = request.editedDrugName || request.drugName;

        const success = await updateRefillRequest(request.id, { status: 'declined' });
        if (success) {
            setRefills(prev => prev.filter(r => r.id !== request.id));
            setToast({ message: `Refill request for ${finalDrugName} declined.`, type: 'success' });
        } else {
            setToast({ message: `Failed to decline refill for ${finalDrugName}.`, type: 'success' }); // Use success for now, ideally an error type
        }
    };

    const handleEditRefillSave = (updatedRequest: PrescriptionRefillRequest) => {
        setRefills(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r));
        setEditingRefill(null);
        setToast({message: "Refill request updated successfully!", type: 'success'});
    };

    return (
        <div className="space-y-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {isApptModalOpen && (
                <NewAppointmentModal 
                    onClose={() => setIsApptModalOpen(false)} 
                    onSave={() => {
                        setToast({ message: "Patient appointment created successfully.", type: 'success' });
                        setIsApptModalOpen(false);
                    }} 
                />
            )}

            {editingRefill && (
                <EditRefillModal
                    refillRequest={editingRefill}
                    onClose={() => setEditingRefill(null)}
                    onSave={handleEditRefillSave}
                />
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Dashboard</h2>
                    <p className="text-boticare-gray-dark dark:text-gray-400">Overview of your practice activities and patient requests.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                        onClick={() => setActivePage(Page.ProfessionalSchedule)}
                        className="flex-1 sm:flex-none bg-white border border-gray-200 text-gray-700 font-bold px-5 py-3 rounded-2xl hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 shadow-sm"
                    >
                        View Schedule
                    </button>
                    <button 
                        onClick={() => setIsApptModalOpen(true)}
                        className="flex-1 sm:flex-none bg-blue-600 text-white font-bold px-5 py-3 rounded-2xl hover:bg-opacity-90 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700 shadow-lg"
                    >
                        + New Appointment
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-3xl border border-boticare-gray-medium shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 dark:bg-opacity-20`}>
                                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')} dark:text-white`} />
                            </div>
                            <span className="text-[10px] font-black uppercase bg-gray-100 px-2 py-1 rounded-lg dark:bg-gray-700 dark:text-gray-400">{stat.trend}</span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{stat.value}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Upcoming Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black">Today's Schedule</h3>
                        <button onClick={() => setActivePage(Page.ProfessionalSchedule)} className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest hover:underline underline-offset-4">Full Calendar</button>
                    </div>
                    <div className="space-y-4">
                        {upcomingAppointments.map((app) => (
                            <div key={app.id} className="bg-white p-4 rounded-3xl border border-boticare-gray-medium flex items-center justify-between hover:border-blue-300 transition-all dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700/50">
                                <div className="flex items-center space-x-4">
                                    <img src={app.avatar} className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-600 shadow-sm" alt={app.patientName} />
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{app.patientName}</h4>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <span className="text-blue-600 dark:text-blue-400">{app.type}</span>
                                            <span className="opacity-30">•</span>
                                            <span>{app.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setActivePage(Page.ProfessionalSchedule)} className="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-blue-600 hover:text-white text-gray-400 rounded-2xl transition-all">
                                        <ArrowRightIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Refill Requests */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black">Refill Queue</h3>
                    </div>
                    <div className="bg-white p-3 rounded-3xl border border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700 h-fit shadow-sm">
                        {refills.length > 0 ? (
                            <div className="space-y-3">
                                {refills.map((req) => (
                                    <div key={req.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600/50 rounded-2xl relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">Prescription</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{req.timeAgo}</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-800 dark:text-white mb-0.5">{req.patientName}</p>
                                        <p className="text-xs text-gray-500 font-medium mb-4 italic">Requested: {req.drugName} ({req.dosage})</p>
                                        <button 
                                            onClick={() => setEditingRefill(req)} 
                                            className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-blue-500 transition-colors"
                                            title="Edit Refill Request"
                                        >
                                            <PenIcon className="w-4 h-4" />
                                        </button>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleApprove(req)}
                                                className="flex-1 text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-100 dark:shadow-none"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleDecline(req)}
                                                className="flex-1 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-gray-600 text-gray-500 dark:text-gray-300 py-2.5 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 dark:border-gray-500"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                                <CheckCircleIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-xs font-black uppercase tracking-widest opacity-50">Refill queue cleared</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal for Professional to book for a patient
const NewAppointmentModal: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 border border-white/10">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black">Manual Scheduling</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><XIcon className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Patient Select</label>
                        <select className="w-full bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500">
                            <option>Jane Doe</option>
                            <option>John Smith</option>
                            <option>Emily Davis</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Date</label>
                            <input type="date" className="w-full bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Start Time</label>
                            <input type="time" className="w-full bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Clinical Notes</label>
                        <textarea rows={3} className="w-full bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Reason for booking..." />
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-colors">Cancel</button>
                    <button onClick={onSave} className="flex-1 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl transition-all">Create Session</button>
                </div>
            </div>
        </div>
    );
};

interface EditRefillModalProps {
    refillRequest: PrescriptionRefillRequest;
    onClose: () => void;
    onSave: (updatedRequest: PrescriptionRefillRequest) => void;
}

const EditRefillModal: React.FC<EditRefillModalProps> = ({ refillRequest, onClose, onSave }) => {
    const [drugName, setDrugName] = useState(refillRequest.drugName);
    const [dosage, setDosage] = useState(refillRequest.dosage);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        const success = await updateRefillRequest(refillRequest.id, { drugName, dosage });
        if (success) {
            onSave({ ...refillRequest, drugName, dosage, editedDrugName: drugName, editedDosage: dosage });
        } else {
            // Handle error, maybe show a toast
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 border border-white/10">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black">Edit Refill Request</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><XIcon className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Patient: <span className="font-bold text-gray-900 dark:text-white">{refillRequest.patientName}</span>
                    </p>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Drug Name</label>
                        <input
                            type="text"
                            value={drugName}
                            onChange={(e) => setDrugName(e.target.value)}
                            className="w-full bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Dosage</label>
                        <input
                            type="text"
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                            className="w-full bg-boticare-gray dark:bg-gray-700 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-colors">Cancel</button>
                    <button 
                        onClick={handleSave} 
                        disabled={isLoading}
                        className="flex-1 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalDashboard;
