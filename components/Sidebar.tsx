
import React from 'react';
import { Page } from '../types';
import { DashboardIcon, HealthMetricsIcon, MedicationsIcon, AppointmentsIcon, ChatIcon, SettingsIcon, HelpIcon, XIcon, SparklesIcon } from './Icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onClose?: () => void;
}

const patientMenuItems = [
  { name: Page.Dashboard, icon: DashboardIcon, label: 'Dashboard' },
  { name: Page.HealthMetrics, icon: HealthMetricsIcon, label: 'Health Metrics' },
  { name: Page.Medications, icon: MedicationsIcon, label: 'Medications' },
  { name: Page.Appointments, icon: AppointmentsIcon, label: 'Appointments' },
  { name: Page.MyDoctors, icon: ChatIcon, label: 'Messages' },
  { name: Page.ChatBot, icon: SparklesIcon, label: 'AI Assistant' },
];

const supportItems = [
  { name: Page.Settings, icon: SettingsIcon },
  { name: Page.HelpSupport, icon: HelpIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onClose }) => {
  return (
    <aside className="w-64 h-full bg-white border-r border-boticare-gray-medium p-6 flex flex-col justify-between dark:bg-gray-800 dark:border-gray-700 overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-boticare-primary dark:text-white">Boticare</h2>
            {onClose && (
                <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <XIcon className="w-5 h-5 text-gray-500" />
                </button>
            )}
        </div>

        <p className="text-[10px] text-boticare-gray-dark font-bold uppercase tracking-wider mb-3 dark:text-gray-500">Patient Portal</p>
        <nav className="space-y-1">
          {patientMenuItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={activePage === item.name || (item.name === Page.Appointments && activePage === Page.ScheduleAppointment)}
              onClick={() => setActivePage(item.name)}
            />
          ))}
        </nav>
      </div>

      <div className="mt-8">
        <p className="text-[10px] text-boticare-gray-dark font-bold uppercase tracking-wider mb-3 dark:text-gray-500">Preferences</p>
        <nav className="space-y-1">
          {supportItems.map((item) => (
            <SidebarItem
              key={item.name}
              icon={item.icon}
              label={item.name}
              isActive={activePage === item.name}
              onClick={() => setActivePage(item.name)}
            />
          ))}
        </nav>
        
        <div className="mt-8 p-4 bg-boticare-blue/30 dark:bg-blue-900/20 rounded-xl border border-boticare-blue dark:border-blue-800/50">
            <p className="text-xs font-bold text-boticare-blue-dark dark:text-blue-300 mb-1">Emergency Help</p>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-3">Instant connection to our 24/7 care team.</p>
            <button className="w-full py-1.5 bg-boticare-blue-dark text-white text-[10px] font-bold rounded-lg hover:bg-blue-600 transition-colors">
                Call Now
            </button>
        </div>
      </div>
    </aside>
  );
};

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-boticare-blue text-boticare-blue-dark dark:bg-blue-900/50 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-800'
          : 'text-boticare-gray-dark hover:bg-boticare-gray dark:text-gray-400 dark:hover:bg-gray-700 hover:translate-x-1'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
      <span className="font-semibold text-sm">{label}</span>
    </a>
  );
};

export default Sidebar;
