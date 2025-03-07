import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { User } from '../../types/User';

interface ProfileImageUploadProps {
  user: User | null;
  onImageChange: (file: File | null) => void;
  currentImageUrl: string | null;
}

/**
 * Component for uploading and previewing profile images
 */
const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  user,
  onImageChange,
  currentImageUrl,
}) => {
  // State for preview image
  const [preview, setPreview] = useState<string | null>(null);
  
  // Set up dropzone with validation
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    // Pass file to parent component
    onImageChange(file);
    
    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(previewUrl);
  }, [onImageChange]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
  });
  
  // Initialize preview with current image URL
  useEffect(() => {
    console.log('ProfileImageUpload: currentImageUrl changed:', currentImageUrl);
    
    if (currentImageUrl) {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const urlWithTimestamp = `${currentImageUrl}${currentImageUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
      console.log('ProfileImageUpload: URL with timestamp:', urlWithTimestamp);
      
      // Set the preview with the timestamped URL
      setPreview(urlWithTimestamp);
    } else {
      setPreview(null);
    }
  }, [currentImageUrl]);
  
  // Function to remove the current image
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageChange(null);
  };
  
  // Generate initials for default avatar
  const getInitials = () => {
    if (!user) return '?';
    
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase() + 
        (user.lastName ? user.lastName.charAt(0).toUpperCase() : '');
    }
    
    return user.email.charAt(0).toUpperCase();
  };
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Profile Image
      </label>
      
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center">
          {preview ? (
            <div className="relative mb-3">
              <img 
                src={preview} 
                alt="Profile preview" 
                className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                onError={(e) => {
                  console.error('Image failed to load:', preview);
                  e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
                }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center text-2xl font-bold mb-3">
              {getInitials()}
            </div>
          )}
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isDragActive ? (
              <span>Drop the image here...</span>
            ) : (
              <span>
                Drag & drop an image, or <span className="text-primary">click to select</span>
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            JPG, PNG, or GIF (max 5MB)
          </p>
          {currentImageUrl && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Current image: {currentImageUrl}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload; 