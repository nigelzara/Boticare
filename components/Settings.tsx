
import React, { useState, useRef, useEffect } from 'react';
import { UserIcon, AlertIcon, LockClosedIcon, HeartIcon, ChevronRightIcon, BackIcon, PenIcon, StethoscopeIcon, ClockIcon, BriefcaseIcon, PlusIcon, XIcon, TrashIcon } from './Icons';
import AlertPreferences from './AlertPreferences';
import Toast from './Toast';
import { AlertLevel, UserProfile, ProfessionalTitle, AvailabilitySlot } from '../types';
import { supabase } from '../services/supabaseClient';
import { getProfessionalAvailability, saveProfessionalAvailability } from '../services/geminiService';

type SettingView = 'main' | 'profile' | 'notifications' | 'account' | 'health' | 'practice' | 'availability';

const patientSettingItems = [
    { id: 'profile', icon: UserIcon, title: 'Profile Settings', description: 'Manage your personal information' },
    { id: 'notifications', icon: AlertIcon, title: 'Notification Settings', description: 'Customize your alert preferences' },
    { id: 'account', icon: LockClosedIcon, title: 'Account Settings', description: 'Manage password and security' },
    { id: 'health', icon: HeartIcon, title: 'Health Details', description: 'Update your health profile' },
] as const;

const professionalSettingItems = [
    { id: 'profile', icon: UserIcon, title: 'Profile Settings', description: 'Manage your professional info' },
    { id: 'practice', icon: BriefcaseIcon, title: 'Practice Details', description: 'Manage title, credentials & specialty' },
    { id: 'availability', icon: ClockIcon, title: 'Availability Settings', description: 'Set your working hours & schedule' },
    { id: 'notifications', icon: AlertIcon, title: 'Notification Settings', description: 'Customize your alert preferences' },
    { id: 'account', icon: LockClosedIcon, title: 'Account Settings', description: 'Security and account management' },
] as const;

const MainSettingsView: React.FC<{ setView: (view: SettingView) => void, isProfessional: boolean }> = ({ setView, isProfessional }) => {
    const items = isProfessional ? professionalSettingItems : patientSettingItems;
    return (
        <div className="space-y-4">
            {items.map(item => (
                <button key={item.id} onClick={() => setView(item.id)} className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-boticare-gray-medium hover:bg-boticare-gray hover:border-boticare-gray-dark transition-all dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-boticare-blue rounded-lg dark:bg-blue-900/50">
                            <item.icon className="w-5 h-5 text-boticare-blue-dark dark:text-blue-300" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-900 dark:text-gray-100">{item.title}</p>
                            <p className="text-xs text-boticare-gray-dark dark:text-gray-400">{item.description}</p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-boticare-gray-dark dark:text-gray-400" />
                </button>
            ))}
        </div>
    );
};

const ToggleSwitch: React.FC<{ enabled: boolean, onChange: (enabled: boolean) => void, id?: string }> = ({ enabled, onChange, id }) => (
    <label htmlFor={id} className="relative cursor-pointer">
      <input type="checkbox" id={id} className="sr-only" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
      <div className={`block w-14 h-8 rounded-full transition ${enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${enabled ? 'translate-x-6' : ''}`}></div>
    </label>
);

interface ProfileSettingsProps { 
    profile: UserProfile; 
    onSave: (p: UserProfile) => void; 
    isDarkMode: boolean; 
    setIsDarkMode: (d: boolean) => void; 
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSave, isDarkMode, setIsDarkMode }) => {
    const [localProfile, setLocalProfile] = useState(profile);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setLocalProfile({ ...localProfile, avatar: reader.result as string });
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0 group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 dark:text-gray-300">Profile Picture</label>
                    <div className="relative w-32 h-32">
                         <img src={localProfile.avatar} alt="Profile" className="w-32 h-32 rounded-2xl object-cover border-2 border-gray-100 dark:border-gray-600 shadow-md" />
                         <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-2xl"><PenIcon className="w-6 h-6 text-white" /></button>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                    </div>
                </div>
                 <div className="flex-grow w-full space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Display Name</label>
                        <input type="text" value={localProfile.name} onChange={e => setLocalProfile({...localProfile, name: e.target.value})} className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 focus:ring-2 focus:ring-boticare-blue-dark dark:bg-gray-700 dark:text-gray-200" />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Contact Number</label>
                        <input type="tel" value={localProfile.phone} onChange={e => setLocalProfile({...localProfile, phone: e.target.value})} className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 focus:ring-2 focus:ring-boticare-blue-dark dark:bg-gray-700 dark:text-gray-200" />
                    </div>
                 </div>
            </div>
             <div className="pt-4 border-t border-boticare-gray-medium dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4">Display Mode</h3>
                <div className="flex items-center justify-between p-4 bg-boticare-gray rounded-xl dark:bg-gray-700">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Dark Interface</span>
                    <ToggleSwitch enabled={isDarkMode} onChange={setIsDarkMode} id="darkModeToggle" />
                </div>
            </div>
            <div className="flex justify-end pt-4"><button onClick={() => onSave(localProfile)} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg dark:shadow-none">Save Changes</button></div>
        </div>
    );
};

