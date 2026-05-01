
import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { XIcon, NotesIcon } from './Icons';

interface EditNotesModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onSave: (appointmentId: number, newNotes: string) => void;
}

const EditNotesModal: React.FC<EditNotesModalProps> = ({ appointment, onClose, onSave }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (appointment) {
      setNotes(appointment.notes);
    }
  }, [appointment]);

  if (!appointment) return null;

  const handleSave = () => {
    onSave(appointment.id, notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full relative transform transition-all dark:bg-gray-800" role="dialog" aria-modal="true">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
          <XIcon className="w-6 h-6" />
        </button>

        <div className="flex items-start space-x-3 mb-6">
          <div className="p-2 bg-boticare-gray rounded-full mt-1 dark:bg-gray-700">
            <NotesIcon className="w-5 h-5 text-boticare-gray-dark dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Edit Appointment Notes</h2>
            <p className="text-sm text-boticare-gray-dark dark:text-gray-400">For your appointment with {appointment.doctorName}</p>
          </div>
        </div>

        <div>
          <label htmlFor="appointment-notes" className="sr-only">Appointment Notes</label>
          <textarea
            id="appointment-notes"
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes for your appointment..."
            className="w-full bg-boticare-gray rounded-lg border-none p-4 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
          />
        </div>

        <div className="flex justify-end items-center space-x-4 pt-6 mt-2 border-t border-boticare-gray-medium dark:border-gray-700">
          <button onClick={onClose} className="font-semibold text-gray-600 px-6 py-2 rounded-lg hover:bg-boticare-gray dark:text-gray-300 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNotesModal;
