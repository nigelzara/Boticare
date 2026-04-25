import React from 'react';
import { Appointment } from '../types';
import { XIcon, AlertIcon } from './Icons';

interface CancelAppointmentModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({ appointment, onClose, onConfirm }) => {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative transform transition-all dark:bg-gray-800" role="dialog" aria-modal="true">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
          <XIcon className="w-6 h-6" />
        </button>

        <div className="flex items-start space-x-4">
            <div className="p-2 bg-boticare-red/20 rounded-full mt-1 flex-shrink-0 dark:bg-red-900/30">
                <AlertIcon className="w-6 h-6 text-boticare-red-dark dark:text-red-300" />
            </div>
            <div>
                <h2 className="text-xl font-bold">Confirm Cancellation</h2>
                <p className="text-sm text-boticare-gray-dark mt-2 dark:text-gray-400">
                    Are you sure you want to cancel your appointment with <span className="font-semibold">{appointment.doctorName}</span> on <span className="font-semibold">{appointment.date}</span> at <span className="font-semibold">{appointment.time}</span>?
                </p>
                <p className="text-sm font-bold text-boticare-gray-dark mt-2 dark:text-gray-300">This action cannot be undone.</p>
            </div>
        </div>

        <div className="flex justify-end items-center space-x-3 pt-6 mt-6 border-t border-boticare-gray-medium dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-gray-700 bg-boticare-gray hover:bg-boticare-gray-medium transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-semibold text-white bg-boticare-red-dark hover:bg-red-700 transition-colors"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelAppointmentModal;