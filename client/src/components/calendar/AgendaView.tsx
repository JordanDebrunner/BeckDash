/**
 * Agenda View Component
 *
 * Displays events in a list format grouped by date
 */

import React, { useMemo } from 'react';
import { Event } from '../../types/Event';
import { format, isSameDay, addDays, startOfDay, isToday, isFuture } from 'date-fns';
import CategoryBadge from './CategoryBadge';

interface AgendaViewProps {
  currentDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
}

/**
 * Agenda view component
 */
const AgendaView: React.FC<AgendaViewProps> = ({
  currentDate,
  events,
  onEventClick,
}) => {
  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    
    // Sort events by start date
    const sortedEvents = [...events].sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    // Group events by date
    sortedEvents.forEach(event => {
      try {
        const eventStart = new Date(event.startDate);
        const dateKey = format(eventStart, 'yyyy-MM-dd');
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        
        grouped[dateKey].push(event);
      } catch (error) {
        console.error('Error grouping event by date:', error, event);
      }
    });

    return grouped;
  }, [events]);

  // Get dates to display (current date + next 14 days)
  const datesToDisplay = useMemo(() => {
    const dates: Date[] = [];
    const startDate = startOfDay(currentDate);
    
    for (let i = 0; i < 15; i++) {
      dates.push(addDays(startDate, i));
    }
    
    return dates;
  }, [currentDate]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Upcoming Events
        </h2>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {datesToDisplay.map((date, dateIndex) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const dateEvents = eventsByDate[dateKey] || [];
          
          // Skip dates with no events
          if (dateEvents.length === 0) {
            return null;
          }
          
          return (
            <div key={dateIndex} className="p-4">
              <div className={`mb-2 font-medium ${
                isToday(date) 
                  ? 'text-primary' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {isToday(date) ? 'Today' : format(date, 'EEEE, MMMM d, yyyy')}
              </div>
              
              <div className="space-y-2">
                {dateEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </div>
                      <CategoryBadge category={event.category || 'default'} />
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {event.allDay ? (
                        'All day'
                      ) : (
                        `${format(new Date(event.startDate), 'h:mm a')} - ${format(new Date(event.endDate), 'h:mm a')}`
                      )}
                    </div>
                    
                    {event.location && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {/* If no events found */}
        {Object.keys(eventsByDate).length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No upcoming events found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaView; 