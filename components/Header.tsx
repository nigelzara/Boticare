
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, AppointmentsIcon, MedicationsIcon, UserIcon, HeartIcon, MenuIcon, BellIcon, CheckCircleIcon } from './Icons';
import { APPOINTMENTS_DATA, MEDICATIONS_DATA, PROFESSIONALS_DATA, HEALTH_METRICS_DATA } from '../constants';
import { UserProfile, Page, BoticareNotification } from '../types';

interface SearchSuggestion {
    type: 'Appointment' | 'Medication' | 'Professional' | 'Metric';
    label: string;
    id: string | number;
    icon: React.ComponentType<{ className?: string }>;
}

interface HeaderProps {
    userProfile: UserProfile;
    onNavigate: (page: Page) => void;
    onToggleSidebar: () => void;
    notifications: BoticareNotification[];
    onMarkNotificationsAsRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ userProfile, onNavigate, onToggleSidebar, notifications, onMarkNotificationsAsRead }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const handler = setTimeout(() => {
            const lowerCaseQuery = query.toLowerCase();
            const appointmentResults = APPOINTMENTS_DATA.filter(item => item.doctorName.toLowerCase().includes(lowerCaseQuery) || item.specialty.toLowerCase().includes(lowerCaseQuery)).map(item => ({ type: 'Appointment' as const, label: `${item.doctorName} (${item.specialty})`, id: item.id, icon: AppointmentsIcon }));
            const medicationResults = MEDICATIONS_DATA.filter(item => item.name.toLowerCase().includes(lowerCaseQuery)).map(item => ({ type: 'Medication' as const, label: `${item.name}`, id: item.id, icon: MedicationsIcon }));
            const professionalResults = PROFESSIONALS_DATA.filter(item => item.name.toLowerCase().includes(lowerCaseQuery) || item.specialty.toLowerCase().includes(lowerCaseQuery)).map(item => ({ type: 'Professional' as const, label: `${item.name} (${item.specialty})`, id: item.id, icon: UserIcon }));
            const metricResults = HEALTH_METRICS_DATA.filter(item => item.name.toLowerCase().includes(lowerCaseQuery)).map(item => ({ type: 'Metric' as const, label: `${item.name}`, id: item.id, icon: HeartIcon }));
            setSuggestions([...appointmentResults, ...metricResults, ...medicationResults, ...professionalResults]);
        }, 300);

        return () => clearTimeout(handler);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) setIsSuggestionsVisible(false);
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setIsNotificationsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        let targetPage = Page.Dashboard;
        switch(suggestion.type) {
            case 'Appointment': targetPage = Page.Appointments; break;
            case 'Medication': targetPage = Page.Medications; break;
            case 'Metric': targetPage = Page.HealthMetrics; break;
            case 'Professional': targetPage = Page.MyDoctors; break;
        }
        onNavigate(targetPage);
        setIsSuggestionsVisible(false);
        setQuery('');
    };

    const handleNotificationsToggle = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
        if (!isNotificationsOpen) { // If opening
            onMarkNotificationsAsRead();
        }
    };

  return (
    <header className="bg-white border-b border-boticare-gray-medium p-3 md:p-4 flex items-center justify-between sticky top-0 z-20 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center space-x-2 md:space-x-4">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" aria-label="Toggle Menu"><MenuIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" /></button>
        <h1 className="text-lg md:text-xl font-bold text-boticare-primary dark:text-white truncate">Boticare</h1>
        <span className="hidden sm:inline-block text-[10px] md:text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md dark:bg-gray-700 dark:text-gray-300 uppercase tracking-tighter">HIPAA</span>
      </div>

      <div className="flex-1 max-w-sm md:max-w-md mx-2 md:mx-4">
        <div className="relative" ref={searchContainerRef}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-4 md:h-5 w-4 md:w-5 text-gray-400" /></div>
          <input type="text" placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setIsSuggestionsVisible(true)} className="w-full bg-boticare-gray rounded-lg border-none pl-9 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 text-sm focus:ring-2 focus:ring-boticare-blue-dark focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400" />
          {isSuggestionsVisible && suggestions.length > 0 && <SearchResults suggestions={suggestions} onSelect={handleSuggestionClick} />}
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
        <div ref={notificationsRef} className="relative">
            <button onClick={handleNotificationsToggle} className="p-2 text-gray-500 hover:text-boticare-primary hover:bg-gray-100 rounded-full transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && <span className="absolute top-0 right-0 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white items-center justify-center font-bold">{unreadCount}</span></span>}
            </button>
            {isNotificationsOpen && <NotificationsPanel notifications={notifications} />}
        </div>
        <div className="flex items-center space-x-2 md:space-x-3">
            <img src={userProfile.avatar} alt={userProfile.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow-sm dark:border-gray-600" />
            <div className="hidden sm:block">
                <p className="font-bold text-xs md:text-sm text-gray-900 dark:text-white leading-tight">{userProfile.name}</p>
                <p className="text-[10px] md:text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Patient</p>
            </div>
        </div>
      </div>
    </header>
  );
};

const SearchResults: React.FC<{ suggestions: SearchSuggestion[], onSelect: (s: SearchSuggestion) => void }> = ({ suggestions, onSelect }) => {
    const grouped = suggestions.reduce((acc, s) => ({...acc, [s.type]: [...(acc[s.type] || []), s]}), {} as Record<string, SearchSuggestion[]>);
    return (
        <div className="absolute top-full mt-2 left-0 right-0 md:w-full bg-white rounded-lg shadow-lg border border-boticare-gray-medium z-30 animate-fade-in dark:bg-gray-800 dark:border-gray-700 overflow-hidden max-h-80 md:max-h-96 overflow-y-auto">
            {Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                    <div className="px-4 py-2 bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wider dark:bg-gray-700/50 dark:text-gray-400">{type}s</div>
                    <ul>{items.map(s => <li key={`${s.type}-${s.id}`}><button onClick={() => onSelect(s)} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-boticare-gray dark:text-gray-300 dark:hover:bg-gray-700"><div className="p-1.5 bg-gray-100 rounded-full dark:bg-gray-600"><s.icon className="w-3.5 h-3.5 text-boticare-gray-dark dark:text-gray-300" /></div><span className="truncate">{s.label}</span></button></li>)}</ul>
                </div>
            ))}
        </div>
    );
};

const NotificationsPanel: React.FC<{notifications: BoticareNotification[]}> = ({ notifications }) => (
    <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 animate-fade-in overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
                notifications.map(n => (
                    <div key={n.id} className={`p-4 border-b border-gray-50 dark:border-gray-700/50 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!n.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                        <div className="mt-1"><CheckCircleIcon className="w-5 h-5 text-green-500" /></div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{n.timestamp}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="p-8 text-center text-sm text-gray-400">No new notifications.</p>
            )}
        </div>
    </div>
);

export default Header;
