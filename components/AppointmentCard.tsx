
import React from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { CalendarIcon, ClockIcon, VideoIcon, NotesIcon } from './Icons';

interface AppointmentCardProps {
  appointment: Appointment;
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onJoinVideo?: (appointment: Appointment) => void;
  onViewSummary?: (appointment: Appointment) => void;
  onEditNotes?: (appointment: Appointment) => void;
  onViewDetails?: (appointment: Appointment) => void;
}

const statusStyles = {
  [AppointmentStatus.Upcoming]: 'bg-boticare-blue text-boticare-blue-dark dark:bg-blue-900/50 dark:text-blue-300',
  [AppointmentStatus.Completed]: 'bg-boticare-green text-boticare-green-dark dark:bg-green-900/50 dark:text-green-300',
  [AppointmentStatus.Canceled]: 'bg-boticare-red text-boticare-red-dark dark:bg-red-900/50 dark:text-red-300',
  [AppointmentStatus.Rescheduled]: 'bg-boticare-yellow text-boticare-yellow-dark dark:bg-yellow-900/50 dark:text-yellow-300',
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onReschedule, onCancel, onJoinVideo, onViewSummary, onEditNotes, onViewDetails }) => {
  const displayTitle = appointment.doctorName;
  const displaySubtitle = appointment.specialty;
  const displayAvatar = appointment.avatar;

  const handleJoinVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onJoinVideo) onJoinVideo(appointment);
  };

  return (
    <div 
        onClick={() => onViewDetails?.(appointment)}
        className="bg-white p-5 rounded-xl border border-boticare-gray-medium flex flex-col space-y-4 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer dark:bg-gray-800 dark:border-gray-700 group relative"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <img src={displayAvatar} alt={displayTitle} className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-600 shadow-sm" />
          <div>
            <p className="font-bold text-gray-900 dark:text-white leading-tight">{displayTitle}</p>
            <p className="text-[10px] md:text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5">{displaySubtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${statusStyles[appointment.status]}`}>
            {appointment.status}
            </span>
        </div>
      </div>
      
      <div className="text-sm text-boticare-gray-dark dark:text-gray-400 flex items-center justify-between border-t border-b border-boticare-gray-medium dark:border-gray-600 py-3">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4" />
          <span className="font-medium">{appointment.date}</span>
        </div>
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4" />
          <span className="font-medium">{appointment.time}</span>
        </div>
      </div>

      <div className="bg-boticare-gray p-3 rounded-lg text-sm space-y-2 dark:bg-gray-700/50">
        <div className="flex items-center space-x-2 font-bold text-gray-700 dark:text-gray-300">
            <VideoIcon className="w-4 h-4 text-blue-500" />
            <span>Encrypted Session</span>
        </div>
        <div className="flex items-start justify-between text-boticare-gray-dark dark:text-gray-400">
            <div className="flex items-start space-x-2">
                <NotesIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="pr-2 line-clamp-1 italic text-xs">"{appointment.notes}"</span>
            </div>
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()} className="pt-2">
        {appointment.status === AppointmentStatus.Upcoming && (
            <button 
                onClick={handleJoinVideoClick}
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 dark:shadow-none"
            >
                Launch Consultation
            </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
