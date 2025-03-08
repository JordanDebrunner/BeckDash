/**
 * Week View Component
 *
 * Displays a week view of the calendar
 */

import React, { useMemo } from 'react';
import { Event } from '../../types/Event';
import { addDays, format, startOfWeek, isSameDay } from 'date-fns';
import CategoryBadge from './CategoryBadge';

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onDateClick: (date: Date) => void;
}

/**
 * Week view component
 */
const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onDateClick,
}) => {
  // Get the start of the week (Sunday)
  const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);

  // Generate the days of the week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    
    weekDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      grouped[dateKey] = [];
    });

    events.forEach(event => {
      try {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        
        // Check if the event falls within the current week
        for (const day of weekDays) {
          if (isSameDay(day, startDate) || 
              (startDate <= day && day <= endDate)) {
            const dateKey = format(day, 'yyyy-MM-dd');
            grouped[dateKey].push(event);
          }
        }
      } catch (error) {
        console.error('Error processing event dates:', error, event);
      }
    });

    return grouped;
  }, [events, weekDays]);

  // Get events for a specific day
  const getEventsForDay = (day: Date): Event[] => {
    try {
      const dateKey = format(day, 'yyyy-MM-dd');
      return eventsByDay[dateKey] || [];
    } catch (error) {
      console.error('Error getting events for day:', error);
      return [];
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Week header */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="py-2 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {format(day, 'EEE')}
            </div>
            <div className="text-sm font-medium">
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 h-96 overflow-y-auto">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={index}
              className={`min-h-full border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => onDateClick(day)}
            >
              {/* Events for this day */}
              <div className="p-1 space-y-1">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="px-2 py-1 text-sm truncate rounded cursor-pointer"
                    style={{
                      backgroundColor: event.color || `var(--color-category-${event.category || 'default'})`,
                      color: '#fff'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    {!event.allDay && (
                      <span className="text-xs opacity-90">
                        {format(new Date(event.startDate), 'h:mm a')}
                      </span>
                    )}
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

export default WeekView; 