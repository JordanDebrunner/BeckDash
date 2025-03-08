/**
 * Day View Component
 *
 * Displays a day view of the calendar with hourly slots
 */

import React, { useMemo } from 'react';
import { Event } from '../../types/Event';
import { format, isSameDay, addHours, startOfDay } from 'date-fns';

interface DayViewProps {
  currentDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

/**
 * Day view component
 */
const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  onEventClick,
}) => {
  // Generate hours of the day (0-23)
  const hours = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const date = startOfDay(currentDate);
      return addHours(date, i);
    });
  }, [currentDate]);

  // Filter events for the current day
  const dayEvents = useMemo(() => {
    return events.filter(event => {
      try {
        const eventStart = new Date(event.startDate);
        return isSameDay(eventStart, currentDate);
      } catch (error) {
        console.error('Error processing event date:', error, event);
        return false;
      }
    });
  }, [events, currentDate]);

  // Group events by hour
  const eventsByHour = useMemo(() => {
    const grouped: Record<number, Event[]> = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      grouped[i] = [];
    }

    dayEvents.forEach(event => {
      try {
        const eventStart = new Date(event.startDate);
        const hour = eventStart.getHours();
        grouped[hour].push(event);
      } catch (error) {
        console.error('Error grouping event by hour:', error, event);
      }
    });

    return grouped;
  }, [dayEvents]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Day header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
      </div>

      {/* Day timeline */}
      <div className="overflow-y-auto max-h-[600px]">
        {hours.map((hour, index) => {
          const hourEvents = eventsByHour[index] || [];
          
          return (
            <div 
              key={index}
              className="flex border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              {/* Hour label */}
              <div className="w-20 p-2 text-right text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                {format(hour, 'h a')}
              </div>
              
              {/* Events for this hour */}
              <div className="flex-1 min-h-[60px] p-1">
                {hourEvents.map(event => (
                  <div
                    key={event.id}
                    className="px-2 py-1 text-sm truncate mb-1 rounded cursor-pointer"
                    style={{
                      backgroundColor: event.color || `var(--color-category-${event.category || 'default'})`,
                      color: '#fff'
                    }}
                    onClick={() => onEventClick(event)}
                  >
                    <span className="text-xs opacity-90">
                      {format(new Date(event.startDate), 'h:mm a')}
                    </span>
                    <span className="ml-1">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayView; 