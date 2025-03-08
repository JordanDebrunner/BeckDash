/**
 * Register Page
 *
 * Page component for user registration
 */

import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import { ApiError } from '../../../shared/types/api.types';

// Registration form state interface
interface RegisterFormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Initial form state
const initialFormState: RegisterFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

/**
 * Register page component
 */
const RegisterPage: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<RegisterFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }

    // Clear global error when user types
    if (error) {
      clearError();
    }
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) return;

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      // Redirect to dashboard on successful registration
      navigate('/');
    } catch (error: unknown) {
      console.error('Registration error:', error);
      
      // Set a more user-friendly error message
      if (error instanceof Error) {
        const errorObj = error as any; // Cast to any to access potential status property
        
        if (errorObj.status === 409) {
          setFormErrors({
            ...formErrors,
            email: 'This email is already registered. Please use a different email or try logging in.',
            general: 'Account with this email already exists.'
          });
        } else if (errorObj.status === 429) {
          setFormErrors({
            ...formErrors,
            general: 'Too many registration attempts. Please wait a few minutes before trying again.'
          });
        } else {
          setFormErrors({
            ...formErrors,
            general: 'An error occurred during registration. Please try again later.'
          });
        }
      } else {
        setFormErrors({
          ...formErrors,
          general: 'An error occurred during registration. Please try again later.'
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80 dark:from-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-[1.01]">
        <div>
          <h1 className="text-center text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors duration-200">
              Sign in
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
            {/* First Name field */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formErrors.firstName ? 'border-red-300' : 'border-gray-300 dark:border-gray-700'
                } rounded-md placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-primary focus:border-primary transition-colors duration-200 sm:text-sm`}
                placeholder="First Name"
              />
              {formErrors.firstName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fadeIn">{formErrors.firstName}</p>
              )}
            </div>

            {/* Last Name field */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-primary focus:border-primary transition-colors duration-200 sm:text-sm"
                placeholder="Last Name (Optional)"
              />
            </div>

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
                  formErrors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-700'
                } rounded-md placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-primary focus:border-primary transition-colors duration-200 sm:text-sm`}
                placeholder="Email address"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fadeIn">{formErrors.email}</p>
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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formErrors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-700'
                } rounded-md placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-primary focus:border-primary transition-colors duration-200 sm:text-sm`}
                placeholder="Password"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fadeIn">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300 dark:border-gray-700'
                } rounded-md placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-primary focus:border-primary transition-colors duration-200 sm:text-sm`}
                placeholder="Confirm Password"
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fadeIn">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="transform transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Account
            </Button>
          </div>

          <div className="text-sm text-center">
            <p className="text-gray-600 dark:text-gray-400">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="font-medium text-primary hover:text-primary-dark transition-colors duration-200">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-medium text-primary hover:text-primary-dark transition-colors duration-200">
                Privacy Policy
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;