
import React from 'react';
import { HealthAlert, AlertLevel } from '../types';
import { ClockIcon } from './Icons';

interface AlertCardProps {
  alert: HealthAlert;
  onTakeAction: (alert: HealthAlert) => void;
}

const levelStyles = {
    [AlertLevel.High]: { border: 'border-l-red-500', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', tagBg: 'bg-boticare-red dark:bg-red-900/50', tagText: 'text-boticare-red-dark dark:text-red-300' },
    [AlertLevel.Medium]: { border: 'border-l-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', tagBg: 'bg-boticare-yellow dark:bg-yellow-900/50', tagText: 'text-boticare-yellow-dark dark:text-yellow-300' },
    [AlertLevel.Low]: { border: 'border-l-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', tagBg: 'bg-boticare-blue dark:bg-blue-900/50', tagText: 'text-boticare-blue-dark dark:text-blue-300' },
};

const AlertCard: React.FC<AlertCardProps> = ({ alert, onTakeAction }) => {
    const styles = levelStyles[alert.level];

    return (
        <div className={`bg-white p-3 md:p-4 rounded-xl border border-gray-100 border-l-4 ${styles.border} flex flex-row items-center justify-between dark:bg-gray-800 dark:border-gray-700 gap-2 shadow-sm hover:shadow-md transition-all`}>
            <div className="flex items-start space-x-2 md:space-x-3 min-w-0">
                <div className={`p-2 rounded-xl ${styles.bg} flex-shrink-0`}>
                    <alert.icon className={`w-5 h-5 md:w-6 md:h-6 ${styles.text}`} />
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1 md:gap-2">
                        <h4 className="font-bold text-[11px] md:text-sm truncate leading-tight">{alert.title}</h4>
                        <span className={`text-[7px] md:text-[9px] font-black uppercase px-1.5 py-0.5 rounded-lg ${styles.tagBg} ${styles.tagText}`}>
                            {alert.level}
                        </span>
                    </div>
                    <p className="text-[9px] md:text-xs text-gray-500 mt-1 line-clamp-1 dark:text-gray-400">{alert.description}</p>
                    <div className="flex items-center space-x-1 text-[8px] md:text-[9px] text-gray-400 mt-0.5 dark:text-gray-500 font-bold">
                        <ClockIcon className="w-2.5 h-2.5" />
                        <span>{alert.time}</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => onTakeAction(alert)} 
                className="bg-boticare-primary text-[9px] md:text-xs text-white font-black uppercase tracking-widest px-2.5 py-2 md:px-4 rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap flex-shrink-0 transition-transform active:scale-95 shadow-sm"
            >
                Action
            </button>
        </div>
    );
};

export default AlertCard;