interface PracticeDetailsProps {
    profile: UserProfile;
    onSave: (p: UserProfile) => void;
}

const PracticeDetails: React.FC<PracticeDetailsProps> = ({ profile, onSave }) => {
    const [localProfile, setLocalProfile] = useState(profile);
    const currentTitle = localProfile.professionalTitle || 'Doctor';

    return (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold mb-2">Practice Credentials</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Primary Title</label>
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl w-fit">
                        <button 
                            onClick={() => setLocalProfile({...localProfile, professionalTitle: 'Doctor'})} 
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currentTitle === 'Doctor' ? 'bg-white shadow-sm text-blue-600 dark:bg-gray-600 dark:text-white' : 'text-gray-500'}`}
                        >
                            Doctor
                        </button>
                        <button 
                            onClick={() => setLocalProfile({...localProfile, professionalTitle: 'Pharmacist'})} 
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currentTitle === 'Pharmacist' ? 'bg-white shadow-sm text-blue-600 dark:bg-gray-600 dark:text-white' : 'text-gray-500'}`}
                        >
                            Pharmacist
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Medical Specialty</label>
                    <input type="text" value={localProfile.specialty || ''} onChange={e => setLocalProfile({...localProfile, specialty: e.target.value})} className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 dark:bg-gray-700 dark:text-gray-200" placeholder="e.g., Cardiology, General Practice" />
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                    <p className="text-xs text-blue-600 dark:text-blue-300"><strong>Note:</strong> Your title will be displayed to patients across all consultations and chat sessions.</p>
                </div>
                <div className="flex justify-end pt-4"><button onClick={() => onSave(localProfile)} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 shadow-lg">Update Records</button></div>
            </div>
        </div>
    );
};

interface AvailabilitySettingsProps {
    userProfile: UserProfile;
    onSave: (message: string, type: 'success') => void;
}

interface TimeSlot {
    start: string;
    end: string;
}

interface DaySchedule {
    isEnabled: boolean;
    slots: TimeSlot[];
}

