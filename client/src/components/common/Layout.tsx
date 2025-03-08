/**
 * Layout Component
 *
 * Main application layout with responsive sidebar and header
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

// Props interface
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component that wraps the entire application
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar when navigating to a new page
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  return (
    <div className="min-h-screen text-foreground transition-colors duration-300 relative z-1" style={{ background: 'transparent' }}>
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        <main className="flex-1 p-4 lg:p-8 pt-6 transition-all duration-300 ease-in-out" style={{ background: 'transparent' }}>
          <div className="max-w-7xl mx-auto">
            <div className="fadeIn">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;