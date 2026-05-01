
import React, { useState } from 'react';
import { Appointment } from '../types';
import { CalendarIcon, ClockIcon, XIcon } from './Icons';

interface RescheduleModalProps {
    appointment: Appointment;
    onClose: () => void;
    onConfirm: (appointmentId: number, newDate: string, newTime: string) => void;
}

const availableDates = ['Mon, Jun 10', 'Tue, Jun 11', 'Wed, Jun 12', 'Fri, Jun 14'];
const availableTimes = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];

const RescheduleModal: React.FC<RescheduleModalProps> = ({ appointment, onClose, onConfirm }) => {
    const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]);
    const [selectedTime, setSelectedTime] = useState<string>(availableTimes[0]);

    const handleConfirm = () => {
        onConfirm(appointment.id, selectedDate, selectedTime);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full relative transform transition-all" role="dialog" aria-modal="true" aria-labelledby="reschedule-title">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XIcon className="w-6 h-6" />
                    <span className="sr-only">Close</span>
                </button>

                <h2 id="reschedule-title" className="text-2xl font-bold mb-2">Reschedule Appointment</h2>
                <p className="text-boticare-gray-dark mb-6">Select a new date and time for your appointment with <span className="font-semibold text-blue-600">{appointment.doctorName}</span>.</p>

                <div className="space-y-6">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Select a New Date</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {availableDates.map(date => (
                                <button key={date} onClick={() => setSelectedDate(date)} className={`p-3 rounded-lg border-2 text-center transition-colors ${selectedDate === date ? 'border-blue-600 bg-blue-50' : 'border-boticare-gray-medium hover:border-boticare-gray-dark'}`}>
                                    <CalendarIcon className="w-5 h-5 mx-auto mb-1.5 text-boticare-gray-dark" />
                                    <p className="font-semibold text-sm">{date}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Select a New Time</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {availableTimes.map(time => (
                                <button key={time} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg border-2 text-center transition-colors ${selectedTime === time ? 'border-blue-600 bg-blue-50' : 'border-boticare-gray-medium hover:border-boticare-gray-dark'}`}>
                                    <ClockIcon className="w-5 h-5 mx-auto mb-1.5 text-boticare-gray-dark" />
                                    <p className="font-semibold text-sm">{time}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center space-x-4 pt-6 mt-6 border-t border-boticare-gray-medium">
                    <button onClick={onClose} className="font-semibold text-gray-600 px-6 py-2 rounded-lg hover:bg-boticare-gray">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90 transition-colors"
                    >
                        <span>Confirm Reschedule</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RescheduleModal;
