import React, { useState, useEffect } from 'react';
import { DosageReminder } from '../types';
import { PillIcon, ClockIcon, XIcon, CheckCircleIcon } from './Icons';

interface DosageReminderPopupProps {
    reminders: DosageReminder[];
    onMarkTaken: (reminder: DosageReminder) => void;
    onSnooze: (reminder: DosageReminder) => void;
    onDismiss: (reminder: DosageReminder) => void;
}

const DosageReminderPopup: React.FC<DosageReminderPopupProps> = ({ reminders, onMarkTaken, onSnooze, onDismiss }) => {
    if (reminders.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[60] space-y-3 max-w-sm w-full pointer-events-none">
            {reminders.map((reminder, index) => (
                <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    index={index}
                    onMarkTaken={onMarkTaken}
                    onSnooze={onSnooze}
                    onDismiss={onDismiss}
                />
            ))}
        </div>
    );
};

const ReminderCard: React.FC<{
    reminder: DosageReminder;
    index: number;
    onMarkTaken: (r: DosageReminder) => void;
    onSnooze: (r: DosageReminder) => void;
    onDismiss: (r: DosageReminder) => void;
}> = ({ reminder, index, onMarkTaken, onSnooze, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);

    // Auto-dismiss after 30 seconds
    useEffect(() => {
        const totalMs = 30000;
        const intervalMs = 100;
        let elapsed = 0;
        const interval = setInterval(() => {
            elapsed += intervalMs;
            setProgress(Math.max(0, 100 - (elapsed / totalMs) * 100));
            if (elapsed >= totalMs) {
                clearInterval(interval);
                handleDismiss();
            }
        }, intervalMs);
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(reminder), 300);
    };

    const handleMarkTaken = () => {
        setIsExiting(true);
        setTimeout(() => onMarkTaken(reminder), 300);
    };

    return (
        <div
            className={`pointer-events-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 ${
                isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
            }`}
            style={{
                animation: `slideInRight 0.4s ease-out ${index * 0.1}s both`,
            }}
        >
            {/* Progress bar */}
            <div className="h-1 bg-gray-100 dark:bg-gray-700">
                <div
                    className={`h-full transition-all duration-100 ease-linear rounded-full ${
                        reminder.isOverdue ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                            reminder.isOverdue 
                                ? 'bg-red-100 dark:bg-red-900/30' 
                                : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                            <PillIcon className={`w-5 h-5 ${
                                reminder.isOverdue 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-blue-600 dark:text-blue-400'
                            }`} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                {reminder.isOverdue ? '⚠️ Overdue Dose' : '💊 Dosage Reminder'}
                            </p>
                            <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight mt-0.5">
                                {reminder.medicationName} — {reminder.dose}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                    >
                        <XIcon className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{reminder.patientName}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span className="font-bold">{reminder.scheduledTime}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleMarkTaken}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
                    >
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Mark Taken
                    </button>
                    <button
                        onClick={() => { setIsExiting(true); setTimeout(() => onSnooze(reminder), 300); }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all active:scale-95"
                    >
                        Snooze 15m
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DosageReminderPopup;
