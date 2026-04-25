
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import ProfessionalDashboard from './components/ProfessionalDashboard';
import PatientList from './components/PatientList';
import Appointments from './components/Appointments';
import ChatBot from './components/Community';
import PersonalChat from './components/PersonalChat';
import Settings from './components/Settings';
import HelpSupport from './components/HelpSupport';
import VideoCall from './components/VideoCall';
import Auth from './components/Auth';
import PharmacyPatientDatabase from './components/PharmacyPatientDatabase';
import DosageReminderEngine from './components/DosageReminderEngine';
import DosageReminderPopup from './components/DosageReminderPopup';
import { supabase } from './services/supabaseClient';
import { MOCK_PHARMACY_PATIENTS, MOCK_PATIENT_MEDICATIONS } from './constants';
import { Page, Professional, UserProfile, UserRole, BoticareNotification, Patient, ProfessionalTitle, Appointment, DosageReminder } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any | null>(null);
  // Force userRole to always be professional for Boticare Pro
  const [userRole, setUserRole] = useState<UserRole>('professional');
  const [activePage, setActivePage] = useState<Page>(Page.ProfessionalDashboard);
  const [videoCallProfessional, setVideoCallProfessional] = useState<Professional | null>(null);
  const [videoCallPatient, setVideoCallPatient] = useState<Patient | null>(null);
  const [chatRecipient, setChatRecipient] = useState<Patient | Professional | UserProfile | null>(null);
  const [videoCallAppointment, setVideoCallAppointment] = useState<Appointment | null>(null); 
  const [notifications, setNotifications] = useState<BoticareNotification[]>([]);
  const [activeReminders, setActiveReminders] = useState<DosageReminder[]>([]);
  const [acknowledgedReminderIds, setAcknowledgedReminderIds] = useState<Set<string>>(new Set());
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Loading...',
    email: '',
    phone: '',
    avatar: 'https://i.pravatar.cc/150?u=placeholder',
    role: 'professional',
    professionalTitle: 'Doctor', 
    specialty: 'General Practice'
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('boticare-dark-mode');
    return saved ? saved === 'true' : window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) { root.classList.add('dark'); } else { root.classList.remove('dark'); }
    localStorage.setItem('boticare-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (!supabase) return;
    
    // Always start on Professional Dashboard for this Pro App
    setActivePage(Page.ProfessionalDashboard);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (error) throw error;
        if (data) {
            setUserProfile({
                name: data.name || 'User',
                email: data.email || '',
                phone: data.phone || '',
                avatar: data.avatar_url || 'https://i.pravatar.cc/150?u=default',
                role: 'professional', // Enforce professional role in UI state
                professionalTitle: (data.professional_title as ProfessionalTitle) || 'Doctor',
                specialty: data.specialty || 'General Practice',
                supabaseId: data.id 
            });
            setUserRole('professional');
        }
    } catch (err) { console.error("Profile fetch error", err); }
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    if (!session || !supabase) return;
    try {
        const { error } = await supabase.from('profiles')
            .update({ 
                name: updatedProfile.name, 
                phone: updatedProfile.phone, 
                avatar_url: updatedProfile.avatar,
                professional_title: updatedProfile.professionalTitle,
                specialty: updatedProfile.specialty
            })
            .eq('id', session.user.id);
        if (error) throw error;
        setUserProfile(updatedProfile); 
        console.log("Profile updated successfully!");
    } catch (error) {
        console.error("Error updating profile:", error);
    }
  };


  const handleAddNotification = (msg: string) => {
      const newNotif: BoticareNotification = {
          id: Date.now().toString(),
          message: msg,
          type: 'success',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkNotificationsAsRead = () => {
      setTimeout(() => {
          setNotifications(prev => prev.map(n => ({...n, read: true})));
      }, 2000);
  };
  
  const handleStartVideoCall = (appointment: Appointment, professional: Professional | null = null, patient: Patient | null = null) => {
    setVideoCallAppointment(appointment);
    setVideoCallProfessional(professional);
    setVideoCallPatient(patient);
    setActivePage(Page.VideoCall);
  };


  const startPersonalChat = (recipient: Patient | Professional | UserProfile) => {
      setChatRecipient(recipient);
      setActivePage(Page.PersonalChat);
  };

  if (!session) {
    return <div className="bg-white text-gray-800 font-sans dark:bg-gray-900 dark:text-gray-200"><Auth /></div>;
  }

  const handleDosageReminder = useCallback((reminder: DosageReminder) => {
      setActiveReminders(prev => {
          if (prev.find(r => r.id === reminder.id)) return prev;
          return [...prev, reminder];
      });
      handleAddNotification(`💊 Dose reminder: ${reminder.medicationName} ${reminder.dose} for ${reminder.patientName} at ${reminder.scheduledTime}`);
  }, []);

  const handleMarkReminderTaken = useCallback((reminder: DosageReminder) => {
      setActiveReminders(prev => prev.filter(r => r.id !== reminder.id));
      setAcknowledgedReminderIds(prev => new Set(prev).add(reminder.id));
      handleAddNotification(`✅ ${reminder.patientName} took ${reminder.medicationName} ${reminder.dose}`);
  }, []);

  const handleSnoozeReminder = useCallback((reminder: DosageReminder) => {
      setActiveReminders(prev => prev.filter(r => r.id !== reminder.id));
      setTimeout(() => {
          setActiveReminders(prev => [...prev, { ...reminder, id: reminder.id + '-snoozed' }]);
      }, 15 * 60 * 1000);
  }, []);

  const handleDismissReminder = useCallback((reminder: DosageReminder) => {
      setActiveReminders(prev => prev.filter(r => r.id !== reminder.id));
      setAcknowledgedReminderIds(prev => new Set(prev).add(reminder.id));
  }, []);

  const renderAppContent = () => {
    switch (activePage) {
        case Page.ProfessionalDashboard: return <ProfessionalDashboard setActivePage={setActivePage} userProfile={userProfile} onAddNotification={handleAddNotification} />;
        case Page.PatientList: return <PatientList setActivePage={setActivePage} onStartChat={startPersonalChat} />;
        case Page.PharmacyPatients: return <PharmacyPatientDatabase setActivePage={setActivePage} />;
        case Page.ProfessionalSchedule: return <Appointments setActivePage={setActivePage} setVideoCallProfessional={handleStartVideoCall} isProfessionalView userRole={userRole} />;
        case Page.ChatBot: return <ChatBot userProfile={userProfile} />;
        case Page.PersonalChat: return <PersonalChat recipient={chatRecipient} userProfile={userProfile} onClose={() => setActivePage(Page.PatientList)} />;
        case Page.Settings: return <Settings userProfile={userProfile} onProfileUpdate={handleUpdateProfile} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
        case Page.HelpSupport: return <HelpSupport />;
        case Page.VideoCall: return <VideoCall appointment={videoCallAppointment} professional={videoCallProfessional} patient={videoCallPatient} isProfessionalView onEndCall={() => setActivePage(Page.ProfessionalSchedule)} />;
        default: return <ProfessionalDashboard setActivePage={setActivePage} userProfile={userProfile} onAddNotification={handleAddNotification} />;
    }
  };

  return (
    <div className="bg-boticare-gray text-gray-800 font-sans dark:bg-gray-900 dark:text-gray-200">
      {/* Dosage Reminder Engine — headless, always active */}
      <DosageReminderEngine
        patients={MOCK_PHARMACY_PATIENTS}
        medications={MOCK_PATIENT_MEDICATIONS}
        onReminder={handleDosageReminder}
        acknowledgedIds={acknowledgedReminderIds}
      />
      {/* Dosage Reminder Pop-ups */}
      <DosageReminderPopup
        reminders={activeReminders}
        onMarkTaken={handleMarkReminderTaken}
        onSnooze={handleSnoozeReminder}
        onDismiss={handleDismissReminder}
      />
      <Layout 
        activePage={activePage} 
        setActivePage={setActivePage} 
        userProfile={userProfile} 
        userRole={userRole}
        notifications={notifications}
        onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
      >
        {renderAppContent()}
      </Layout>
    </div>
  );
};

export default App;
