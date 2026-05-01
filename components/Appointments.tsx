
import React, { useState } from 'react';
import { APPOINTMENTS_DATA, PROFESSIONALS_DATA, VIDEO_CALL_HISTORY_DATA, MOCK_PATIENTS } from '../constants';
import AppointmentCard from './AppointmentCard';
import BookAppointmentForm from './ScheduleAppointmentForm';
import AppointmentSummaryModal from './AppointmentSummaryModal';
import EditNotesModal from './EditNotesModal';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import Toast from './Toast';
import CancelAppointmentModal from './CancelAppointmentModal';
import { Appointment, AppointmentStatus, Page, Professional, NewAppointmentDetails, AppointmentType, UserRole } from '../types';
import { PlusIcon, SearchIcon, VideoIcon, FileIcon } from './Icons';
import { getAppointmentSummary } from '../services/geminiService';

const STATUS_TABS = [
  AppointmentStatus.Upcoming,
  AppointmentStatus.Completed,
  AppointmentStatus.Canceled,
  AppointmentStatus.Rescheduled,
  'Call History',
  'History'
];

interface AppointmentsProps {
  setActivePage: (page: Page) => void;
  setVideoCallProfessional: (appointment: Appointment, professional?: Professional | null) => void;
  defaultToScheduling?: boolean;
  isProfessionalView?: boolean;
  userRole?: UserRole;
}

