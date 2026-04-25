
import React, { useState } from 'react';
import { PrescriptionRefillRequest } from '../types';
import { ClockIcon, XIcon, CalendarIcon, CheckCircleIcon } from './Icons';

interface RefillSchedulingModalProps {
    request: PrescriptionRefillRequest;
    onClose: () => void;
    onConfirm: (date: string, time: string) => void;
}

const availableDates = ['Today', 'Tomorrow'];
const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM'
];

const RefillSchedulingModal: React.FC<RefillSchedulingModalProps> = ({ request, onClose, onConfirm }) => {
    const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]);
    const [selectedSlot, setSelectedSlot] = useState<string>(timeSlots[0]);

    const handleConfirm = () => {
        onConfirm(selectedDate, selectedSlot);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full relative transform transition-all dark:bg-gray-800 border border-gray-100 dark:border-gray-700" role="dialog" aria-modal="true">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <XIcon className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Schedule Refill</h2>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select a time slot for <span className="font-bold text-gray-800 dark:text-gray-200">{request.patientName}</span> to pick up <span className="font-bold text-blue-600 dark:text-blue-400">{request.drugName}</span>.
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Processing Date</label>
                        <div className="flex gap-3">
                            {availableDates.map(date => (
                                <button
                                    key={date}
                                    onClick={() => setSelectedDate(date)}
                                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                                        selectedDate === date 
                                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300 shadow-sm' 
                                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                                    }`}
                                >
                                    {date}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Available Time Slots</label>
                        <div className="grid grid-cols-2 gap-3">
                            {timeSlots.map(slot => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                                        selectedSlot === slot 
                                            ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-[1.02]' 
                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-white hover:border-blue-300 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Confirm & Approve</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RefillSchedulingModal;
