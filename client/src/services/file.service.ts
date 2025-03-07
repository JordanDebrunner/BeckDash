/**
 * File Service
 * 
 * Handles file uploads and related operations
 */

import axios from 'axios';
import { User } from '../types/User';

class FileService {
  /**
   * Upload a profile image
   */
  async uploadProfileImage(file: File): Promise<{ user: User; imageUrl: string }> {
    console.log('FileService: Starting profile image upload');
    
    // Create form data
    const formData = new FormData();
    formData.append('profileImage', file);
    
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('FileService: No access token found');
      throw new Error('Authentication required');
    }
    
    try {
      // Make a direct request to the backend
      const response = await axios.post(
        'http://localhost:3000/api/v1/files/profile-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('FileService: Profile image upload successful', response.data);
      
      if (response.data && response.data.data) {
        const result = response.data.data;
        
        // If the image URL is relative, convert it to absolute
        if (result.imageUrl && result.imageUrl.startsWith('/')) {
          const baseUrl = 'http://localhost:3000';
          result.imageUrl = `${baseUrl}${result.imageUrl}`;
          console.log('FileService: Converted relative URL to absolute:', result.imageUrl);
          
          // Also update the user's profileImageUrl
          if (result.user && result.user.profileImageUrl) {
            result.user.profileImageUrl = result.imageUrl;
            console.log('FileService: Updated user profile image URL:', result.user.profileImageUrl);
          }
        }
        
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        result.imageUrl = `${result.imageUrl}?t=${timestamp}`;
        console.log('FileService: Added timestamp to URL:', result.imageUrl);
        
        // If user object exists, update its profileImageUrl as well
        if (result.user) {
          result.user.profileImageUrl = result.imageUrl;
        }
        
        return result;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('FileService: Profile image upload failed', error);
      throw error;
    }
  }

  /**
   * Delete the current profile image
   */
  async deleteProfileImage(): Promise<{ user: User }> {
    console.log('FileService: Starting profile image deletion');
    
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('FileService: No access token found');
      throw new Error('Authentication required');
    }
    
    try {
      // Make a direct request to the backend
      const response = await axios.delete(
        'http://localhost:3000/api/v1/files/profile-image',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('FileService: Profile image deletion successful', response.data);
      
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('FileService: Profile image deletion failed', error);
      throw error;
    }
  }
}

const fileService = new FileService();

export default fileService; 