
import React, { useState } from 'react';
import { HEALTH_METRICS_DATA, APPOINTMENTS_DATA, MEDICATIONS_DATA, HEALTH_ALERTS_DATA } from '../constants';
import HealthMetricCard from './HealthMetricCard';
import AppointmentCard from './AppointmentCard';
import HealthReportModal from './HealthReportModal';
import DateRangeModal from './DateRangeModal';
import { CalendarIcon, PillIcon, AlertIcon, ShoppingCartIcon, ArrowRightIcon } from './Icons';
import { generateHealthReport } from '../services/geminiService';

const summaryCards = [
    { 
        title: 'Upcoming Appointments', 
        value: '4', 
        icon: CalendarIcon, 
        next: 'Next: 09-06-2025',
        style: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
    },
    { 
        title: 'Medication Alerts', 
        value: '2', 
        icon: PillIcon, 
        next: 'Medication needing refill',
        style: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
    },
    { 
        title: 'Health Alerts', 
        value: '3', 
        icon: AlertIcon, 
        next: 'Unread health notification',
        style: 'bg-gradient-to-br from-teal-400 to-cyan-600 text-white'
    },
    { 
        title: 'Active Orders', 
        value: '5', 
        icon: ShoppingCartIcon, 
        next: 'Pharmacy orders in progress',
        style: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
    },
];

const Dashboard: React.FC = () => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [reportContent, setReportContent] = useState<string>('');
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [reportDateRange, setReportDateRange] = useState<{start: string, end: string} | null>(null);

    const handleDateSelection = (startDate: string, endDate: string) => {
        setReportDateRange({ start: startDate, end: endDate });
        setIsDateModalOpen(false);
        handleGenerateReport(startDate, endDate);
    };

    const handleGenerateReport = async (startDate: string, endDate: string) => {
        setIsReportModalOpen(true);
        setIsReportLoading(true);
        const healthData = {
            metrics: HEALTH_METRICS_DATA,
            alerts: HEALTH_ALERTS_DATA,
            medications: MEDICATIONS_DATA,
            appointments: APPOINTMENTS_DATA.filter(a => a.status === 'Upcoming'),
        };
        const generatedReport = await generateHealthReport(healthData, startDate, endDate);
        setReportContent(generatedReport);
        setIsReportLoading(false);
    };


    return (
        <div className="space-y-8 pb-10">
            <DateRangeModal 
                isOpen={isDateModalOpen}
                onClose={() => setIsDateModalOpen(false)}
                onGenerate={handleDateSelection}
            />
            <HealthReportModal 
                isOpen={isReportModalOpen}
                isLoading={isReportLoading}
                content={reportContent}
                dateRange={reportDateRange}
                onClose={() => setIsReportModalOpen(false)}
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                  <h2 className="text-3xl font-extrabold tracking-tight">Welcome Jane!</h2>
                  <p className="text-boticare-gray-dark dark:text-gray-400">Here's your comprehensive health journey at a glance.</p>
              </div>
              <button 
                onClick={() => setIsDateModalOpen(true)}
                className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Generate Health Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, index) => (
                    <div key={index} className={`p-6 rounded-2xl flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300 ${card.style}`}>
                        <div className="flex justify-between items-start">
                           <p className="font-bold text-sm opacity-90 uppercase tracking-wider">{card.title}</p>
                            <card.icon className="w-6 h-6 opacity-80" />
                        </div>
                        <div className="mt-4">
                            <p className="text-5xl font-black">{card.value}</p>
                            <p className="text-xs mt-2 opacity-80 font-medium">{card.next}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="animate-fade-in [animation-delay:200ms]">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-2xl font-bold tracking-tight">Key Health Metrics</h3>
                    <button className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full dark:text-blue-400">
                        View All <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {HEALTH_METRICS_DATA.map(metric => (
                        <HealthMetricCard key={metric.id} metric={metric} />
                    ))}
                </div>
            </div>

            <div className="animate-fade-in [animation-delay:400ms]">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-2xl font-bold tracking-tight">Upcoming Appointments</h3>
                     <button className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full dark:text-blue-400">
                        View All <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {APPOINTMENTS_DATA.slice(0, 2).map(appointment => (
                         <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
