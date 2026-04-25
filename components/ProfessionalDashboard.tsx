
import React, { useState } from 'react';
import { UsersIcon, CalendarIcon, AlertIcon, CheckCircleIcon, FileIcon } from './Icons';
import { APPOINTMENTS_DATA, MOCK_PATIENTS } from '../constants';
import { Page, PrescriptionRefillRequest, UserProfile } from '../types';
import Toast from './Toast';
import DateRangeModal from './DateRangeModal';
import HealthReportModal from './HealthReportModal';
import RefillSchedulingModal from './RefillSchedulingModal';
import { updateRefillRequest, generateHealthReport } from '../services/geminiService';

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
    
    // Health Report State
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [reportDateRange, setReportDateRange] = useState<{start: string, end: string} | null>(null);
    const [selectedReportPatient, setSelectedReportPatient] = useState(MOCK_PATIENTS[0]);

    // Refill Scheduling State
    const [schedulingRefill, setSchedulingRefill] = useState<PrescriptionRefillRequest | null>(null);

    const stats = [
        { label: 'Patients', value: '1,248', icon: UsersIcon, color: 'bg-blue-500', trend: '+12' },
        { label: 'Today', value: '8', icon: CalendarIcon, color: 'bg-purple-500', trend: '2 left' },
        { label: 'Alerts', value: '3', icon: AlertIcon, color: 'bg-red-500', trend: 'Critical' },
        { label: 'Done', value: '15', icon: CheckCircleIcon, color: 'bg-green-500', trend: '95%' },
    ];

    const handleApproveClick = (request: PrescriptionRefillRequest) => {
        setSchedulingRefill(request);
    };

    const handleConfirmApproval = async (date: string, time: string) => {
        if (!schedulingRefill) return;

        // 1. Update Database Status with scheduling info
        const success = await updateRefillRequest(schedulingRefill.id, { 
            status: 'approved',
            scheduledTime: `${date} at ${time}`
        });
        
        if (success) {
            // 2. Remove from Local List
            setRefills(prev => prev.filter(r => r.id !== schedulingRefill.id));
            
            // 3. Show confirmation Toast to Professional
            setToast({ message: `Approved ${schedulingRefill.drugName} for ${date} at ${time}.`, type: 'success' });
            
            // 4. Log/Send Notification
            onAddNotification(`System: Approval sent to ${schedulingRefill.patientName} for ${schedulingRefill.drugName}. Pickup: ${date}, ${time}.`);
        } else {
            setToast({ message: "Failed to approve request. Please try again.", type: 'success' });
        }
        setSchedulingRefill(null);
    };

    const handleDecline = async (request: PrescriptionRefillRequest) => {
        // 1. Update Database Status
        const success = await updateRefillRequest(request.id, { status: 'declined' });
        
        if (success) {
            // 2. Remove from Local List
            setRefills(prev => prev.filter(r => r.id !== request.id));
            
            // 3. Show confirmation Toast
            setToast({ message: `Refill request for ${request.drugName} declined.`, type: 'success' });
            
            // 4. No notification sent to patient (as requested)
        } else {
            setToast({ message: "Failed to decline request. Please try again.", type: 'success' });
        }
    };

    const triggerReportFlow = (patient: any) => {
        setSelectedReportPatient(patient);
        setIsDateModalOpen(true);
    };

    const handleGenerateReport = async (start: string, end: string) => {
        setReportDateRange({ start, end });
        setIsDateModalOpen(false);
        setIsReportModalOpen(true);
        setIsReportLoading(true);
        
        const healthData = {
            patientName: selectedReportPatient.name,
            metrics: [], // Mocking empty for generation
            medications: [],
            appointments: []
        };
        const report = await generateHealthReport(healthData, start, end);
        setReportContent(report);
        setIsReportLoading(false);
    };

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <DateRangeModal isOpen={isDateModalOpen} onClose={() => setIsDateModalOpen(false)} onGenerate={handleGenerateReport} />
            <HealthReportModal isOpen={isReportModalOpen} isLoading={isReportLoading} content={reportContent} dateRange={reportDateRange} onClose={() => setIsReportModalOpen(false)} />
            
            {schedulingRefill && (
                <RefillSchedulingModal 
                    request={schedulingRefill} 
                    onClose={() => setSchedulingRefill(null)} 
                    onConfirm={handleConfirmApproval} 
                />
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black">Practice Dashboard</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {userProfile.name}.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => triggerReportFlow(MOCK_PATIENTS[0])} className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-50 text-blue-600 font-black uppercase tracking-tighter rounded-xl text-[10px] md:text-xs hover:bg-blue-100 transition-all border border-blue-100 shadow-sm active:scale-95">
                        <FileIcon className="w-3.5 h-3.5 inline mr-1" /> Health Report
                    </button>
                    <button className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white font-black uppercase tracking-tighter rounded-xl text-[10px] md:text-xs hover:bg-blue-700 shadow-lg active:scale-95">
                        + New Booking
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon className={`w-4 h-4 text-blue-500`} />
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black">{stat.value}</span>
                            <span className="text-[9px] font-bold text-blue-600">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-black px-1">Upcoming Sessions</h3>
                    {APPOINTMENTS_DATA.slice(0, 3).map((app) => (
                        <div key={app.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <img src={`https://i.pravatar.cc/150?u=${app.patientName}`} className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-600" alt="" />
                                <div>
                                    <p className="font-bold text-sm leading-tight">{app.patientName}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{app.time} • {app.type}</p>
                                </div>
                            </div>
                            <button onClick={() => triggerReportFlow({name: app.patientName})} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Generate Health Report"><FileIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-black px-1">Refill Queue</h3>
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm space-y-3">
                        {refills.length > 0 ? refills.map((req) => (
                            <div key={req.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-600 hover:border-blue-200 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">Prescription</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{req.timeAgo}</span>
                                </div>
                                <p className="text-sm font-bold leading-tight">{req.patientName}</p>
                                <p className="text-[11px] text-gray-500 italic mb-4 dark:text-gray-400">{req.drugName} ({req.dosage})</p>
                                <div className="flex gap-2">
                                    <button onClick={() => handleApproveClick(req)} className="flex-1 bg-blue-600 text-white text-[10px] font-black uppercase py-2.5 rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-sm">Approve</button>
                                    <button onClick={() => handleDecline(req)} className="flex-1 bg-white dark:bg-gray-600 text-gray-400 dark:text-gray-300 text-[10px] font-black uppercase py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-all border border-gray-100 dark:border-gray-500 active:scale-95">Decline</button>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Queue empty</p></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalDashboard;
