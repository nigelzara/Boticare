
import React from 'react';
import { Appointment } from '../types';
import { XIcon, CalendarIcon, ClockIcon, UserIcon, NotesIcon, VideoIcon } from './Icons';

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({ appointment, onClose }) => {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full relative transform transition-all dark:bg-gray-800 dark:text-white" role="dialog" aria-modal="true">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XIcon className="w-6 h-6" />
        </button>

        <div className="flex items-start space-x-4 border-b border-boticare-gray-medium pb-6 mb-6 dark:border-gray-700">
             <img src={appointment.avatar} alt={appointment.doctorName} className="w-16 h-16 rounded-full" />
             <div>
                 <h2 className="text-2xl font-bold">{appointment.doctorName}</h2>
                 <p className="text-boticare-gray-dark dark:text-gray-400">{appointment.specialty}</p>
                 <span className="inline-block mt-2 px-2 py-1 bg-boticare-blue text-boticare-blue-dark text-xs font-semibold rounded-md dark:bg-blue-900/50 dark:text-blue-300">
                     {appointment.status}
                 </span>
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 dark:text-gray-400">Appointment Info</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <span>{appointment.date}</span>
                    </div>
                     <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-gray-400" />
                        <span>{appointment.time} ({appointment.duration} min)</span>
                    </div>
                     <div className="flex items-center space-x-2">
                        <VideoIcon className="w-5 h-5 text-gray-400" />
                        <span>Video Consultation</span>
                    </div>
                </div>
            </div>
             <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 dark:text-gray-400">Patient Details</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <span>{appointment.patientName || 'Jane Doe'}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="mb-6">
             <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 dark:text-gray-400">Reason for Visit / Notes</h3>
             <div className="bg-boticare-gray p-4 rounded-lg flex items-start space-x-2 dark:bg-gray-700">
                 <NotesIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                 <p className="text-gray-700 dark:text-gray-300">{appointment.notes}</p>
             </div>
        </div>

        <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 dark:text-gray-400">Attached Documents</h3>
            {appointment.documents && appointment.documents.length > 0 ? (
                <ul className="space-y-2">
                    {appointment.documents.map(doc => (
                        <li key={doc.id} className="flex items-center justify-between p-3 border border-boticare-gray-medium rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700/50 cursor-pointer">
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white uppercase ${doc.type === 'pdf' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                    {doc.type}
                                </div>
                                <div>
                                    <p className="font-medium">{doc.name}</p>
                                    <p className="text-xs text-gray-500">{doc.date}</p>
                                </div>
                            </div>
                            <button className="text-blue-600 text-sm font-medium hover:underline dark:text-blue-400">View</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 italic">No documents attached.</p>
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

export default AppointmentDetailsModal;
