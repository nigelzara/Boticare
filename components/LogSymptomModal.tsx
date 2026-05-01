
import React, { useState } from 'react';
import { XIcon, NotesIcon } from './Icons';
import { Symptom } from '../types';

interface LogSymptomModalProps {
  onClose: () => void;
  onSave: (symptom: Omit<Symptom, 'id'>) => void;
}

const LogSymptomModal: React.FC<LogSymptomModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!name || !date) return;
    onSave({ name, date, severity, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative transform transition-all dark:bg-gray-800" role="dialog" aria-modal="true">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <XIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Log New Symptom</h2>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Symptom Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Headache, Nausea"
                    className="w-full bg-boticare-gray rounded-lg border-none px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:bg-gray-700 dark:text-gray-200"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Date Observed</label>
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-boticare-gray rounded-lg border-none px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:bg-gray-700 dark:text-gray-200"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Severity</label>
                <select 
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-boticare-gray rounded-lg border-none px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:bg-gray-700 dark:text-gray-200"
                >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Description</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe how you feel..."
                    rows={3}
                    className="w-full bg-boticare-gray rounded-lg border-none p-4 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none dark:bg-gray-700 dark:text-gray-200"
                />
            </div>
        </div>

        <div className="flex justify-end items-center space-x-3 pt-6 mt-4 border-t border-boticare-gray-medium dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-semibold text-gray-600 hover:bg-boticare-gray dark:text-gray-400 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-opacity-90 disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-600"
          >
            Save Symptom
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogSymptomModal;
