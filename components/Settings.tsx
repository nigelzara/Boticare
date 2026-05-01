
import React, { useState, useRef } from 'react';
import { UserIcon, AlertIcon, LockClosedIcon, HeartIcon, ChevronRightIcon, BackIcon, PenIcon } from './Icons';
import AlertPreferences from './AlertPreferences';
import Toast from './Toast';
import { AlertLevel, UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';

type SettingView = 'main' | 'profile' | 'notifications' | 'account' | 'health';

const patientSettingItems = [
    { id: 'profile', icon: UserIcon, title: 'Profile Settings', description: 'Manage your personal information' },
    { id: 'notifications', icon: AlertIcon, title: 'Notification Settings', description: 'Customize your alert preferences' },
    { id: 'account', icon: LockClosedIcon, title: 'Account Settings', description: 'Manage password and security' },
    { id: 'health', icon: HeartIcon, title: 'Health Details', description: 'Update your health profile' },
] as const;

const MainSettingsView: React.FC<{ setView: (view: SettingView) => void }> = ({ setView }) => {
    return (
        <div className="space-y-4">
            {patientSettingItems.map(item => (
                <button key={item.id} onClick={() => setView(item.id)} className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-boticare-gray-medium hover:bg-boticare-gray hover:border-boticare-gray-dark transition-all dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/50">
                            <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
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
      <div className={`block w-14 h-8 rounded-full transition ${enabled ? 'bg-blue-600' : 'bg-boticare-gray-medium dark:bg-gray-600'}`}></div>
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
        <div className="space-y-6">
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
                        <input type="text" value={localProfile.name} onChange={e => setLocalProfile({...localProfile, name: e.target.value})} className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-gray-200" />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Contact Number</label>
                        <input type="tel" value={localProfile.phone} onChange={e => setLocalProfile({...localProfile, phone: e.target.value})} className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-gray-200" />
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

const HealthDetailsSettings: React.FC = () => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold mb-4">Physical Attributes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Blood Type</label>
                    <select className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-gray-200">
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                        <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Height</label>
                    <input type="text" placeholder="e.g. 5'10" className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-gray-200" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Weight</label>
                    <input type="text" placeholder="e.g. 160 lbs" className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-gray-200" />
                </div>
            </div>

            <h3 className="text-lg font-bold mb-4 mt-8">Medical History</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Allergies</label>
                    <textarea rows={3} placeholder="List any allergies..." className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 focus:ring-2 focus:ring-blue-600 resize-none dark:bg-gray-700 dark:text-gray-200" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Chronic Conditions</label>
                    <textarea rows={3} placeholder="List any chronic conditions..." className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 focus:ring-2 focus:ring-blue-600 resize-none dark:bg-gray-700 dark:text-gray-200" />
                </div>
            </div>

            <h3 className="text-lg font-bold mb-4 mt-8">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Contact Name</label>
                    <input type="text" className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-gray-200" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Relationship</label>
                    <input type="text" className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-gray-200" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">Phone Number</label>
                    <input type="tel" className="w-full bg-boticare-gray rounded-xl border-none px-4 py-3 focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-gray-200" />
                </div>
            </div>
            
            <div className="flex justify-end pt-4">
                <button className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg dark:shadow-none">Save Details</button>
            </div>
        </div>
    );
};

const AccountSettings: React.FC = () => {
    const handleSignOut = async () => await (supabase!.auth as any).signOut();
    return (
        <div className="space-y-6">
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

    const handleSaveProfile = (updated: UserProfile) => { 
        onProfileUpdate(updated); 
        setToast({message: "Profile updated successfully", type: 'success'}); 
    };
    
    const renderView = () => {
        switch (activeView) {
            case 'profile': return <ProfileSettings profile={userProfile} onSave={handleSaveProfile} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
            case 'account': return <AccountSettings />;
            case 'health': return <HealthDetailsSettings />;
            case 'notifications': return <AlertPreferences alertLevels={{[AlertLevel.High]: true, [AlertLevel.Low]: false, [AlertLevel.Medium]: true}} glucoseThresholds={{low: 70, high: 140}} appointmentReminders={{remind24h: true, remind1h: true}} onLevelChange={()=>{}} onThresholdChange={()=>{}} onReminderChange={()=>{}} onSaveChanges={()=>{}} onReset={()=>{}} />;
            default: return <MainSettingsView setView={setActiveView} />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex items-center mb-8">
                {activeView !== 'main' && (<button onClick={() => setActiveView('main')} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl mr-4"><BackIcon className="w-5 h-5" /></button>)}
                <h2 className="text-3xl font-black">{activeView === 'main' ? 'Settings' : 'Manage ' + activeView.charAt(0).toUpperCase() + activeView.slice(1).replace('settings', ' Settings')}</h2>
            </div>
            <div className="bg-white p-2 md:p-8 rounded-2xl border border-boticare-gray-medium dark:bg-gray-800 dark:border-gray-700 shadow-sm">{renderView()}</div>
        </div>
    );
};

export default Settings;
