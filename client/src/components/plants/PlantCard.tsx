/**
 * Enhanced Plant Card Component
 * 
 * Displays plant information with visual indicators and quick actions
 */

import React, { useState } from 'react';
import { format, parseISO, isAfter } from 'date-fns';
import { Plant } from '../../services/plant.service';
import Button from '../common/Button';
import PlantCareTracker from './PlantCareTracker';

interface PlantCardProps {
  plant: Plant;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, onUpdate, onDelete }) => {
  const [showCareTracker, setShowCareTracker] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Determine status color based on plant health and watering needs
  const getStatusColor = () => {
    if (plant.healthStatus === 'Danger') {
      return 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-900';
    }
    if (plant.healthStatus === 'Needs Attention') {
      return 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-900';
    }
    return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-900';
  };

  // Check if plant needs watering
  const needsWatering = plant.nextWatering && isAfter(new Date(), parseISO(plant.nextWatering));
  
  // Check if plant needs fertilizing
  const needsFertilizing = plant.nextFertilizing && isAfter(new Date(), parseISO(plant.nextFertilizing));

  // Calculate days until next watering
  const getDaysUntilWatering = () => {
    if (!plant.nextWatering) return null;
    
    const now = new Date();
    const nextWatering = parseISO(plant.nextWatering);
    const diffTime = nextWatering.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysUntilWatering = getDaysUntilWatering();

  // Get water indicator style
  const getWaterIndicator = () => {
    if (daysUntilWatering === null) return 'bg-gray-200 dark:bg-gray-700';
    if (daysUntilWatering < 0) return 'bg-red-500';
    if (daysUntilWatering === 0) return 'bg-amber-500';
    if (daysUntilWatering <= 2) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  // Handle care logged event
  const handleCareLogged = () => {
    onUpdate(); // Refresh plant data
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()} transition-all duration-200`}>
      {/* Plant image or icon */}
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-3 border-2 border-gray-200 dark:border-gray-600">
            {plant.image ? (
              <img 
                src={plant.image} 
                alt={plant.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <svg 
                className="w-10 h-10 text-green-500" 
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plant.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{plant.species || 'Unknown species'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            plant.healthStatus === 'Healthy'
              ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
              : plant.healthStatus === 'Needs Attention'
              ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400'
              : 'bg-red-500/10 text-red-500 dark:text-red-400'
          }`}>
            {plant.healthStatus || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Water indicator */}
      <div className="mt-4 mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Water Status</span>
          <span className="text-xs">
            {daysUntilWatering === null ? 'Not scheduled' : 
             daysUntilWatering < 0 ? `Overdue by ${Math.abs(daysUntilWatering)} days` :
             daysUntilWatering === 0 ? 'Due today' :
             `${daysUntilWatering} days left`}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${getWaterIndicator()}`} 
            style={{ 
              width: daysUntilWatering === null ? '100%' : 
                    daysUntilWatering < 0 ? '100%' :
                    `${Math.max(0, 100 - (daysUntilWatering * 10))}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Basic info */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{plant.location || 'Not specified'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Light Needs:</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{plant.lightNeeds || 'Not specified'}</span>
        </div>
        
        {expanded && (
          <>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Watering Schedule:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{plant.wateringSchedule || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Last Watered:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {plant.lastWatered ? format(parseISO(plant.lastWatered), 'MMM d, yyyy') : 'Never'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Next Watering:</span>
              <span className={`text-sm ${needsWatering ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                {plant.nextWatering ? format(parseISO(plant.nextWatering), 'MMM d, yyyy') : 'Not scheduled'} 
                {needsWatering && ' (Overdue)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Fertilize Schedule:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{plant.fertilizeSchedule || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Next Fertilizing:</span>
              <span className={`text-sm ${needsFertilizing ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                {plant.nextFertilizing ? format(parseISO(plant.nextFertilizing), 'MMM d, yyyy') : 'Not scheduled'} 
                {needsFertilizing && ' (Overdue)'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Notes */}
      {plant.notes && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{plant.notes}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setShowCareTracker(!showCareTracker)}
        >
          {showCareTracker ? 'Hide Care Tracker' : 'Care Tracker'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onUpdate}
        >
          Edit
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this plant?')) {
              onDelete(plant.id);
            }
          }}
        >
          Delete
        </Button>
      </div>

      {/* Care tracker */}
      {showCareTracker && (
        <div className="mt-4 border-t pt-4">
          <PlantCareTracker 
            plantId={plant.id} 
            onCareLogged={handleCareLogged}
          />
        </div>
      )}
    </div>
  );
};

export default PlantCard;
