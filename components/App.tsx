
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProfessionalDashboard from './components/ProfessionalDashboard';
import PatientList from './components/PatientList';
import HealthMetrics from './components/HealthMetrics';
import Medications from './components/Medications';
import Appointments from './components/Appointments';
import MyDoctors from './components/MyDoctors';
import ChatBot from './components/Community';
import PersonalChat from './components/PersonalChat';
import Settings from './components/Settings';
import HelpSupport from './components/HelpSupport';
import VideoCall from './components/VideoCall';
import Auth from './components/Auth';
import { supabase } from './services/supabaseClient';
import { Page, Professional, UserProfile, UserRole, BoticareNotification, Patient, ProfessionalTitle, Appointment } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('patient');
  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
  const [videoCallProfessional, setVideoCallProfessional] = useState<Professional | null>(null);
  const [videoCallPatient, setVideoCallPatient] = useState<Patient | null>(null);
  const [videoCallAppointment, setVideoCallAppointment] = useState<Appointment | null>(null);
  const [chatRecipient, setChatRecipient] = useState<Patient | UserProfile | null>(null);
  const [notifications, setNotifications] = useState<BoticareNotification[]>([]);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Loading...',
    email: '',
    phone: '',
    avatar: 'https://i.pravatar.cc/150?u=placeholder',
    professionalTitle: 'Doctor', // Default for professionals
    specialty: 'General Practice' // Default for professionals
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
    const savedRole = localStorage.getItem('boticare-user-role') as UserRole;
    if (savedRole) {
        setUserRole(savedRole);
        setActivePage(savedRole === 'professional' ? Page.ProfessionalDashboard : Page.Dashboard);
    }
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
                role: (data.role as UserRole) || 'patient', // Ensure role from DB is used
                professionalTitle: (data.professional_title as ProfessionalTitle) || 'Doctor',
                specialty: data.specialty || 'General Practice'
            });
            // Update the userRole state based on fetched profile
            if (data.role !== userRole) {
                setUserRole(data.role as UserRole);
                setActivePage(data.role === 'professional' ? Page.ProfessionalDashboard : Page.Dashboard);
            }
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
        setUserProfile(updatedProfile); // Update local state after successful DB update
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
  
  const handleStartVideoCall = (appointment: Appointment, professional: Professional | null = null) => {
    setVideoCallAppointment(appointment);
    setVideoCallProfessional(professional);
    setActivePage(Page.VideoCall);
  };


  const startPersonalChat = (recipient: Patient | Professional | UserProfile) => {
      setChatRecipient(recipient);
      setActivePage(Page.PersonalChat);
  };

  if (!session) {
    return <div className="bg-white text-gray-800 font-sans dark:bg-gray-900 dark:text-gray-200"><Auth /></div>;
  }

  // Separate rendering logic for Patient and Professional UIs
  const renderPatientPage = () => {
    switch (activePage) {
        case Page.Dashboard: return <Dashboard />;
        case Page.HealthMetrics: return <HealthMetrics setActivePage={setActivePage} />;
        case Page.Medications: return <Medications />;
        case Page.Appointments: return <Appointments setActivePage={setActivePage} setVideoCallProfessional={handleStartVideoCall} />;
        case Page.MyDoctors: return <MyDoctors onStartChat={startPersonalChat} />;
        case Page.ChatBot: return <ChatBot userProfile={userProfile} />;
        case Page.PersonalChat: return <PersonalChat recipient={chatRecipient} userProfile={userProfile} onClose={() => setActivePage(Page.MyDoctors)} />;
        case Page.Settings: return <Settings userProfile={userProfile} onProfileUpdate={handleUpdateProfile} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
        case Page.HelpSupport: return <HelpSupport />;
        case Page.VideoCall: return <VideoCall appointment={videoCallAppointment} professional={videoCallProfessional} onEndCall={() => setActivePage(Page.Appointments)} />;
        default: return <Dashboard />;
    }
  };

  const renderProfessionalPage = () => {
    switch (activePage) {
        case Page.ProfessionalDashboard: return <ProfessionalDashboard setActivePage={setActivePage} userProfile={userProfile} onAddNotification={handleAddNotification} />;
        case Page.PatientList: return <PatientList setActivePage={setActivePage} onStartChat={startPersonalChat} />;
        case Page.ProfessionalSchedule: return <Appointments setActivePage={setActivePage} setVideoCallProfessional={handleStartVideoCall} isProfessionalView userRole={userRole} />;
        case Page.ChatBot: return <ChatBot userProfile={userProfile} />;
        case Page.PersonalChat: return <PersonalChat recipient={chatRecipient} userProfile={userProfile} onClose={() => setActivePage(Page.PatientList)} />;
        case Page.Settings: return <Settings userProfile={userProfile} onProfileUpdate={handleUpdateProfile} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
        case Page.HelpSupport: return <HelpSupport />;
        case Page.VideoCall: return <VideoCall appointment={videoCallAppointment} professional={videoCallProfessional} onEndCall={() => setActivePage(Page.ProfessionalSchedule)} />;
        default: return <ProfessionalDashboard setActivePage={setActivePage} userProfile={userProfile} onAddNotification={handleAddNotification} />;
    }
  };

  return (
    <div className="bg-boticare-gray text-gray-800 font-sans dark:bg-gray-900 dark:text-gray-200">
      <Layout 
        activePage={activePage} 
        setActivePage={setActivePage} 
        userProfile={userProfile} 
        userRole={userRole}
        notifications={notifications}
        onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
      >
        {userRole === 'professional' ? renderProfessionalPage() : renderPatientPage()}
      </Layout>
    </div>
  );
};

export default App;
