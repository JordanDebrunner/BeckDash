/**
 * Event Modal Component
 *
 * Modal for creating and editing calendar events
 */

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Event, EventCategory, RecurrenceType, CreateEventRequest } from '../../types/Event';
import CategoryBadge from './CategoryBadge';

// Event form state interface
interface EventFormState {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  location: string;
  category: EventCategory;
  color: string;
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  reminderTime: number | null;
  endType: 'never' | 'after' | 'on';
  endAfterOccurrences: number;
  endOnDate: string;
}

// Helper function to convert ISO date to local date and time
const isoToLocalDateTime = (isoString: string): { date: string; time: string } => {
  const date = new Date(isoString);
  return {
    date: date.toISOString().split('T')[0],
    time: date.toTimeString().slice(0, 5)
  };
};

// Helper function to combine date and time strings into a full date object
const combineDateAndTime = (dateString: string, timeString: string): Date => {
  // Parse the date and time components
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create a date object with the local timezone
  const date = new Date();
  date.setFullYear(year, month - 1, day);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Default event form values
const defaultEventForm: EventFormState = {
  title: '',
  description: '',
  startDate: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endDate: new Date().toISOString().split('T')[0],
  endTime: '10:00',
  allDay: false,
  location: '',
  category: 'default',
  color: '',
  isRecurring: false,
  recurrenceType: 'none',
  recurrenceInterval: 1,
  reminderTime: 30,
  endType: 'never',
  endAfterOccurrences: 10,
  endOnDate: new Date().toISOString().split('T')[0],
};

// Props interface
interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: CreateEventRequest) => Promise<void>;
  onDelete?: () => Promise<void>;
  event?: Event;
  mode: 'create' | 'edit' | 'view';
}

/**
 * Event Modal component
 */
