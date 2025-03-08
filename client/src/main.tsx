import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './styles/animations.css';

// Suppress React Router future flag warnings
// These warnings are about upcoming changes in React Router v7
// We'll address them properly when upgrading to v7
const originalConsoleWarn = console.warn;
console.warn = function filterWarnings(msg, ...args) {
  if (
    typeof msg === 'string' && 
    (msg.includes('React Router Future Flag Warning') || 
     msg.includes('v7_startTransition') || 
     msg.includes('v7_relativeSplatPath'))
  ) {
    return;
  }
  return originalConsoleWarn(msg, ...args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);