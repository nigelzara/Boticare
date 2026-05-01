
import React, { useState, useEffect } from 'react';
import { PROFESSIONALS_DATA } from '../constants';
import { Professional, NewAppointmentDetails, Appointment } from '../types';
import { VideoIcon, ChatIcon, CalendarIcon, StarIcon, NotesIcon, ClockIcon } from './Icons';

interface BookAppointmentFormProps {
    appointmentToReschedule?: Appointment | null;
    onBook: (details: NewAppointmentDetails) => void;
    onReschedule: (appointmentId: number, details: NewAppointmentDetails) => void;
    onCancel: () => void;
}

const dates = ['Thu, May 12', 'Sat, May 14', 'Mon, May 16', 'Tue, May 17', 'Thu, May 19'];
const availableTimes = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];

const BookAppointmentForm: React.FC<BookAppointmentFormProps> = ({ appointmentToReschedule, onBook, onReschedule, onCancel }) => {
    const isEditMode = !!appointmentToReschedule;

    const [consultationType, setConsultationType] = useState<'video' | 'chat'>('video');
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(dates[0]);
    const [selectedTime, setSelectedTime] = useState<string>(availableTimes[0]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isEditMode && appointmentToReschedule) {
            setConsultationType(appointmentToReschedule.notes.toLowerCase().includes('video') ? 'video' : 'chat');
            setSelectedProfessional(PROFESSIONALS_DATA.find(p => p.name === appointmentToReschedule.doctorName) || null);
            setSelectedDate(appointmentToReschedule.date);
            setSelectedTime(appointmentToReschedule.time);
            setNotes(appointmentToReschedule.notes);
        } else {
            setSelectedProfessional(PROFESSIONALS_DATA[0] || null);
        }
    }, [isEditMode, appointmentToReschedule]);


    const handleBookingConfirm = () => {
        if (!selectedProfessional || !selectedDate || !selectedTime) {
            alert('Please select a professional, date, and time.');
            return;
        }

        const details: NewAppointmentDetails = {
            consultationType,
            professional: selectedProfessional,
            date: selectedDate,
            time: selectedTime,
            notes,
        };
        
        if (isEditMode && appointmentToReschedule) {
            onReschedule(appointmentToReschedule.id, details);
        } else {
            onBook(details);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl border border-boticare-gray-medium max-w-4xl mx-auto animate-fade-in dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-2">{isEditMode ? 'Reschedule Appointment' : 'Book a Session'}</h2>
            <p className="text-boticare-gray-dark mb-8 dark:text-gray-400">
                {isEditMode ? 'Select a new time for your appointment.' : 'Choose a professional and a time that works for you.'}
            </p>

            <div className="space-y-8">
                {/* Section 1: Consultation Type */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 dark:text-gray-100">1. Select Consultation Type</h3>
                    <div className="flex items-center space-x-2 bg-boticare-gray p-1 rounded-lg dark:bg-gray-700">
                        <button onClick={() => setConsultationType('video')} className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${consultationType === 'video' ? 'bg-white shadow-sm text-blue-600 dark:bg-gray-600 dark:text-white' : 'text-boticare-gray-dark dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600/50'}`}><VideoIcon className="w-5 h-5" /><span>Video Call</span></button>
                        <button onClick={() => setConsultationType('chat')} className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${consultationType === 'chat' ? 'bg-white shadow-sm text-blue-600 dark:bg-gray-600 dark:text-white' : 'text-boticare-gray-dark dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600/50'}`}><ChatIcon className="w-5 h-5" /><span>Chat Consultation</span></button>
                    </div>
                </section>
                
                {/* Section 2: Select Professional */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 dark:text-gray-100">2. Choose Healthcare Professional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PROFESSIONALS_DATA.map(pro => (
                            <button key={pro.id} onClick={() => setSelectedProfessional(pro)} className={`p-4 rounded-lg border-2 text-left flex items-center space-x-3 transition-colors ${selectedProfessional?.id === pro.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500' : 'border-boticare-gray-medium bg-white hover:border-boticare-gray-dark dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500'}`}>
                                <img src={pro.avatar} alt={pro.name} className="w-12 h-12 rounded-full" />
                                <div>
                                    <p className="font-bold flex items-center">{pro.name} <StarIcon className="w-4 h-4 text-yellow-400 ml-2" /></p>
                                    <p className="text-sm text-boticare-gray-dark dark:text-gray-400">{pro.specialty}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Section 3: Select Date & Time */}
                <section>
                     <h3 className="text-lg font-semibold text-gray-800 mb-3 dark:text-gray-100">3. Select Date & Time</h3>
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Date</p>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {dates.map(date => (
                                <button key={date} onClick={() => setSelectedDate(date)} className={`p-3 rounded-lg border-2 text-center transition-colors ${selectedDate === date ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500' : 'border-boticare-gray-medium hover:border-boticare-gray-dark dark:border-gray-600 dark:hover:border-gray-500'}`}>
                                    <p className="font-semibold text-sm">{date.split(',')[0]}</p>
                                    <p className="text-xs text-boticare-gray-dark dark:text-gray-400">{date.split(',')[1].trim()}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Available Times</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {availableTimes.map(time => (
                                <button key={time} onClick={() => setSelectedTime(time)} className={`p-3 rounded-lg border-2 text-center transition-colors flex items-center justify-center space-x-2 ${selectedTime === time ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500' : 'border-boticare-gray-medium hover:border-boticare-gray-dark dark:border-gray-600 dark:hover:border-gray-500'}`}>
                                    <ClockIcon className="w-4 h-4 text-boticare-gray-dark dark:text-gray-400" />
                                    <p className="font-semibold text-sm">{time}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* Section 4: Notes */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 dark:text-gray-100">4. Reason for Visit (Optional)</h3>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
                            <NotesIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                            id="notes"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any specific details or symptoms for your appointment..."
                            className="w-full bg-boticare-gray rounded-lg border-none pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                        />
                    </div>
                </section>
            </div>

            <div className="flex justify-end items-center space-x-4 pt-6 mt-8 border-t border-boticare-gray-medium dark:border-gray-700">
                <button onClick={onCancel} className="font-semibold text-gray-600 px-6 py-2 rounded-lg hover:bg-boticare-gray transition-colors dark:text-gray-300 dark:hover:bg-gray-700">
                    Cancel
                </button>
                <button
                    onClick={handleBookingConfirm}
                    className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                    <span>{isEditMode ? 'Confirm Reschedule' : 'Book Appointment'}</span>
                </button>
            </div>
        </div>
    );
};

export default BookAppointmentForm;
