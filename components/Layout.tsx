
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Page, UserProfile, BoticareNotification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: Page;
  setActivePage: (page: Page) => void;
  userProfile: UserProfile;
  notifications: BoticareNotification[];
  onMarkNotificationsAsRead: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage, userProfile, notifications, onMarkNotificationsAsRead }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

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
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
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
      </div>
    </div>
  );
};

export default Layout;
