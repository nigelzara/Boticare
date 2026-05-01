
import React from 'react';
import { Appointment } from '../types';
import { XIcon, CalendarIcon, ClockIcon } from './Icons';

interface AppointmentSummaryModalProps {
  appointment: Appointment | null;
  summary: string;
  isLoading: boolean;
  onClose: () => void;
}

const AppointmentSummaryModal: React.FC<AppointmentSummaryModalProps> = ({ appointment, summary, isLoading, onClose }) => {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full relative transform transition-all dark:bg-gray-800" role="dialog" aria-modal="true">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
            <XIcon className="w-6 h-6" />
        </button>
        
        <div className="flex items-center space-x-4 mb-6">
            <img src={appointment.avatar} alt={appointment.doctorName} className="w-16 h-16 rounded-full flex-shrink-0" />
            <div>
                <h2 className="text-2xl font-bold">Consultation Summary</h2>
                <p className="text-boticare-gray-dark dark:text-gray-400">with {appointment.doctorName} ({appointment.specialty})</p>
                <div className="flex items-center space-x-4 text-sm text-boticare-gray-dark mt-1 dark:text-gray-400">
                    <div className="flex items-center space-x-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <ClockIcon className="w-4 h-4" />
                        <span>{appointment.time}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto pr-4 -mr-4">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-10">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse [animation-delay:-0.3s] dark:bg-blue-400"></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse [animation-delay:-0.15s] dark:bg-blue-400"></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse dark:bg-blue-400"></div>
                    </div>
                    <p className="text-sm font-medium text-boticare-gray-dark dark:text-gray-400">Generating AI summary, please wait...</p>
                </div>
            ) : (
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-justify dark:text-gray-300">
                    {summary}
                </p>
            )}
        </div>

         <div className="flex justify-end pt-6 mt-6 border-t border-boticare-gray-medium dark:border-gray-700">
            <button
                onClick={onClose}
                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSummaryModal;
