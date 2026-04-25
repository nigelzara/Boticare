
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Page, UserProfile, UserRole, BoticareNotification } from '../types';
import { SparklesIcon } from './Icons';

interface LayoutProps {
  children: React.ReactNode;
  activePage: Page;
  setActivePage: (page: Page) => void;
  userProfile: UserProfile;
  userRole: UserRole;
  notifications: BoticareNotification[];
  onMarkNotificationsAsRead: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage, userProfile, userRole, notifications, onMarkNotificationsAsRead }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const showAiFab = activePage !== Page.ChatBot;

  return (
    <div className="flex h-screen bg-boticare-gray dark:bg-gray-900 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden animate-fade-in"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Hidden on mobile, overlay on small/medium screens, fixed on large */}
      <div className={`
        fixed inset-y-0 left-0 transform lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          activePage={activePage} 
          setActivePage={(page) => {
            setActivePage(page);
            closeSidebar();
          }} 
          onClose={closeSidebar}
          userRole={userRole}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        <Header 
          userProfile={userProfile} 
          onNavigate={(page) => {
            setActivePage(page);
            closeSidebar();
          }} 
          onToggleSidebar={toggleSidebar}
          notifications={notifications}
          onMarkNotificationsAsRead={onMarkNotificationsAsRead}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          {children}
        </main>

        {/* Mobile AI Assistant FAB */}
        {showAiFab && (
            <button
                onClick={() => setActivePage(Page.ChatBot)}
                className="lg:hidden fixed bottom-6 right-6 bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl z-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center animate-fade-in border-2 border-white/20"
                aria-label="Open AI Assistant"
            >
                <SparklesIcon className="w-6 h-6" />
            </button>
        )}
      </div>
    </div>
  );
};

export default Layout;
