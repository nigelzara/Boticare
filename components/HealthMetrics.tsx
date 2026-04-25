
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
        setActivePage(Page.ScheduleAppointment);
    }
  };

  const handleAddSymptom = (newSymptom: Omit<Symptom, 'id'>) => {
      const symptom: Symptom = { ...newSymptom, id: Date.now().toString() };
      setSymptoms([symptom, ...symptoms]);
      setToastMessage('Symptom logged successfully');
  };

  return (
    <div className="space-y-6">
      {toastMessage && <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />}
      <MedicationReminderModal alert={reminderModalAlert} onClose={() => setReminderModalAlert(null)} onConfirm={() => {
              setReminderModalAlert(null);
              setToastMessage(`Reminder updated!`);
          }}
      />
      {isLogSymptomOpen && <LogSymptomModal onClose={() => setIsLogSymptomOpen(false)} onSave={handleAddSymptom} />}
      
      <div className="flex flex-row justify-between items-center px-1">
        <div>
            <h2 className="text-2xl font-black">Health Metrics</h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Deep dive into vital signs and clinical logs.</p>
        </div>
        <button 
            onClick={() => setIsLogSymptomOpen(true)}
            className="bg-boticare-primary text-white font-black uppercase tracking-widest text-[9px] md:text-xs px-2.5 py-2 md:px-4 rounded-xl flex items-center gap-1 hover:bg-opacity-90 transition-all dark:bg-blue-600 shadow-md active:scale-95 whitespace-nowrap"
        >
            <PlusIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>Log Symptom</span>
        </button>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 animate-fade-in shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-gray-400">Analytics Overview</h3>
            <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-xl">
                <button className="px-2.5 py-1 text-[9px] md:text-[10px] font-black uppercase rounded-lg bg-white dark:bg-gray-700 shadow-sm dark:text-white">7D</button>
                <button className="px-2.5 py-1 text-[9px] md:text-[10px] font-black uppercase rounded-lg text-gray-400">30D</button>
            </div>
        </div>
        {selectedMetric && <MetricChart data={selectedMetric.history} color="#3B82F6" label={selectedMetric.name} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {HEALTH_METRICS_DATA.map(metric => (
            <div key={metric.id} onClick={() => setSelectedMetricId(metric.id)} className={`cursor-pointer transition-all duration-200 rounded-3xl ${selectedMetricId === metric.id ? 'ring-2 ring-blue-500 shadow-lg scale-[1.01]' : 'hover:scale-[1.005]'}`}>
                <HealthMetricCard metric={metric} />
            </div>
          ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <div className="space-y-4">
            <h3 className="text-lg font-black px-1">Health Alerts</h3>
            {HEALTH_ALERTS_DATA.map(alert => <AlertCard key={alert.id} alert={alert} onTakeAction={handleTakeAction} />)}
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-black px-1">Recent Symptoms</h3>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                {symptoms.length > 0 ? (
                    <ul className="divide-y divide-gray-50 dark:divide-gray-700">
                        {symptoms.map(symptom => (
                            <li key={symptom.id} className="p-4 md:p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-xs md:text-sm">{symptom.name}</h4>
                                    <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">{symptom.date}</span>
                                </div>
                                <span className={`text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-lg uppercase inline-block mb-2 ${
                                         symptom.severity === 'Severe' ? 'bg-red-50 text-red-600' :
                                         symptom.severity === 'Moderate' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                                     }`}>
                                         {symptom.severity}
                                     </span>
                                <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{symptom.description}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-10 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest">No logs available</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMetrics;
