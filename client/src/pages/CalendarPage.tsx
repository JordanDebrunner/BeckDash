/**
 * Calendar Page
 *
 * Main page for displaying and managing the calendar
 */

import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import CalendarGrid from '../components/calendar/CalendarGrid';
import WeekView from '../components/calendar/WeekView';
import DayView from '../components/calendar/DayView';
import AgendaView from '../components/calendar/AgendaView';
import EventModal from '../components/calendar/EventModal';
import Button from '../components/common/Button';
import useCalendar from '../hooks/useCalendar';
import { Event, EventCategory, CreateEventRequest } from '../types/Event';
import { formatDateToLocale, getMonthName, isToday } from '../utils/dateUtils';

/**
 * Calendar page component
 */
const CalendarPage: React.FC = () => {
  // Calendar state and actions
  const {
    currentDate,
    selectedDate,
    view,
    events,
    isLoading,
    error,
    setCurrentDate,
    setSelectedDate,
    setView,
    prevMonth,
    nextMonth,
    goToToday,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useCalendar();

  // Local state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setModalMode('create');
    setSelectedEvent(undefined);
    setIsEventModalOpen(true);
  };

  // Handle event click
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setModalMode('view');
    setIsEventModalOpen(true);
  };

  // Handle edit event
  const handleEditEvent = () => {
    setModalMode('edit');
  };

  // Close event modal
  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
  };

  // Save event
  const handleSaveEvent = async (eventData: CreateEventRequest) => {
    if (modalMode === 'create') {
      await createEvent(eventData);
    } else if (modalMode === 'edit' && selectedEvent) {
      // Use the ID from the event data if available, otherwise use the selectedEvent ID
      const id = eventData.id || selectedEvent.id;
      await updateEvent(id, eventData);
    }

    // Refresh events
    await fetchEvents();
  };

  // Delete event
  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      await deleteEvent(selectedEvent.id);

      // Refresh events
      await fetchEvents();
    }
  };

  // Handle create new event
  const handleCreateEvent = () => {
    setSelectedEvent(undefined);
    setModalMode('create');
    setIsEventModalOpen(true);
  };

  // Calendar view options
  const viewOptions = [
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' },
    { value: 'day', label: 'Day' },
    { value: 'agenda', label: 'Agenda' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Calendar header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Calendar</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your schedule and events
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="primary" onClick={handleCreateEvent}>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Event
            </Button>
          </div>
        </div>

        {/* Calendar navigation and view controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">
                {getMonthName(currentDate)} {currentDate.getFullYear()}
              </h2>

              <div className="flex items-center space-x-2">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Previous month"
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm font-medium rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                >
                  Today
                </button>

                <button
                  onClick={nextMonth}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Next month"
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={view}
                onChange={(e) => setView(e.target.value as any)}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 text-sm"
              >
                {viewOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading and error states */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
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

        {/* Calendar content */}
        {!isLoading && !error && (
          <div className="min-h-[600px]">
            {view === 'month' && (
              <CalendarGrid
                currentDate={currentDate}
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            )}

            {view === 'week' && (
              <WeekView
                currentDate={currentDate}
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            )}

            {view === 'day' && (
              <DayView
                currentDate={currentDate}
                events={events}
                onEventClick={handleEventClick}
              />
            )}

            {view === 'agenda' && (
              <AgendaView
                currentDate={currentDate}
                events={events}
                onEventClick={handleEventClick}
              />
            )}
          </div>
        )}

        {/* Event Modal */}
        <EventModal
          isOpen={isEventModalOpen}
          onClose={handleCloseEventModal}
          onSave={handleSaveEvent}
          onDelete={modalMode === 'edit' ? handleDeleteEvent : undefined}
          event={selectedEvent}
          mode={modalMode}
        />
      </div>
    </Layout>
  );
};

export default CalendarPage;