
import React, { useState, useEffect } from 'react';
import { XIcon, ChevronRightIcon } from './Icons';

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDate: (date: string) => void;
    initialDate?: string;
    title?: string;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, onSelectDate, initialDate, title = "Select Date" }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState<string | undefined>(initialDate);

    useEffect(() => {
        if (isOpen) {
            const d = initialDate && !isNaN(new Date(initialDate).getTime()) ? new Date(initialDate) : new Date();
            // Reset hours to avoid timezone issues when displaying just date
            d.setHours(0,0,0,0);
            setViewDate(d);
            setSelectedDateStr(initialDate);
        }
    }, [isOpen, initialDate]);

    if (!isOpen) return null;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

    const handlePrevMonth = () => {
        setViewDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(year, month + 1, 1));
    };

    const handleDayClick = (day: number) => {
        // Construct YYYY-MM-DD manually to avoid UTC conversion issues
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        const dateStr = `${year}-${m}-${d}`;
        
        onSelectDate(dateStr);
        onClose();
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm dark:bg-gray-800 dark:border dark:border-gray-700">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Calendar Navigation */}
                <div className="flex justify-between items-center mb-4">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700">
                        <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 transform rotate-180" />
                    </button>
                    <div className="font-bold text-gray-800 dark:text-white text-lg">
                        {monthNames[month]} {year}
                    </div>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700">
                        <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-xs font-bold text-gray-400 uppercase">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty slots for start of month */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    
                    {/* Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        
                        // Check if this day is selected
                        const m = String(month + 1).padStart(2, '0');
                        const d = String(day).padStart(2, '0');
                        const currentDateStr = `${year}-${m}-${d}`;
                        const isSelected = selectedDateStr === currentDateStr;
                        
                        // Check if today
                        const today = new Date();
                        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                        return (
                            <button
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                                    ${isSelected 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : isToday 
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' 
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}
                                `}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;
