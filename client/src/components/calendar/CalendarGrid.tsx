/**
 * Calendar Grid Component
 *
 * Displays a monthly calendar grid with events
 */

import React, { useMemo } from 'react';
import { Event } from '../../types/Event';
import {
  isToday,
  isSameMonth,
  getMonthName,
  getCalendarDays,
} from '@utils/dateUtils';
import CategoryBadge from './CategoryBadge';

// Props interface
interface CalendarGridProps {
  currentDate: Date;
  events: Event[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
}

/**
 * Calendar Grid component
 */
const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  events,
  onDateClick,
  onEventClick,
}) => {
  // Get day names for the header
  const dayNames = useMemo(() => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }, []);

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    return getCalendarDays(currentDate);
  }, [currentDate]);

  // Group events by date for easier lookup
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {};

    events.forEach(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      // Create entries for each day the event spans
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }

        grouped[dateKey].push(event);

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return grouped;
  }, [events]);

  // Get events for a specific date
  const getEventsForDate = (date: Date): Event[] => {
    const dateKey = date.toISOString().split('T')[0];
    return eventsByDate[dateKey] || [];
  };

  // Render a maximum of 3 events per day, with a "+X more" indicator if needed
  const renderEventsForDate = (date: Date) => {
    const dateEvents = getEventsForDate(date);
    const maxVisible = 3;
    const visibleEvents = dateEvents.slice(0, maxVisible);
    const remainingCount = dateEvents.length - maxVisible;

    return (
      <>
        {visibleEvents.map(event => (
          <div
            key={event.id}
            className="px-1 py-0.5 text-xs truncate mb-1 rounded cursor-pointer"
            style={{
              backgroundColor: event.color || `var(--color-category-${event.category || 'default'})`,
              color: '#fff'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
          >
            {event.title}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            +{remainingCount} more
          </div>
        )}
      </>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Calendar header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {getMonthName(currentDate)} {currentDate.getFullYear()}
        </h2>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`py-2 text-center text-sm font-medium ${
              index === 0 || index === 6
                ? 'text-red-500 dark:text-red-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days grid */}
      <div className="grid grid-cols-7 grid-rows-6 h-full">
        {calendarDays.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={index}
              className={`min-h-24 p-1 border border-gray-200 dark:border-gray-700 ${
                isCurrentMonth
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              } ${isCurrentDay ? 'ring-2 ring-primary ring-inset' : ''}`}
              onClick={() => onDateClick(date)}
            >
              {/* Date number */}
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center ${
                    isCurrentDay
                      ? 'bg-primary text-white'
                      : ''
                  }`}
                >
                  {date.getDate()}
                </span>

                {/* Date indicator for today */}
                {isCurrentDay && (
                  <span className="text-xs text-primary dark:text-primary-300 font-medium">
                    Today
                  </span>
                )}
              </div>

              {/* Events for this date */}
              <div className="mt-1 space-y-1 overflow-y-auto max-h-20">
                {renderEventsForDate(date)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;