const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  mode,
}) => {
  // State for the event form
  const [formData, setFormData] = useState<EventFormState>(defaultEventForm);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when event changes
  useEffect(() => {
    if (event) {
      try {
        const startDateTime = isoToLocalDateTime(event.startDate);
        const endDateTime = isoToLocalDateTime(event.endDate);

        setFormData({
          title: event.title,
          description: event.description || '',
          startDate: startDateTime.date,
          startTime: startDateTime.time,
          endDate: endDateTime.date,
          endTime: endDateTime.time,
          allDay: event.allDay,
          location: event.location || '',
          category: (event.category as EventCategory) || 'default',
          color: event.color || '',
          isRecurring: event.isRecurring,
          recurrenceType: event.recurrence?.type || 'none',
          recurrenceInterval: event.recurrence?.interval || 1,
          reminderTime: event.reminderTime || null,
          endType: 'never',
          endAfterOccurrences: 10,
          endOnDate: event.endDate,
        });
      } catch (error) {
        console.error('Error parsing event dates:', error);
        // Fall back to default form values if there's an error parsing dates
        setFormData({
          ...defaultEventForm,
          title: event.title,
          description: event.description || '',
        });
      }
    } else {
      // Set default dates for new events
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      setFormData({
        ...defaultEventForm,
        startDate: now.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      });
    }
  }, [event]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'radio' && name === 'endType') {
      setFormData(prev => ({ ...prev, endType: value as 'never' | 'after' | 'on' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for the field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Date validation
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    // Validate that end date is not before start date
    if (formData.startDate && formData.endDate) {
      try {
        const startDateTime = combineDateAndTime(formData.startDate, formData.startTime);
        const endDateTime = combineDateAndTime(formData.endDate, formData.endTime);

        if (endDateTime < startDateTime) {
          newErrors.endDate = 'End date cannot be before start date';
        }
      } catch (error) {
        console.error('Error validating dates:', error);
        newErrors.startDate = 'Invalid date format';
      }
    }

    // Validate recurrence settings if event is recurring
    if (formData.isRecurring) {
      if (formData.recurrenceType === 'none') {
        newErrors.recurrenceType = 'Please select a recurrence type';
      }
      
      if (formData.recurrenceInterval < 1) {
        newErrors.recurrenceInterval = 'Interval must be at least 1';
      } else if (formData.recurrenceInterval > 99) {
        newErrors.recurrenceInterval = 'Interval must be less than 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create event data payload - properly format dates
      const startDateTime = combineDateAndTime(formData.startDate, formData.startTime);
      const endDateTime = combineDateAndTime(formData.endDate, formData.endTime);

      const eventData: CreateEventRequest = {
        ...(mode === 'edit' && event?.id && { id: event.id }),
        title: formData.title,
        description: formData.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        allDay: formData.allDay,
        location: formData.location,
        category: formData.category,
        color: formData.color,
        isRecurring: formData.isRecurring,
        reminderTime: formData.reminderTime !== null ? formData.reminderTime : undefined,
        ...(formData.isRecurring && {
          recurrence: {
            type: formData.recurrenceType,
            interval: formData.recurrenceInterval,
          },
        }),
      };

      await onSave(eventData);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      setErrors({ submit: 'Failed to save event. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!onDelete) return;

    setIsLoading(true);

    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting event:', error);
      setErrors({ submit: 'Failed to delete event. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine modal title based on mode
  const modalTitle = mode === 'create'
    ? 'Create Event'
    : mode === 'edit'
      ? 'Edit Event'
      : 'Event Details';

  // Event categories
  const categories: EventCategory[] = [
    'default',
    'work',
    'personal',
    'family',
    'health',
    'finance',
    'travel',
    'education',
    'other',
  ];

  // Recurrence types
  const recurrenceTypes = [
    { value: 'none', label: 'None' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  // Reminder options
  const reminderOptions = [
    { value: null, label: 'No reminder' },
    { value: 0, label: 'At time of event' },
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 120, label: '2 hours before' },
    { value: 1440, label: '1 day before' },
  ];

  // Modal footer with action buttons
  const modalFooter = (
    <div className="flex justify-end space-x-2">
      {mode !== 'view' && (
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      )}

      {mode === 'view' && (
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      )}

      {mode === 'edit' && onDelete && (
        <Button
          variant="danger"
          onClick={handleDelete}
          isLoading={isLoading}
        >
          Delete
        </Button>
      )}

      {mode !== 'view' && (
        <Button
          variant="primary"
          type="submit"
          form="event-form"
          isLoading={isLoading}
        >
          Save
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={modalFooter}
      size="lg"
    >
      {errors.submit && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Title field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.title ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm`}
            disabled={mode === 'view'}
            required
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Date and time fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <div className="mt-1 flex space-x-2">
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`block w-full rounded-md border ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm`}
                disabled={mode === 'view'}
                required
              />
              {!formData.allDay && (
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="block w-32 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm"
                  disabled={mode === 'view'}
                />
              )}
            </div>
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <div className="mt-1 flex space-x-2">
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`block w-full rounded-md border ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm`}
                disabled={mode === 'view'}
                required
              />
              {!formData.allDay && (
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="block w-32 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm"
                  disabled={mode === 'view'}
                />
              )}
            </div>
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* All day toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allDay"
            name="allDay"
            checked={formData.allDay}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            disabled={mode === 'view'}
          />
          <label htmlFor="allDay" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            All day event
          </label>
        </div>

        {/* Location field */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm"
            disabled={mode === 'view'}
          />
        </div>

        {/* Description field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm"
            disabled={mode === 'view'}
          />
        </div>

        {/* Category selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm"
            disabled={mode === 'view'}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <div className="mt-2">
            <CategoryBadge category={formData.category} />
          </div>
        </div>

        {/* Recurring event toggle */}
        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              disabled={mode === 'view'}
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Recurring event
            </label>
          </div>

          {formData.isRecurring && (
            <div className="mt-2 pl-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="recurrenceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Repeat
                  </label>
                  <select
                    id="recurrenceType"
                    name="recurrenceType"
                    value={formData.recurrenceType}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.recurrenceType ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm`}
                    disabled={mode === 'view'}
                  >
                    {recurrenceTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.recurrenceType && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.recurrenceType}</p>
                  )}
                </div>

                {formData.recurrenceType !== 'none' && (
                  <div>
                    <label htmlFor="recurrenceInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Interval
                    </label>
                    <div className="mt-1 flex items-center">
                      <span className="mr-2">Every</span>
                      <input
                        type="number"
                        id="recurrenceInterval"
                        name="recurrenceInterval"
                        value={formData.recurrenceInterval}
                        onChange={handleChange}
                        min={1}
                        max={99}
                        className={`block w-16 rounded-md border ${
                          errors.recurrenceInterval ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm`}
                        disabled={mode === 'view'}
                      />
                      <span className="ml-2">
                        {formData.recurrenceType === 'daily' ? 'days' : ''}
                        {formData.recurrenceType === 'weekly' ? 'weeks' : ''}
                        {formData.recurrenceType === 'monthly' ? 'months' : ''}
                        {formData.recurrenceType === 'yearly' ? 'years' : ''}
                      </span>
                    </div>
                    {errors.recurrenceInterval && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.recurrenceInterval}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Additional recurrence options */}
              {formData.recurrenceType === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Repeat on
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          // This is just a UI placeholder - would need state to track selected days
                          index === new Date().getDay() 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                        disabled={mode === 'view'}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* End recurrence options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ends
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="endNever"
                      name="endType"
                      value="never"
                      checked={formData.endType === 'never'}
                      onChange={handleChange}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      disabled={mode === 'view'}
                    />
                    <label htmlFor="endNever" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Never
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="endAfter"
                      name="endType"
                      value="after"
                      checked={formData.endType === 'after'}
                      onChange={handleChange}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      disabled={mode === 'view'}
                    />
                    <label htmlFor="endAfter" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      After
                    </label>
                    <input
                      type="number"
                      name="endAfterOccurrences"
                      value={formData.endAfterOccurrences}
                      onChange={handleChange}
                      className="ml-2 w-16 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm"
                      min={1}
                      disabled={mode === 'view' || formData.endType !== 'after'}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">occurrences</span>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="endOn"
                      name="endType"
                      value="on"
                      checked={formData.endType === 'on'}
                      onChange={handleChange}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                      disabled={mode === 'view'}
                    />
                    <label htmlFor="endOn" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      On
                    </label>
                    <input
                      type="date"
                      name="endOnDate"
                      value={formData.endOnDate}
                      onChange={handleChange}
                      className="ml-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm"
                      disabled={mode === 'view' || formData.endType !== 'on'}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reminder selection */}
        <div>
          <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reminder
          </label>
          <select
            id="reminderTime"
            name="reminderTime"
            value={formData.reminderTime === null ? 'null' : formData.reminderTime.toString()}
            onChange={e => {
              const value = e.target.value === 'null' ? null : 
                            Number.isNaN(parseInt(e.target.value, 10)) ? null : parseInt(e.target.value, 10);
              setFormData(prev => ({ ...prev, reminderTime: value }));
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm"
            disabled={mode === 'view'}
          >
            {reminderOptions.map(option => (
              <option key={option.label} value={option.value === null ? 'null' : option.value.toString()}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
};

export default EventModal;