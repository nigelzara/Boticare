
import React, { useState, useEffect } from 'react';
import { HealthAlert } from '../types';
import { ClockIcon, XIcon, PillIcon } from './Icons';

interface MedicationReminderModalProps {
    alert: HealthAlert | null;
    onClose: () => void;
    onConfirm: (date: string, time: string) => void;
}

const availableDates = ['Today', 'Tomorrow', 'Sat, Jun 8', 'Sun, Jun 9'];
const availableTimes = ['09:00 AM', '01:00 PM', '05:00 PM', '09:00 PM'];

const MedicationReminderModal: React.FC<MedicationReminderModalProps> = ({ alert, onClose, onConfirm }) => {
    const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]);
    const [selectedTime, setSelectedTime] = useState<string>(availableTimes[0]);
    const [customTime, setCustomTime] = useState<string>('12:00');
    const [isCustomTimeActive, setIsCustomTimeActive] = useState<boolean>(false);

    useEffect(() => {
        if (alert) {
            setSelectedDate(availableDates[0]);
            setSelectedTime(availableTimes[0]);
            setCustomTime('12:00');
            setIsCustomTimeActive(false);
        }
    }, [alert]);

    if (!alert) return null;

    const handleConfirm = () => {
        onConfirm(selectedDate, selectedTime);
    };
    
    const handleTimeButtonClick = (time: string) => {
        setSelectedTime(time);
        setIsCustomTimeActive(false);
    };

    const handleCustomTimeClick = () => {
        setIsCustomTimeActive(true);
        setSelectedTime(customTime);
    };
    
    const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        setCustomTime(newTime);
        setSelectedTime(newTime);
    };
    
    const medicationName = alert.description.split(' of ')[1] || 'your medication';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full relative transform transition-all dark:bg-gray-800" role="dialog" aria-modal="true" aria-labelledby="reminder-title">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="flex items-start space-x-3 mb-6">
                    <div className="p-2 bg-boticare-red/20 rounded-full mt-1 dark:bg-red-900/30">
                        <PillIcon className="w-6 h-6 text-boticare-red-dark dark:text-red-300" />
                    </div>
                    <div>
                        <h2 id="reminder-title" className="text-2xl font-bold">Set New Reminder</h2>
                        <p className="text-boticare-gray-dark dark:text-gray-400">You missed a dose of <span className="font-semibold text-blue-600 dark:text-gray-200">{medicationName}</span>. Set a new reminder.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">Select a Date</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {availableDates.map(date => (
                                <button key={date} onClick={() => setSelectedDate(date)} className={`p-3 rounded-lg border-2 text-center transition-colors ${selectedDate === date ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30' : 'border-boticare-gray-medium hover:border-boticare-gray-dark dark:border-gray-600 dark:hover:border-gray-500'}`}>
                                    <p className="font-semibold text-sm">{date}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2 dark:text-gray-300">Select a Time</p>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {availableTimes.map(time => (
                                <button key={time} onClick={() => handleTimeButtonClick(time)} className={`p-3 rounded-lg border-2 text-center transition-colors flex items-center justify-center space-x-2 ${!isCustomTimeActive && selectedTime === time ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30' : 'border-boticare-gray-medium hover:border-boticare-gray-dark dark:border-gray-600 dark:hover:border-gray-500'}`}>
                                    <ClockIcon className="w-4 h-4 text-boticare-gray-dark dark:text-gray-400" />
                                    <p className="font-semibold text-sm">{time}</p>
                                </button>
                            ))}
                            <button onClick={handleCustomTimeClick} className={`p-3 rounded-lg border-2 text-center transition-colors flex items-center justify-center space-x-2 ${isCustomTimeActive ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30' : 'border-boticare-gray-medium hover:border-boticare-gray-dark dark:border-gray-600 dark:hover:border-gray-500'}`}>
                                <ClockIcon className="w-4 h-4 text-boticare-gray-dark dark:text-gray-400" />
                                <p className="font-semibold text-sm">Custom</p>
                            </button>
                        </div>
                        {isCustomTimeActive && (
                            <div className="mt-4 animate-fade-in">
                                <label htmlFor="custom-time" className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-400">Set a custom time</label>
                                <input
                                    type="time"
                                    id="custom-time"
                                    value={customTime}
                                    onChange={handleCustomTimeChange}
                                    className="w-full bg-boticare-gray rounded-lg border-none px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:bg-gray-700 dark:text-gray-200"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end items-center space-x-4 pt-6 mt-6 border-t border-boticare-gray-medium dark:border-gray-700">
                    <button onClick={onClose} className="font-semibold text-gray-600 px-6 py-2 rounded-lg hover:bg-boticare-gray transition-colors dark:text-gray-300 dark:hover:bg-gray-700">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        <span>Set Reminder</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicationReminderModal;
