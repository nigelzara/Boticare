
import React, { useState } from 'react';
import { HEALTH_METRICS_DATA, HEALTH_ALERTS_DATA } from '../constants';
import HealthMetricCard from './HealthMetricCard';
import AlertCard from './AlertCard';
import MetricChart from './MetricChart';
import { PlusIcon } from './Icons';
import { HealthAlert, Page, Symptom } from '../types';
import MedicationReminderModal from './MedicationReminderModal';
import LogSymptomModal from './LogSymptomModal';
import Toast from './Toast';

interface HealthMetricsProps {
  setActivePage: (page: Page) => void;
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ setActivePage }) => {
  const [reminderModalAlert, setReminderModalAlert] = useState<HealthAlert | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedMetricId, setSelectedMetricId] = useState<string>(HEALTH_METRICS_DATA[0].id);
  const [isLogSymptomOpen, setIsLogSymptomOpen] = useState(false);
  const [symptoms, setSymptoms] = useState<Symptom[]>([
      { id: '1', name: 'Mild Headache', date: '2025-06-01', severity: 'Mild', description: 'Started in the afternoon after work.' }
  ]);

  const selectedMetric = HEALTH_METRICS_DATA.find(m => m.id === selectedMetricId);

  const handleTakeAction = (alert: HealthAlert) => {
    if (alert.title === 'Missed Medication') {
        setReminderModalAlert(alert);
    } else {
        // For 'Elevated Blood Glucose' and 'Upcoming Appointment'
        setActivePage(Page.ScheduleAppointment);
    }
  };

  const handleAddSymptom = (newSymptom: Omit<Symptom, 'id'>) => {
      const symptom: Symptom = {
          ...newSymptom,
          id: Date.now().toString()
      };
      setSymptoms([symptom, ...symptoms]);
      setToastMessage('Symptom logged successfully');
  };

  return (
    <div className="space-y-8">
      {toastMessage && <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />}
      <MedicationReminderModal
          alert={reminderModalAlert}
          onClose={() => setReminderModalAlert(null)}
          onConfirm={(newDate, newTime) => {
              setReminderModalAlert(null);
              setToastMessage(`Reminder set for ${newDate} at ${newTime}!`);
              setTimeout(() => setToastMessage(null), 3000);
          }}
      />
      {isLogSymptomOpen && (
          <LogSymptomModal 
            onClose={() => setIsLogSymptomOpen(false)}
            onSave={handleAddSymptom}
          />
      )}
      
      <div className="flex flex-row justify-between items-center md:items-end">
        <div>
            <h2 className="text-xl md:text-2xl font-bold">Health Metrics</h2>
            <p className="text-xs md:text-base text-boticare-gray-dark dark:text-gray-400">Track and analyze your vital signs.</p>
        </div>
        <button 
            onClick={() => setIsLogSymptomOpen(true)}
            className="bg-blue-600 text-white font-semibold px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center space-x-1 md:space-x-2 hover:bg-blue-700 transition-colors whitespace-nowrap dark:bg-blue-600 dark:hover:bg-blue-700"
        >
            <PlusIcon className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Log Symptom</span>
        </button>
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-xl border border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h3 className="text-lg font-bold">Analytics Overview</h3>
            <div className="flex space-x-2 mt-2 md:mt-0">
                <button className="px-3 py-1 text-sm rounded-full bg-blue-600 text-white dark:bg-blue-600">7 Days</button>
                <button className="px-3 py-1 text-sm rounded-full bg-boticare-gray text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300">30 Days</button>
            </div>
        </div>
        {selectedMetric && (
            <MetricChart 
                data={selectedMetric.history} 
                color="#3B82F6" 
                label={selectedMetric.name} 
            />
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Key Metrics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HEALTH_METRICS_DATA.map(metric => (
            <div 
                key={metric.id} 
                onClick={() => setSelectedMetricId(metric.id)}
                className={`cursor-pointer transition-all duration-200 rounded-xl ${selectedMetricId === metric.id ? 'ring-2 ring-blue-600 shadow-lg scale-[1.02]' : 'hover:shadow-md'}`}
            >
                <HealthMetricCard metric={metric} />
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
            <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Health Alerts</h3>
            </div>
            <div className="space-y-4">
            {HEALTH_ALERTS_DATA.map(alert => (
                <AlertCard key={alert.id} alert={alert} onTakeAction={handleTakeAction} />
            ))}
            </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Recent Symptoms</h3>
            </div>
            <div className="bg-white rounded-xl border border-boticare-gray-medium overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                {symptoms.length > 0 ? (
                    <ul className="divide-y divide-boticare-gray-medium dark:divide-gray-700">
                        {symptoms.map(symptom => (
                            <li key={symptom.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-100">{symptom.name}</h4>
                                    <span className="text-xs text-boticare-gray-dark dark:text-gray-400">{symptom.date}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                         symptom.severity === 'Severe' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                         symptom.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                         'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                     }`}>
                                         {symptom.severity}
                                     </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{symptom.description}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center text-boticare-gray-dark dark:text-gray-400">
                        No symptoms logged recently.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMetrics;
