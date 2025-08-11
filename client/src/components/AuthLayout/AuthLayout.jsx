import React from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import SidebarProvider from '../../state/contexts/SidebarContext';
import { useSidebar } from "../../hooks/useSidebar";
import './AuthLayout.css';

const AuthLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </SidebarProvider>
  );
};

const AuthLayoutContent = ({ children }) => {
  const { sidebarExpanded, isMobile, toggleSidebar } = useSidebar();

  return (
    <div className="app-container">
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <div className={`page-content ${!sidebarExpanded ? 'sidebar-collapsed' : ''}`}>
          {children}
        </div>
        
        <div 
          className={`sidebar-overlay ${isMobile && sidebarExpanded ? 'show' : ''}`} 
          onClick={(e) => {
            if (isMobile && e.target.classList.contains('sidebar-overlay')) {
              toggleSidebar();
            }
          }}
        />
      </div>
    </div>
  );
};

export default AuthLayout;