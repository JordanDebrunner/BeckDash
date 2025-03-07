/**
 * Profile Page
 *
 * User profile management page with personal information and preferences
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ProfileImageUpload from '../components/common/ProfileImageUpload';
import useAuth from '../hooks/useAuth';
import { useTheme, ThemeOption } from '../contexts/ThemeContext';
import { ProfileUpdateRequest } from '../types/User';
import fileService from '../services/file.service';
import authService from '../services/auth.service';

/**
 * Profile page component
 */
const ProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading, error, clearError } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ProfileUpdateRequest>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    theme: theme,
    notificationsEnabled: user?.notificationsEnabled || false,
  });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  // Sync form data with user data
  useEffect(() => {
    if (user) {
      console.log('User data updated, syncing form data:', user);
      
      // Update form data
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        theme: (user.theme as ThemeOption) || 'light',
        notificationsEnabled: user.notificationsEnabled || false
      });
      
      // Set theme from user data
      console.log('Setting theme from user data:', user.theme);
      if (user.theme) {
        setTheme(user.theme as ThemeOption);
      }
      
      // If user has a profile image URL, make sure it's a full URL
      if (user.profileImageUrl) {
        console.log('User has profile image URL:', user.profileImageUrl);
        
        // Check if it's a relative URL and convert to absolute
        if (user.profileImageUrl.startsWith('/')) {
          console.log('Converting relative profile image URL to absolute');
          const baseUrl = 'http://localhost:3000'; // Use your backend URL
          const fullUrl = `${baseUrl}${user.profileImageUrl}`;
          console.log('Full profile image URL:', fullUrl);
          
          // Update the user object with the full URL
          user.profileImageUrl = fullUrl;
        }
      } else {
        console.log('User has no profile image URL');
      }
    }
  }, [user, setTheme]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear any previous messages
    setFormError(null);
    setSuccessMessage(null);
    clearError();
  };

  // Handle theme change
  const handleThemeChange = async (newTheme: ThemeOption) => {
    console.log(`ProfilePage: Changing theme from ${formData.theme} to ${newTheme}`);
    
    // Apply theme immediately for better UX
    setTheme(newTheme);
    
    // Update form data with new theme
    setFormData(prev => ({
      ...prev,
      theme: newTheme
    }));
    
    // Add transition class for smooth theme change
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
    
    // Clear any previous errors
    setFormError(null);
    
    try {
      // Save the theme change immediately
      await authService.updateProfile({ theme: newTheme });
      
      const themeNames = { light: 'Light', dark: 'Dark', system: 'System' };
      setSuccessMessage(`Theme changed to ${themeNames[newTheme]} successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to save theme:', error);
      setFormError('Failed to save theme. Please try again.');
    }
  };

  // Handle profile image change
  const handleProfileImageChange = (file: File | null) => {
    setProfileImageFile(file);
    
    // Clear any previous messages
    setFormError(null);
    setSuccessMessage(null);
    clearError();
  };

  // Handle profile image upload
  const handleProfileImageUpload = async () => {
    if (!profileImageFile) {
      console.log('ProfilePage: No profile image file to upload');
      return null;
    }
    
    console.log('ProfilePage: Starting profile image upload');
    setIsUploading(true);
    
    try {
      const result = await fileService.uploadProfileImage(profileImageFile);
      console.log('ProfilePage: Profile image uploaded successfully:', result);
      
      // Update the user data with the new image URL
      if (result && result.imageUrl) {
        // Ensure the URL is absolute
        let imageUrl = result.imageUrl;
        if (imageUrl.startsWith('/')) {
          imageUrl = `http://localhost:3000${imageUrl}`;
          console.log('ProfilePage: Converted to absolute URL:', imageUrl);
        }
        
        // Update the user object directly
        if (user) {
          user.profileImageUrl = imageUrl;
          console.log('ProfilePage: Updated user profile image URL:', user.profileImageUrl);
        }
        
        setSuccessMessage('Profile image uploaded successfully');
        setProfileImageFile(null);
        return imageUrl;
      } else {
        throw new Error('No image URL returned');
      }
    } catch (err) {
      console.error('ProfilePage: Failed to upload profile image:', err);
      setFormError('Failed to upload profile image. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ProfilePage: Submitting form with data:', formData);
    
    setFormError(null);
    setSuccessMessage(null);
    
    try {
      let profileImageUrl = null;
      
      // First upload the profile image if there is one
      if (profileImageFile) {
        profileImageUrl = await handleProfileImageUpload();
        if (!profileImageUrl) {
          console.error('ProfilePage: Failed to get profile image URL');
          // Continue with the rest of the profile update
        } else {
          console.log('ProfilePage: Got profile image URL:', profileImageUrl);
        }
      } else if (user && user.profileImageUrl) {
        // If no new image was uploaded, but user has an existing image, keep it
        profileImageUrl = user.profileImageUrl;
        console.log('ProfilePage: Using existing profile image URL:', profileImageUrl);
      }
      
      // Create the data to submit
      const dataToSubmit: ProfileUpdateRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        theme: formData.theme,
        notificationsEnabled: formData.notificationsEnabled
      };
      
      // Add profile image URL if it was uploaded or exists
      if (profileImageUrl) {
        dataToSubmit.profileImageUrl = profileImageUrl;
      }
      
      console.log('ProfilePage: Submitting profile update with data:', dataToSubmit);
      
      // Update the profile
      const updatedUser = await updateProfile(dataToSubmit);
      console.log('ProfilePage: Profile updated successfully:', updatedUser);
      
      // Show success message
      setSuccessMessage('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('ProfilePage: Error updating profile:', err);
      setFormError('Failed to update profile. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Toast notifications - fixed position overlays */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 max-w-md animate-toast-slide-in">
            <div className="bg-green-50 dark:bg-green-900/70 text-green-600 dark:text-green-300 p-4 rounded-lg shadow-lg border border-green-200 dark:border-green-800 flex items-start space-x-2">
              <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-medium">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {(error || formError) && (
          <div className="fixed top-4 right-4 z-50 max-w-md animate-toast-slide-in">
            <div className="bg-red-50 dark:bg-red-900/70 text-red-600 dark:text-red-300 p-4 rounded-lg shadow-lg border border-red-200 dark:border-red-800 flex items-start space-x-2">
              <svg className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">{error || formError}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
          <div className="bg-gradient-to-r from-primary to-accent p-6">
            <h1 className="text-2xl font-bold text-white">Your Profile</h1>
            <p className="text-white/80">Manage your personal information and preferences</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <ProfileImageUpload 
                user={user} 
                onImageChange={handleProfileImageChange} 
                currentImageUrl={user?.profileImageUrl || null} 
              />
              
              <div className="flex-1 space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>
            
            {/* Theme Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Theme Preference</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Light Theme */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    formData.theme === 'light' 
                      ? 'border-primary bg-primary/10 dark:bg-primary/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                  }`}
                >
                  <svg className="h-8 w-8 text-amber-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="font-medium text-gray-900 dark:text-white">Light</span>
                </button>
                
                {/* Dark Theme */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    formData.theme === 'dark' 
                      ? 'border-primary bg-primary/10 dark:bg-primary/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                  }`}
                >
                  <svg className="h-8 w-8 text-indigo-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="font-medium text-gray-900 dark:text-white">Dark</span>
                </button>
                
                {/* System Theme */}
                <button
                  type="button"
                  onClick={() => handleThemeChange('system')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    formData.theme === 'system' 
                      ? 'border-primary bg-primary/10 dark:bg-primary/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                  }`}
                >
                  <svg className="h-8 w-8 text-gray-700 dark:text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium text-gray-900 dark:text-white">System</span>
                </button>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Settings</h2>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notificationsEnabled"
                  name="notificationsEnabled"
                  checked={formData.notificationsEnabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded transition-colors duration-200"
                />
                <label htmlFor="notificationsEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable notifications
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Receive notifications about important updates and reminders
              </p>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-md shadow-sm transition-colors duration-200 flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {(isLoading || isUploading) && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 