const AvailabilitySettings: React.FC<AvailabilitySettingsProps> = ({ userProfile, onSave }) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!userProfile.supabaseId) return;
            
            setIsLoading(true);
            const fetchedSlots = await getProfessionalAvailability(userProfile.supabaseId);
            const initialSchedule: Record<string, DaySchedule> = {};
            
            daysOfWeek.forEach(day => {
                const daySlots = fetchedSlots.filter(s => s.dayOfWeek === day);
                if (daySlots.length > 0) {
                    initialSchedule[day] = {
                        isEnabled: true,
                        slots: daySlots.map(s => ({ start: s.startTime, end: s.endTime }))
                    };
                } else {
                    initialSchedule[day] = {
                        isEnabled: false,
                        slots: [{ start: '09:00', end: '17:00' }] // Default slot if enabled
                    };
                }
            });
            
            setSchedule(initialSchedule);
            setIsLoading(false);
        };
        fetchAvailability();
    }, [userProfile.supabaseId]);

    const handleToggleDay = (day: string, enabled: boolean) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], isEnabled: enabled }
        }));
    };

    const handleTimeChange = (day: string, index: number, field: 'start' | 'end', value: string) => {
        const newSlots = [...schedule[day].slots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], slots: newSlots }
        }));
    };

    const handleAddSlot = (day: string) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], slots: [...prev[day].slots, { start: '13:00', end: '17:00' }] }
        }));
    };

    const handleRemoveSlot = (day: string, index: number) => {
        const newSlots = schedule[day].slots.filter((_, i) => i !== index);
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], slots: newSlots }
        }));
    };

    const handleSaveAvailability = async () => {
        if (!userProfile.supabaseId) return;

        setIsLoading(true);
        const slotsToSave: AvailabilitySlot[] = [];
        
        Object.entries(schedule).forEach(([day, data]) => {
            if (data.isEnabled) {
                data.slots.forEach(slot => {
                    slotsToSave.push({
                        dayOfWeek: day,
                        startTime: slot.start,
                        endTime: slot.end
                    });
                });
            }
        });

        const success = await saveProfessionalAvailability(userProfile.supabaseId, slotsToSave);
        if (success) {
            onSave("Your practice hours have been updated.", 'success');
        } else {
            onSave("Failed to update availability. Please try again.", 'success');
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Consultation Availability</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Set the hours when patients can book sessions with you.</p>
                </div>
            </div>

            <div className="p-6 border border-boticare-gray-medium rounded-2xl dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 font-bold text-gray-500 uppercase tracking-widest text-[10px]">Loading Schedule...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {daysOfWeek.map(day => (
                            <div key={day} className="flex flex-col md:flex-row items-start justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                                <div className="flex items-center space-x-4 mb-3 md:mb-0 min-w-[150px] pt-2">
                                    <ToggleSwitch
                                        id={`toggle-${day}`}
                                        enabled={schedule[day]?.isEnabled || false}
                                        onChange={(enabled) => handleToggleDay(day, enabled)}
                                    />
                                    <span className={`font-bold transition-colors ${schedule[day]?.isEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{day}</span>
                                </div>
                                
                                {schedule[day]?.isEnabled ? (
                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                        {schedule[day].slots.map((slot, index) => (
                                            <div key={index} className="flex items-center space-x-2 animate-fade-in">
                                                <input
                                                    type="time"
                                                    value={slot.start}
                                                    onChange={(e) => handleTimeChange(day, index, 'start', e.target.value)}
                                                    className="bg-boticare-gray dark:bg-gray-700 border-none rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 dark:text-white w-28"
                                                />
                                                <span className="text-gray-400 font-bold text-xs">to</span>
                                                <input
                                                    type="time"
                                                    value={slot.end}
                                                    onChange={(e) => handleTimeChange(day, index, 'end', e.target.value)}
                                                    className="bg-boticare-gray dark:bg-gray-700 border-none rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 dark:text-white w-28"
                                                />
                                                {schedule[day].slots.length > 1 && (
                                                    <button onClick={() => handleRemoveSlot(day, index)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {index === schedule[day].slots.length - 1 && (
                                                    <button onClick={() => handleAddSlot(day)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors" title="Add another slot">
                                                        <PlusIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs font-black uppercase text-gray-300 dark:text-gray-600 tracking-widest italic pt-2">Closed</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSaveAvailability}
                    disabled={isLoading}
                    className="bg-blue-600 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : 'Sync Schedule'}
                </button>
            </div>
        </div>
    );
};

const AccountSettings: React.FC = () => {
    const handleSignOut = async () => await (supabase!.auth as any).signOut();
    return (
        <div className="space-y-6 animate-fade-in">
            <button onClick={handleSignOut} className="w-full bg-red-50 text-red-600 font-bold px-4 py-4 rounded-xl hover:bg-red-100 transition-colors border border-red-100 dark:bg-red-900/20 dark:border-red-500/30">Sign Out of Session</button>
            <div className="p-6 border border-gray-100 rounded-xl dark:border-gray-700">
                <h3 className="font-bold mb-4">Security</h3>
                <input type="password" placeholder="New Password" className="w-full bg-gray-50 rounded-xl border-none p-3 mb-3 dark:bg-gray-700" />
                <button className="text-sm font-bold text-blue-600">Update Password</button>
            </div>
        </div>
    );
};

interface SettingsProps {
    userProfile: UserProfile;
    onProfileUpdate: (p: UserProfile) => void;
    isDarkMode: boolean;
    setIsDarkMode: (d: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ userProfile, onProfileUpdate, isDarkMode, setIsDarkMode }) => {
    const [activeView, setActiveView] = useState<SettingView>('main');
    const [toast, setToast] = useState<{message: string, type: 'success'} | null>(null);
    const isProfessional = userProfile.role === 'professional';

    const handleSaveProfile = (updated: UserProfile) => { 
        onProfileUpdate(updated); 
        setToast({message: "Profile updated successfully", type: 'success'}); 
        setActiveView('main');
    };
    
    const handleSaveAvailabilityToast = (message: string, type: 'success') => {
        setToast({ message, type });
        setActiveView('main');
    };

    const renderView = () => {
        switch (activeView) {
            case 'profile': return <ProfileSettings profile={userProfile} onSave={handleSaveProfile} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
            case 'practice': return <PracticeDetails profile={userProfile} onSave={handleSaveProfile} />;
            case 'availability': return <AvailabilitySettings userProfile={userProfile} onSave={handleSaveAvailabilityToast} />;
            case 'account': return <AccountSettings />;
            case 'notifications': return <AlertPreferences alertLevels={{[AlertLevel.High]: true, [AlertLevel.Low]: false, [AlertLevel.Medium]: true}} appointmentReminders={{remind24h: true, remind1h: true}} onLevelChange={()=>{}} onReminderChange={()=>{}} onSaveChanges={()=>{}} onReset={()=>{}} />;
            default: return <MainSettingsView setView={setActiveView} isProfessional={isProfessional} />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex items-center mb-8">
                {activeView !== 'main' && (<button onClick={() => setActiveView('main')} className="p-2 bg-white dark:bg-gray-800 rounded-xl mr-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:translate-x-[-2px] transition-transform"><BackIcon className="w-5 h-5 text-gray-500" /></button>)}
                <h2 className="text-3xl font-black tracking-tight">{activeView === 'main' ? 'Settings' : 'Manage ' + activeView.charAt(0).toUpperCase() + activeView.slice(1).replace('settings', ' Settings')}</h2>
            </div>
            <div className="bg-white p-6 md:p-10 rounded-3xl border border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700 shadow-xl shadow-gray-100 dark:shadow-none">{renderView()}</div>
        </div>
    );
};

export default Settings;
