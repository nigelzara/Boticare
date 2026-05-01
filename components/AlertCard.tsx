
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
        <div className={`bg-white p-4 rounded-lg border border-boticare-gray-medium border-l-4 ${styles.border} flex flex-row items-center justify-between dark:bg-gray-800 dark:border-gray-700 gap-3`}>
            <div className="flex items-start space-x-3 min-w-0">
                <div className={`p-2 rounded-full ${styles.bg} flex-shrink-0`}>
                    <alert.icon className={`w-5 h-5 md:w-6 md:h-6 ${styles.text}`} />
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm md:text-base truncate">{alert.title}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles.tagBg} ${styles.tagText}`}>
                            {alert.level}
                        </span>
                    </div>
                    <p className="text-xs md:text-sm text-boticare-gray-dark mt-1 line-clamp-2 dark:text-gray-400">{alert.description}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-boticare-gray-dark mt-2 dark:text-gray-500">
                        <ClockIcon className="w-3 h-3" />
                        <span>{alert.time}</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => onTakeAction(alert)} 
                className="bg-blue-600 text-white text-xs md:text-sm font-semibold px-3 py-2 md:px-4 md:py-2 rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 whitespace-nowrap flex-shrink-0"
            >
                Take action
            </button>
        </div>
    );
};

export default AlertCard;
