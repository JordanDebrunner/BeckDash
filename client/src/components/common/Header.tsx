/**
 * Header Component
 *
 * Main application header with title, navigation, user info, and theme toggle
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// Props interface
interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

/**
 * Header component that displays at the top of the application
 */
const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Toggle profile dropdown menu
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Close profile menu when clicking outside
  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (!user) return '?';
    
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase() + 
        (user.lastName ? user.lastName.charAt(0).toUpperCase() : '');
    }
    
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 z-30 sticky top-0 shadow-sm backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
      <div className="px-4 md:px-6 h-full flex items-center justify-between max-w-7xl mx-auto">
        {/* Left section: Logo and menu toggle */}
        <div className="flex items-center">
          {/* Sidebar toggle button (for mobile) */}
          <button
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none transition-colors duration-200"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo/App Name */}
          <Link to="/" className="ml-2 flex items-center">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">BeckDash</span>
          </Link>
        </div>

        {/* Right section: User profile */}
        <div className="flex items-center space-x-4">
          {/* User profile dropdown */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={toggleProfileMenu}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                {user?.profileImageUrl ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary shadow-md">
                    <img 
                      src={user.profileImageUrl} 
                      alt={`${user.firstName || 'User'}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center shadow-md">
                    {getInitials()}
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium">
                  {user?.firstName || user?.email}
                </span>
                <svg
                  className="h-5 w-5 text-gray-400 transition-transform duration-200 ease-in-out"
                  style={{ transform: isProfileMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={closeProfileMenu}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5 transform origin-top-right transition-all duration-200 ease-in-out"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                      Signed in as<br />
                      <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                      role="menuitem"
                      onClick={closeProfileMenu}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                      role="menuitem"
                      onClick={closeProfileMenu}
                    >
                      Settings
                    </Link>
                    <button
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                      role="menuitem"
                      onClick={() => {
                        closeProfileMenu();
                        handleLogout();
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-150"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors duration-150 shadow-sm hover:shadow"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;