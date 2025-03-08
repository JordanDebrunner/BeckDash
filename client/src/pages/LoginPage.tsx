/**
 * Login Page
 *
 * Page component for user authentication/login
 */

import React, { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import { ApiError } from '../../../shared/types/api.types';

// Login form state interface
interface LoginFormState {
  email: string;
  password: string;
}

// Initial form state
const initialFormState: LoginFormState = {
  email: '',
  password: '',
};

/**
 * Login page component
 */
const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to dashboard
  const from = (location.state as { from?: string })?.from || '/';

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }

    // Clear general form error when user types
    if (formErrors.general) {
      setFormErrors({ ...formErrors, general: '' });
    }

    // Clear global error when user types
    if (error) {
      clearError();
    }
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted with data:', formData);

    // Validate form
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      console.log('Attempting to login with:', formData);
      await login({
        email: formData.email,
        password: formData.password,
      });
      console.log('Login successful, navigating to:', from);

      // Redirect to the page the user was trying to access or dashboard
      navigate(from, { replace: true });
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      // Set a more user-friendly error message
      if (error instanceof Error) {
        const errorObj = error as any; // Cast to any to access potential status property
        
        if (errorObj.status === 401) {
          setFormErrors({
            ...formErrors,
            general: 'Invalid email or password. Please try again.'
          });
        } else if (errorObj.status === 429) {
          setFormErrors({
            ...formErrors,
            general: 'Too many login attempts. Please wait a few minutes before trying again.'
          });
        } else {
          setFormErrors({
            ...formErrors,
            general: 'An error occurred while signing in. Please try again later.'
          });
        }
      } else {
        setFormErrors({
          ...formErrors,
          general: 'An error occurred while signing in. Please try again later.'
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80 dark:from-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
        <div>
          <h1 className="text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Sign in to BeckDash
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark transition-colors duration-200">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Global error message */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 animate-fadeIn">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* Form general error message */}
          {formErrors.general && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 animate-fadeIn">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {formErrors.general}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formErrors.email ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                } placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 sm:text-sm`}
                placeholder="Email address"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formErrors.password ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                } placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 sm:text-sm`}
                placeholder="Password"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded transition-colors duration-200"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-dark transition-colors duration-200">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;