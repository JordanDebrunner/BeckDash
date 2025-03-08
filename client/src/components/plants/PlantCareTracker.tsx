/**
 * Plant Care Tracker Component
 * 
 * Displays plant care history and upcoming care tasks
 */

import React, { useState, useEffect } from 'react';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import plantService, { Plant, PlantCareLog } from '../../services/plant.service';
import Button from '../common/Button';

interface PlantCareTrackerProps {
  plantId: string;
  onCareLogged: () => void;
}

const PlantCareTracker: React.FC<PlantCareTrackerProps> = ({ plantId, onCareLogged }) => {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [careLogs, setCareLogs] = useState<PlantCareLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [careType, setCareType] = useState<'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'other'>('watering');
  const [careDate, setCareDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [careNotes, setCareNotes] = useState('');

  // Fetch plant and care logs
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [plantData, careLogsData] = await Promise.all([
          plantService.getPlant(plantId),
          plantService.getCareLogs(plantId)
        ]);
        setPlant(plantData);
        setCareLogs(careLogsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching plant care data:', err);
        setError('Failed to load plant care data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [plantId]);

  // Handle care log submission
  const handleLogCare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plant) return;
    
    try {
      setIsLoading(true);
      
      // Format date as ISO string
      const dateISO = new Date(`${careDate}T12:00:00`).toISOString();
      
      await plantService.logCare(plantId, {
        plantId,
        careType,
        date: dateISO,
        notes: careNotes
      });
      
      // Reset form
      setCareType('watering');
      setCareDate(format(new Date(), 'yyyy-MM-dd'));
      setCareNotes('');
      setShowLogForm(false);
      
      // Refresh data
      const [plantData, careLogsData] = await Promise.all([
        plantService.getPlant(plantId),
        plantService.getCareLogs(plantId)
      ]);
      setPlant(plantData);
      setCareLogs(careLogsData);
      
      // Notify parent component
      onCareLogged();
      
    } catch (err) {
      console.error('Error logging plant care:', err);
      setError('Failed to log plant care. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate care status
  const getCareStatus = () => {
    if (!plant) return { wateringStatus: 'unknown', fertilizingStatus: 'unknown' };
    
    const now = new Date();
    const wateringDate = plant.nextWatering ? parseISO(plant.nextWatering) : null;
    const fertilizingDate = plant.nextFertilizing ? parseISO(plant.nextFertilizing) : null;
    
    const wateringStatus = !wateringDate ? 'unknown' :
      isAfter(now, wateringDate) ? 'overdue' :
      isAfter(now, addDays(wateringDate, -2)) ? 'soon' : 'ok';
      
    const fertilizingStatus = !fertilizingDate ? 'unknown' :
      isAfter(now, fertilizingDate) ? 'overdue' :
      isAfter(now, addDays(fertilizingDate, -3)) ? 'soon' : 'ok';
      
    return { wateringStatus, fertilizingStatus };
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'text-red-600 dark:text-red-400';
      case 'soon': return 'text-amber-600 dark:text-amber-400';
      case 'ok': return 'text-emerald-600 dark:text-emerald-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (isLoading && !plant) {
    return <div className="p-4 text-center">Loading plant care data...</div>;
  }

  if (error && !plant) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  if (!plant) {
    return <div className="p-4 text-center">Plant not found</div>;
  }

  const { wateringStatus, fertilizingStatus } = getCareStatus();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Plant Care Tracker</h3>
      
      {/* Care Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Watering</h4>
          <div className="flex justify-between items-center">
            <span>Next:</span>
            <span className={getStatusColor(wateringStatus)}>
              {plant.nextWatering 
                ? format(parseISO(plant.nextWatering), 'MMM d, yyyy')
                : 'Not scheduled'}
              {wateringStatus === 'overdue' && ' (Overdue)'}
              {wateringStatus === 'soon' && ' (Soon)'}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span>Last:</span>
            <span>
              {plant.lastWatered 
                ? format(parseISO(plant.lastWatered), 'MMM d, yyyy')
                : 'Never'}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Fertilizing</h4>
          <div className="flex justify-between items-center">
            <span>Next:</span>
            <span className={getStatusColor(fertilizingStatus)}>
              {plant.nextFertilizing 
                ? format(parseISO(plant.nextFertilizing), 'MMM d, yyyy')
                : 'Not scheduled'}
              {fertilizingStatus === 'overdue' && ' (Overdue)'}
              {fertilizingStatus === 'soon' && ' (Soon)'}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span>Last:</span>
            <span>
              {plant.lastFertilized 
                ? format(parseISO(plant.lastFertilized), 'MMM d, yyyy')
                : 'Never'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Log Care Button */}
      <div className="mb-6">
        <Button 
          variant={showLogForm ? "outline" : "primary"} 
          onClick={() => setShowLogForm(!showLogForm)}
          className="w-full"
        >
          {showLogForm ? 'Cancel' : 'Log Care Activity'}
        </Button>
      </div>
      
      {/* Care Log Form */}
      {showLogForm && (
        <form onSubmit={handleLogCare} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Care Type</label>
            <select
              value={careType}
              onChange={(e) => setCareType(e.target.value as any)}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              required
            >
              <option value="watering">Watering</option>
              <option value="fertilizing">Fertilizing</option>
              <option value="pruning">Pruning</option>
              <option value="repotting">Repotting</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={careDate}
              onChange={(e) => setCareDate(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={careNotes}
              onChange={(e) => setCareNotes(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              rows={3}
            />
          </div>
          
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Care Log'}
          </Button>
        </form>
      )}
      
      {/* Care History */}
      <div>
        <h4 className="text-md font-medium mb-3">Care History</h4>
        {careLogs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No care activities logged yet
          </p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {careLogs
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(log => (
                <div key={log.id} className="border-l-4 pl-3 py-1" 
                  style={{ 
                    borderColor: 
                      log.careType === 'watering' ? '#3b82f6' : 
                      log.careType === 'fertilizing' ? '#10b981' :
                      log.careType === 'pruning' ? '#8b5cf6' :
                      log.careType === 'repotting' ? '#f59e0b' : '#6b7280'
                  }}
                >
                  <div className="flex justify-between">
                    <span className="font-medium capitalize">{log.careType}</span>
                    <span className="text-sm text-gray-500">
                      {format(parseISO(log.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {log.notes}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantCareTracker; 