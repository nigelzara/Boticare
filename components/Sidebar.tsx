
import React from 'react';
import { Page, UserRole } from '../types';
import { DashboardIcon, SettingsIcon, HelpIcon, XIcon, UsersIcon, CalendarIcon, SparklesIcon, StethoscopeIcon, PillIcon } from './Icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onClose?: () => void;
  userRole?: UserRole;
}

const professionalMenuItems = [
    { name: Page.ProfessionalDashboard, icon: DashboardIcon, label: 'Dashboard' },
    { name: Page.PatientList, icon: UsersIcon, label: 'Patient List' },
    { name: Page.PharmacyPatients, icon: PillIcon, label: 'Pharmacy Patients' },
    { name: Page.ProfessionalSchedule, icon: CalendarIcon, label: 'My Schedule' },
    { name: Page.ChatBot, icon: SparklesIcon, label: 'AI Assistant' },
];

const supportItems = [
  { name: Page.Settings, icon: SettingsIcon },
  { name: Page.HelpSupport, icon: HelpIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onClose }) => {
  // Always use professional items for Boticare Pro
  const items = professionalMenuItems;

  return (
    <aside className="w-64 h-full bg-white border-r border-boticare-gray-medium p-6 flex flex-col justify-between dark:bg-gray-800 dark:border-gray-700 overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <StethoscopeIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-boticare-primary dark:text-white">Boticare <span className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded ml-1 align-middle uppercase">Pro</span></h2>
            </div>
            {onClose && (
                <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <XIcon className="w-5 h-5 text-gray-500" />
                </button>
            )}
        </div>

        <p className="text-[10px] text-boticare-gray-dark font-bold uppercase tracking-wider mb-3 dark:text-gray-500">Practice Portal</p>
        <nav className="space-y-1">
          {items.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={activePage === item.name}
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