const Appointments: React.FC<AppointmentsProps> = ({ setActivePage, setVideoCallProfessional, defaultToScheduling = false, isProfessionalView = false, userRole }) => {
  const [activeTab, setActiveTab] = useState<string>(AppointmentStatus.Upcoming);
  const [activeType, setActiveType] = useState<string>('All');
  const [isScheduling, setIsScheduling] = useState(defaultToScheduling);
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [cancelingAppointment, setCancelingAppointment] = useState<Appointment | null>(null);
  const [detailsAppointment, setDetailsAppointment] = useState<Appointment | null>(null);
  const [summaryModalState, setSummaryModalState] = useState<{
    appointment: Appointment | null;
    summary: string;
    isLoading: boolean;
  }>({ appointment: null, summary: '', isLoading: false });

  const filteredAppointments = appointments
    .filter((appointment) => {
        if (activeTab === 'History') return appointment.status === AppointmentStatus.Completed;
        return appointment.status === activeTab;
    })
    .filter((appointment) => {
        if (activeType === 'All') return true;
        return appointment.type === activeType;
    })
    .filter((appointment) => {
        if (!searchQuery) return true;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return (
            appointment.doctorName.toLowerCase().includes(lowerCaseQuery) ||
            appointment.specialty.toLowerCase().includes(lowerCaseQuery)
        );
    });
  
  const handleBookSuccess = (details: NewAppointmentDetails) => {
    const newAppointment: Appointment = {
        id: Math.max(...appointments.map(a => a.id), 0) + 1,
        doctorName: details.professional.name,
        specialty: details.professional.specialty,
        status: AppointmentStatus.Upcoming,
        type: AppointmentType.Consultation,
        date: details.date,
        time: details.time,
        duration: 30,
        notes: details.notes || `Consultation for ${details.professional.specialty}`,
        avatar: details.professional.avatar,
        patientName: 'Jane Doe',
        patientId: 'patient1_supabase_id',
        professionalId: details.professional.supabaseId,
        documents: []
    };

    setAppointments(prev => [newAppointment, ...prev]);
    setIsScheduling(false);
    setActiveTab(AppointmentStatus.Upcoming);
    setToastMessage('Appointment scheduled successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRescheduleConfirm = (appointmentId: number, details: NewAppointmentDetails) => {
    setAppointments(prev => 
      prev.map(app => 
        app.id === appointmentId 
          ? { 
              ...app, 
              status: AppointmentStatus.Rescheduled, 
              date: details.date, 
              time: details.time,
              notes: details.notes,
            }
          : app
      )
    );
    setIsScheduling(false);
    setAppointmentToReschedule(null);
    setActiveTab(AppointmentStatus.Rescheduled);
    setToastMessage('Appointment rescheduled successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartReschedule = (appointment: Appointment) => {
    setAppointmentToReschedule(appointment);
    setIsScheduling(true);
  };

  const handleCancelAppointment = (appointmentId: number) => {
    setAppointments(prev =>
      prev.map(app =>
        app.id === appointmentId
          ? { ...app, status: AppointmentStatus.Canceled }
          : app
      )
    );
    setActiveTab(AppointmentStatus.Canceled);
    setToastMessage('Appointment canceled successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRequestCancel = (appointment: Appointment) => {
    setCancelingAppointment(appointment);
  };

  const handleCancelScheduling = () => {
    setIsScheduling(false);
    setAppointmentToReschedule(null);
    if (defaultToScheduling) {
        setActivePage(Page.HealthMetrics);
    }
  }
  
  const handleJoinVideo = (appointment: Appointment) => {
    const professional = PROFESSIONALS_DATA.find(p => p.name === appointment.doctorName) || null;
    setVideoCallProfessional(appointment, professional);
  };

  const handleViewSummary = async (appointment: Appointment) => {
    setSummaryModalState({ appointment, summary: '', isLoading: true });
    if (appointment.summary) {
      setSummaryModalState({ appointment, summary: appointment.summary, isLoading: false });
      return;
    }
    const summaryText = await getAppointmentSummary(appointment);
    setAppointments(prev =>
      prev.map(app =>
        app.id === appointment.id ? { ...app, summary: summaryText } : app
      )
    );
    setSummaryModalState({ appointment, summary: summaryText, isLoading: false });
  };

  const handleCloseSummaryModal = () => {
    setSummaryModalState({ appointment: null, summary: '', isLoading: false });
  };

  const handleOpenEditNotes = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };
  
  const handleViewDetails = (appointment: Appointment) => {
      setDetailsAppointment(appointment);
  };

  const handleCloseEditNotes = () => {
    setEditingAppointment(null);
  };

  const handleSaveNotes = (appointmentId: number, newNotes: string) => {
    setAppointments(prev =>
      prev.map(app =>
        app.id === appointmentId ? { ...app, notes: newNotes } : app
      )
    );
    setEditingAppointment(null);
    setToastMessage('Appointment notes updated successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (isScheduling) {
    return (
      <BookAppointmentForm 
        appointmentToReschedule={appointmentToReschedule}
        onBook={handleBookSuccess}
        onReschedule={handleRescheduleConfirm}
        onCancel={handleCancelScheduling} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {toastMessage && <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />}
      <AppointmentSummaryModal {...summaryModalState} onClose={handleCloseSummaryModal} />
      <EditNotesModal appointment={editingAppointment} onClose={handleCloseEditNotes} onSave={handleSaveNotes} />
      <AppointmentDetailsModal appointment={detailsAppointment} onClose={() => setDetailsAppointment(null)} />
      <CancelAppointmentModal 
        appointment={cancelingAppointment}
        onClose={() => setCancelingAppointment(null)}
        onConfirm={() => {
            if (cancelingAppointment) {
                handleCancelAppointment(cancelingAppointment.id);
                setCancelingAppointment(null);
            }
        }}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-black">Appointments</h2>
            <p className="text-boticare-gray-dark dark:text-gray-400">
                Manage your consultations and medical records.
            </p>
        </div>
        <button 
            onClick={() => setIsScheduling(true)}
            className="bg-blue-600 text-white font-bold px-5 py-3 rounded-xl flex items-center space-x-2 hover:bg-opacity-90 transition-all dark:bg-blue-600 dark:hover:bg-blue-700 w-full md:w-auto justify-center shadow-lg"
        >
            <PlusIcon className="w-5 h-5" />
            <span>Book Session</span>
        </button>
      </div>
      
      {/* Search and Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex flex-col gap-4">
            <nav className="flex flex-wrap gap-2">
                {STATUS_TABS.map((tab) => (
                <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setActiveType('All'); }}
                    className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl transition-all flex-grow md:flex-grow-0 ${
                    activeTab === tab
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100 dark:shadow-none'
                        : 'text-boticare-gray-dark hover:bg-boticare-gray bg-gray-50 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                    }`}
                >
                    {tab}
                </button>
                ))}
            </nav>
            
            <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search doctor or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-boticare-gray rounded-xl border-none pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 shadow-inner"
                />
            </div>
        </div>
      </div>

      {activeTab === 'Call History' ? (
          <div className="bg-white rounded-2xl border border-boticare-gray-medium overflow-hidden dark:bg-gray-800 dark:border-gray-700 animate-fade-in shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-boticare-gray-medium dark:bg-gray-700/50 dark:border-gray-600 flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <VideoIcon className="w-4 h-4 text-blue-500" /> Encounter Logs
                  </h3>
              </div>
              {VIDEO_CALL_HISTORY_DATA.length > 0 ? (
                  <div className="divide-y divide-boticare-gray-medium dark:divide-gray-700">
                    {VIDEO_CALL_HISTORY_DATA.map((call) => (
                        <div key={call.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors gap-4">
                            <div className="flex items-center space-x-4">
                                <img src={call.professionalAvatar} alt={call.professionalName} className="w-12 h-12 rounded-full border border-gray-100" />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{call.professionalName}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                        <span>{call.date}</span>
                                        <span>{call.time}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{call.duration} session</span>
                                <button className="text-xs font-bold text-gray-400 hover:text-blue-600 underline underline-offset-4 uppercase tracking-widest">View Report</button>
                            </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="p-16 text-center text-gray-500">
                      <p className="font-medium">No recorded session logs available.</p>
                  </div>
              )}
          </div>
      ) : activeTab === 'History' ? (
        <div className="bg-white rounded-2xl border border-boticare-gray-medium overflow-hidden dark:bg-gray-800 dark:border-gray-700 animate-fade-in shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-boticare-gray-medium dark:bg-gray-700/50 dark:border-gray-600 flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <FileIcon className="w-4 h-4 text-purple-500" /> Clinical History
                </h3>
            </div>
            {filteredAppointments.length > 0 ? (
                <div className="divide-y divide-boticare-gray-medium dark:divide-gray-700">
                    {filteredAppointments.map((appointment) => (
                        <div key={appointment.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors gap-4">
                            <div className="flex items-center space-x-4">
                                <img src={appointment.avatar} alt={appointment.doctorName} className="w-12 h-12 rounded-full border border-gray-100" />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{appointment.doctorName}</h4>
                                    <p className="text-xs text-gray-500">{appointment.specialty} • {appointment.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleViewDetails(appointment)} className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl">Review</button>
                                <button onClick={() => handleViewSummary(appointment)} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-100">Summary</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-16 text-center text-gray-500">
                    <p className="font-medium">No archived history records found.</p>
                </div>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in pb-20">
            {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
                <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onReschedule={handleStartReschedule}
                    onCancel={handleRequestCancel} 
                    onJoinVideo={handleJoinVideo}
                    onViewSummary={handleViewSummary}
                    onEditNotes={handleOpenEditNotes}
                    onViewDetails={handleViewDetails}
                />
            ))
            ) : (
            <div className="lg:col-span-2 text-center py-24 bg-white rounded-2xl border-2 border-dashed border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700">
                <p className="text-gray-400 font-bold text-lg">No matching sessions found.</p>
            </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Appointments;
