
import React, { useState } from 'react';
import { Medication } from '../types';
import { PillIcon, ClockIcon, PenIcon, CheckCircleIcon, XIcon } from './Icons';

interface MedicationCardProps {
  medication: Medication;
  setToastMessage: (message: string) => void;
}

// Helper to convert 12-hour format (e.g., "08:00 AM") to 24-hour for <input type="time">
const timeTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier === 'PM') {
        hours = (parseInt(hours, 10) + 12).toString();
    }

    return `${hours.padStart(2, '0')}:${minutes}`;
};

// Helper to convert 24-hour format from <input type="time"> back to 12-hour
const timeTo12Hour = (time24h: string): string => {
    const [hours24, minutes] = time24h.split(':');
    const hours = parseInt(hours24, 10);
    const modifier = hours >= 12 ? 'PM' : 'AM';
    const popularHours = hours % 12 || 12;
    return `${popularHours}:${minutes} ${modifier}`;
};


const MedicationCard: React.FC<MedicationCardProps> = ({ medication: initialMedication, setToastMessage }) => {
  const [medication, setMedication] = useState(initialMedication);
  const [showAllDoses, setShowAllDoses] = useState(false);
  const [isRefillRequested, setIsRefillRequested] = useState(false);

  const getInitialDoses = () => {
    const dosageAmount = medication.dosage.split('•')[0].trim();
    if (medication.dosage.includes('Once daily')) {
        return [
            { time: 'Tomorrow, 8:00 AM', dosage: dosageAmount },
            { time: 'June 8, 8:00 AM', dosage: dosageAmount },
            { time: 'June 9, 8:00 AM', dosage: dosageAmount },
            { time: 'June 10, 8:00 AM', dosage: dosageAmount },
        ];
    }
    // Default for twice daily
    return [
        { time: 'Today, 9:00 PM', dosage: dosageAmount },
        { time: 'Tomorrow, 9:00 AM', dosage: dosageAmount },
        { time: 'Tomorrow, 9:00 PM', dosage: dosageAmount },
        { time: 'June 8, 9:00 AM', dosage: dosageAmount },
    ];
  };

  const [upcomingDoses, setUpcomingDoses] = useState(getInitialDoses);
  const [editingDoseIndex, setEditingDoseIndex] = useState<number | null>(null);
  const [editedDose, setEditedDose] = useState<{ dosage: string; time: string } | null>(null);
  
  const handleTakeNow = () => {
    setMedication(prev => ({ ...prev, isTaken: true }));
  };

  const handleRequestRefill = () => {
    setToastMessage(`Refill requested for ${medication.name}!`);
    setIsRefillRequested(true);
  };

  const handleStartEdit = (index: number) => {
    const doseToEdit = upcomingDoses[index];
    const timeParts = doseToEdit.time.split(', ');
    const time12h = timeParts.length > 1 ? timeParts[1] : timeParts[0];

    setEditingDoseIndex(index);
    setEditedDose({
        dosage: doseToEdit.dosage,
        time: timeTo24Hour(time12h),
    });
  };

  const handleCancelEdit = () => {
      setEditingDoseIndex(null);
      setEditedDose(null);
  };

  const handleSaveEdit = () => {
    if (editingDoseIndex === null || !editedDose) return;

    const newDoses = [...upcomingDoses];
    const originalDose = newDoses[editingDoseIndex];
    const datePart = originalDose.time.includes(',') ? originalDose.time.split(', ')[0] + ', ' : '';
    
    newDoses[editingDoseIndex] = {
        dosage: editedDose.dosage,
        time: datePart + timeTo12Hour(editedDose.time)
    };
    
    setUpcomingDoses(newDoses);
    setToastMessage("Upcoming dose has been updated!");
    handleCancelEdit();
  };

  
  return (
    <div className="bg-white p-5 rounded-xl border border-boticare-gray-medium flex flex-col space-y-4 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-boticare-blue rounded-full dark:bg-blue-900/50">
          <PillIcon className="w-5 h-5 text-boticare-blue-dark dark:text-blue-300" />
        </div>
        <div>
          <p className="font-bold">{medication.name}</p>
          <p className="text-sm text-boticare-gray-dark dark:text-gray-400">{medication.dosage}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="font-medium">Medication left</span>
          <span className="font-semibold">{medication.percentageLeft}%</span>
        </div>
        <div className="w-full bg-boticare-gray rounded-full h-2 dark:bg-gray-700">
          <div
            className={`h-2 rounded-full ${medication.percentageLeft < 30 ? 'bg-red-500' : 'bg-blue-500 dark:bg-blue-500'}`}
            style={{ width: `${medication.percentageLeft}%` }}
          ></div>
        </div>
        {medication.refillNeeded && <p className="text-xs text-red-500 mt-1 dark:text-red-400">{medication.refillNeeded}</p>}
      </div>

      <div className="flex justify-between items-center border-t border-boticare-gray-medium py-3 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-[10px] text-boticare-gray-dark dark:text-gray-400">
          <ClockIcon className="w-4 h-4" />
          <span className="whitespace-nowrap">{medication.nextDose}</span>
        </div>
        <div className="flex items-center space-x-2">
            {medication.refillNeeded && (
                isRefillRequested ? (
                    <button className="bg-gray-300 text-gray-500 text-xs font-semibold px-2 py-1.5 rounded-lg cursor-not-allowed dark:bg-gray-600 dark:text-gray-400 whitespace-nowrap">
                        Refill Requested
                    </button>
                ) : (
                    <button onClick={handleRequestRefill} className="bg-boticare-yellow-dark text-white text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-opacity-90 transition-colors dark:bg-yellow-600 dark:hover:bg-yellow-700 whitespace-nowrap">
                        Request Refill
                    </button>
                )
            )}
            {medication.isTaken ? (
              <span className="text-xs font-semibold text-boticare-green-dark bg-boticare-green px-3 py-1 rounded-md dark:bg-green-900/50 dark:text-green-300">Taken</span>
            ) : (
              <button onClick={handleTakeNow} className="bg-blue-600 text-white text-xs font-semibold px-2 py-1.5 rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap">
                Take now
              </button>
            )}
        </div>
      </div>

      {showAllDoses && (
        <div className="space-y-3 animate-fade-in">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Upcoming Doses</h4>
            <ul className="space-y-2 text-sm text-boticare-gray-dark dark:text-gray-400">
                {upcomingDoses.map((dose, index) => (
                    <li key={index} className="flex items-center justify-between group p-1 -m-1 rounded-md hover:bg-boticare-gray dark:hover:bg-gray-700/50">
                        {editingDoseIndex === index && editedDose ? (
                            <div className="flex items-center space-x-2 w-full">
                                <ClockIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={editedDose.dosage}
                                    onChange={(e) => setEditedDose({...editedDose, dosage: e.target.value})}
                                    className="w-20 bg-white dark:bg-gray-700 border border-boticare-gray-medium dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                />
                                <span className="text-gray-500">-</span>
                                <span className="font-medium whitespace-nowrap">{dose.time.includes(',') ? dose.time.split(', ')[0] + ',' : ''}</span>
                                <input
                                    type="time"
                                    value={editedDose.time}
                                    onChange={(e) => setEditedDose({...editedDose, time: e.target.value})}
                                    className="bg-white dark:bg-gray-700 border border-boticare-gray-medium dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                />
                                <button onClick={handleSaveEdit} className="p-1 text-green-500 hover:text-green-700 dark:hover:text-green-400"><CheckCircleIcon className="w-5 h-5" /></button>
                                <button onClick={handleCancelEdit} className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"><XIcon className="w-5 h-5" /></button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center space-x-2">
                                    <ClockIcon className="w-4 h-4 flex-shrink-0" />
                                    <span><strong>{dose.dosage}</strong> - {dose.time}</span>
                                </div>
                                <button onClick={() => handleStartEdit(index)} className="opacity-0 group-hover:opacity-100 text-boticare-gray-dark hover:text-blue-600 p-1 dark:text-gray-500 dark:hover:text-gray-300" aria-label="Edit dose">
                                    <PenIcon className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
      )}
      
      <button 
        onClick={() => setShowAllDoses(!showAllDoses)}
        className="text-center text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
      >
        {showAllDoses ? 'Hide doses' : 'Show all doses'}
      </button>
    </div>
  );
};

export default MedicationCard;
