
import React, { useState } from 'react';
import { APPOINTMENTS_DATA, PROFESSIONALS_DATA, MOCK_PATIENTS, VIDEO_CALL_HISTORY_DATA } from '../constants';
import AppointmentCard from './AppointmentCard';
import AppointmentSummaryModal from './AppointmentSummaryModal';
import EditNotesModal from './EditNotesModal';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import CalendarModal from './CalendarModal';
import Toast from './Toast';
import { Appointment, AppointmentStatus, Page, Professional, UserRole, Patient, VideoCallRecord, AppointmentType } from '../types';
import { PlusIcon, SearchIcon, VideoIcon, CalendarIcon, ClockIcon } from './Icons';
import { getAppointmentSummary } from '../services/geminiService';

const STATUS_TABS = [
  AppointmentStatus.Upcoming,
  AppointmentStatus.Completed,
  AppointmentStatus.Canceled,
  AppointmentStatus.Rescheduled,
  'Call History'
];

const parseAppointmentDate = (dateStr: string): Date | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dateStr.toLowerCase().startsWith('today')) {
    return today;
  }
  if (dateStr.toLowerCase().startsWith('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  }
  
  const dateToParse = dateStr.replace(/^(Today|Tomorrow),?\s*/i, '');
  
  const parsedDate = new Date(dateToParse);
  if (!isNaN(parsedDate.getTime())) {
      parsedDate.setHours(0,0,0,0);
      return parsedDate;
  }

  return null;
};

const formatDuration = (duration: string | number): string => {
    if (typeof duration === 'number') {
        const h = Math.floor(duration / 3600);
        const m = Math.floor((duration % 3600) / 60);
        const s = duration % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    // Fallback if it's already a string like "24:15"
    if (typeof duration === 'string' && duration.includes(':')) {
        const parts = duration.split(':');
        if (parts.length === 2) return `00:${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        return duration;
    }
    return String(duration);
};


interface AppointmentsProps {
  setActivePage: (page: Page) => void;
  setVideoCallProfessional: (appointment: Appointment, professional?: Professional | null, patient?: Patient | null) => void;
  defaultToScheduling?: boolean;
  isProfessionalView?: boolean;
  userRole?: UserRole;
}

const Appointments: React.FC<AppointmentsProps> = ({ setActivePage, setVideoCallProfessional, defaultToScheduling = false, isProfessionalView, userRole }) => {
  const [activeTab, setActiveTab] = useState<string>(AppointmentStatus.Upcoming);
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activeCalendarField, setActiveCalendarField] = useState<'start' | 'end' | null>(null);

  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [detailsAppointment, setDetailsAppointment] = useState<Appointment | null>(null);
  const [summaryModalState, setSummaryModalState] = useState<{
    appointment: Appointment | null;
    summary: string;
    isLoading: boolean;
  }>({ appointment: null, summary: '', isLoading: false });

  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab === 'Call History') return false; 
    if (appointment.status !== activeTab) return false;

    if (filterType !== 'All' && appointment.type !== filterType) return false;

    if (startDate && endDate) {
        const appointmentDate = parseAppointmentDate(appointment.date);
        if (!appointmentDate) return false;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        
        if (appointmentDate < start || appointmentDate > end) {
            return false;
        }
    }

    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const targetSearchName = isProfessionalView ? appointment.patientName : appointment.doctorName;
        if (!targetSearchName.toLowerCase().includes(lowerCaseQuery) && !appointment.specialty.toLowerCase().includes(lowerCaseQuery)) {
            return false;
        }
    }
    
    return true;
  });

  const handleJoinVideo = (appointment: Appointment) => {
    const professional = PROFESSIONALS_DATA.find(p => p.name === appointment.doctorName) || null;
    const patient = MOCK_PATIENTS.find(p => p.name === appointment.patientName) || null;
    setVideoCallProfessional(appointment, professional, patient);
  };

  const handleViewSummary = async (appointment: Appointment) => {
    setSummaryModalState({ appointment, summary: '', isLoading: true });
    const summaryText = appointment.summary || await getAppointmentSummary(appointment);
    setAppointments(prev => prev.map(app => app.id === appointment.id ? { ...app, summary: summaryText } : app));
    setSummaryModalState({ appointment, summary: summaryText, isLoading: false });
  };

  return (
    <div className="space-y-6">
      {toastMessage && <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />}
      <AppointmentSummaryModal {...summaryModalState} onClose={() => setSummaryModalState({ ...summaryModalState, appointment: null })} />
      <EditNotesModal appointment={editingAppointment} onClose={() => setEditingAppointment(null)} onSave={(id, notes) => {
          setAppointments(prev => prev.map(a => a.id === id ? { ...a, notes } : a));
          setEditingAppointment(null);
          setToastMessage('Notes updated.');
      }} />
      <AppointmentDetailsModal appointment={detailsAppointment} onClose={() => setDetailsAppointment(null)} />
      
      <CalendarModal
        isOpen={!!activeCalendarField}
        onClose={() => setActiveCalendarField(null)}
        title={activeCalendarField === 'start' ? "Select Start Date" : "Select End Date"}
        initialDate={activeCalendarField === 'start' ? startDate : endDate}
        onSelectDate={(date) => {
            if (activeCalendarField === 'start') setStartDate(date);
            else setEndDate(date);
        }}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-black">Clinical Schedule</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage your upcoming consultations.</p>
        </div>
        {!isProfessionalView && (
            <button onClick={() => setActivePage(Page.ScheduleAppointment)} className="bg-blue-600 text-white font-bold px-5 py-3 rounded-xl flex items-center space-x-2 shadow-lg">
              <PlusIcon className="w-5 h-5" /> <span>Schedule</span>
            </button>
        )}
      </div>
      
      <div className="bg-white p-4 rounded-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex flex-col gap-4">
            <nav className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1">
                {STATUS_TABS.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
                    activeTab === tab
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:bg-gray-50 bg-gray-50/50 dark:bg-gray-700 dark:hover:bg-gray-600'
                    }`}
                >
                    {tab}
                </button>
                ))}
            </nav>
            
            <div className="relative w-full">
                <SearchIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder={`Search ${isProfessionalView ? 'patient' : 'doctor'} records...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 rounded-xl border-none pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-700 dark:text-white shadow-inner"
                />
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 ml-1">Type</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-gray-50 rounded-xl border-none px-4 py-2.5 focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-700 dark:text-white shadow-inner font-medium">
                        <option value="All">All Types</option>
                        {Object.values(AppointmentType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 ml-1">Start Date</label>
                    <div 
                        onClick={() => setActiveCalendarField('start')}
                        className="w-full bg-gray-50 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer border border-transparent focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow-inner"
                    >
                        <span className={`text-sm font-medium ${startDate ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {startDate || 'Select Date'}
                        </span>
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 ml-1">End Date</label>
                    <div 
                        onClick={() => setActiveCalendarField('end')}
                        className="w-full bg-gray-50 rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer border border-transparent focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow-inner"
                    >
                        <span className={`text-sm font-medium ${endDate ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {endDate || 'Select Date'}
                        </span>
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="pb-20">
        {activeTab === 'Call History' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
              {VIDEO_CALL_HISTORY_DATA.map((record) => (
                  <div key={record.id} className="bg-white p-5 rounded-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                          <img src={record.professionalAvatar} alt="" className="w-12 h-12 rounded-full border border-gray-100" />
                          <div>
                              <p className="font-bold text-gray-900 dark:text-white">{record.professionalName}</p>
                              <div className="flex items-center space-x-3 mt-1">
                                  <span className="flex items-center text-[10px] font-bold text-gray-400 uppercase"><CalendarIcon className="w-3 h-3 mr-1" />{record.date}</span>
                                  <span className="flex items-center text-[10px] font-bold text-gray-400 uppercase"><ClockIcon className="w-3 h-3 mr-1" />{record.time}</span>
                              </div>
                          </div>
                      </div>
                      <div className="text-right">
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg tracking-wider font-mono">
                              Duration: {formatDuration(record.duration)}
                          </span>
                          <button className="block text-[10px] font-bold text-gray-400 mt-2 hover:text-blue-600 transition-colors uppercase tracking-widest">View Transcript</button>
                      </div>
                  </div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                  <AppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                      isProfessionalView={isProfessionalView}
                      onJoinVideo={handleJoinVideo}
                      onViewSummary={handleViewSummary}
                      onViewDetails={setDetailsAppointment}
                  />
              ))
            ) : (
              <div className="lg:col-span-2 text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No matching sessions found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria.</p>
                  {!isProfessionalView && (
                    <button
                        onClick={() => setActivePage(Page.ScheduleAppointment)}
                        className="mt-6 bg-blue-600 text-white font-bold px-5 py-3 rounded-xl flex items-center space-x-2 shadow-lg mx-auto hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" /> <span>Schedule New Appointment</span>
                    </button>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
