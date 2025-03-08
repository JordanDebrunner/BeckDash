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
  const { theme } = useTheme();
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
    }
  }, [user]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear any previous errors
    setFormError(null);
  };

  // Handle profile image change
  const handleProfileImageChange = (file: File | null) => {
    setProfileImageFile(file);
    
    // Clear any previous errors
    setFormError(null);
  };

  // Handle profile image upload
  const handleProfileImageUpload = async () => {
    if (!profileImageFile) return;
    
    setIsUploading(true);
    setFormError(null);
    
    try {
      // Upload the image
      const response = await fileService.uploadProfileImage(profileImageFile);
      
      if (response && response.imageUrl) {
        // Update user profile with new image URL
        await updateProfile({ profileImageUrl: response.imageUrl });
        
        // Show success message
        setSuccessMessage('Profile image updated successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Profile image upload failed:', error);
      setFormError('Failed to upload profile image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    setFormError(null);
    
    try {
      // Update profile
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        notificationsEnabled: formData.notificationsEnabled
      });
      
      // Show success message
      setSuccessMessage('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Profile update failed:', error);
      setFormError('Failed to update profile. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Your Profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your personal information and account settings.
          </p>
        </div>
        
        {/* Success message */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md">
            <p>{successMessage}</p>
          </div>
        )}
        
        {/* Error message */}
        {(error || formError) && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p>{error || formError}</p>
          </div>
        )}
        
        {/* Profile form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* Profile image section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Image</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ProfileImageUpload
                user={user}
                onImageChange={handleProfileImageChange}
                currentImageUrl={user?.profileImageUrl || null}
              />
              <div className="mt-4 sm:mt-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload a profile picture to personalize your account.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Recommended size: 300x300 pixels.
                </p>
              </div>
            </div>
            {profileImageFile && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleProfileImageUpload}
                  disabled={isUploading}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            )}
          </div>
          
          {/* Personal information section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          
          {/* Notification Settings */}
          <div className="p-6">
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
                Enable email notifications
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Receive email notifications for important updates and reminders.
            </p>
          </div>
          
          {/* Form actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 text-right">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ProfilePage; 