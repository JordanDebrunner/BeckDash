import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className = '' }) => {
  // Use the application's theme context instead of internal state
  const { currentTheme } = useTheme();
  
  useEffect(() => {
    console.log('AnimatedBackground mounted with theme:', currentTheme);
    
    // Create a persistent background element
    const createPersistentBackground = () => {
      // Check if the background already exists
      let bgElement = document.getElementById('persistent-animated-bg');
      
      if (!bgElement) {
        // Create the background element if it doesn't exist
        bgElement = document.createElement('div');
        bgElement.id = 'persistent-animated-bg';
        bgElement.style.position = 'fixed';
        bgElement.style.top = '0';
        bgElement.style.left = '0';
        bgElement.style.width = '100%';
        bgElement.style.height = '100%';
        bgElement.style.zIndex = '-1';
        bgElement.style.pointerEvents = 'none';
        
        // Add the background to the body
        document.body.prepend(bgElement);
        
        // Add animation classes
        bgElement.classList.add('animated-bg-container');
        
        // Create the animated elements
        const blueCircle = document.createElement('div');
        blueCircle.classList.add('animated-circle', 'blue-circle', 'animate-float-slow');
        bgElement.appendChild(blueCircle);
        
        const purpleCircle = document.createElement('div');
        purpleCircle.classList.add('animated-circle', 'purple-circle', 'animate-float-medium');
        bgElement.appendChild(purpleCircle);
        
        const waveLine1 = document.createElement('div');
        waveLine1.classList.add('animated-wave', 'blue-wave', 'animate-wave');
        bgElement.appendChild(waveLine1);
        
        const waveLine2 = document.createElement('div');
        waveLine2.classList.add('animated-wave', 'purple-wave', 'animate-wave-delayed');
        bgElement.appendChild(waveLine2);
        
        // Add debug indicator
        const debugBar = document.createElement('div');
        debugBar.classList.add('debug-bar');
        bgElement.appendChild(debugBar);
      }
      
      // Update the background based on the current theme
      if (bgElement) {
        if (currentTheme === 'dark') {
          bgElement.classList.add('dark-theme');
          bgElement.classList.remove('light-theme');
        } else {
          bgElement.classList.add('light-theme');
          bgElement.classList.remove('dark-theme');
        }
      }
    };
    
    // Create the persistent background
    createPersistentBackground();
    
    // Add the necessary styles
    const style = document.createElement('style');
    style.textContent = `
      .animated-bg-container {
        background: ${currentTheme === 'dark' 
          ? 'radial-gradient(circle at 20% 20%, #3b82f640, transparent 50%), radial-gradient(circle at 80% 80%, #8b5cf640, transparent 50%)'
          : 'radial-gradient(circle at 20% 20%, #60a5fa40, transparent 50%), radial-gradient(circle at 80% 80%, #a78bfa40, transparent 50%)'};
      }
      
      .animated-circle {
        position: absolute;
        border-radius: 50%;
        filter: blur(20px);
      }
      
      .blue-circle {
        top: 20%;
        left: 20%;
        width: 300px;
        height: 300px;
        background-color: ${currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(96, 165, 250, 0.3)'};
      }
      
      .purple-circle {
        bottom: 20%;
        right: 20%;
        width: 350px;
        height: 350px;
        background-color: ${currentTheme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(167, 139, 250, 0.3)'};
      }
      
      .animated-wave {
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
      }
      
      .blue-wave {
        top: 50%;
        background: linear-gradient(to right, transparent, ${currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(96, 165, 250, 0.4)'}, transparent);
      }
      
      .purple-wave {
        top: 60%;
        background: linear-gradient(to right, transparent, ${currentTheme === 'dark' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(167, 139, 250, 0.4)'}, transparent);
      }
      
      .debug-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(to right, ${currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(96, 165, 250, 0.5)'}, ${currentTheme === 'dark' ? 'rgba(139, 92, 246, 0.5)' : 'rgba(167, 139, 250, 0.5)'});
      }
    `;
    
    document.head.appendChild(style);
    
    // Cleanup function
    return () => {
      // We don't remove the background element on unmount to keep it persistent
      // But we do remove the style element
      document.head.removeChild(style);
    };
  }, [currentTheme]);
  
  // This component doesn't render anything visible itself
  // It just sets up the persistent background
  return null;
};

export default AnimatedBackground; 