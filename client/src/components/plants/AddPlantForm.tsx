/**
 * Add Plant Form Component
 * 
 * Form for adding a new plant to the collection
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import plantService from '../../services/plant.service';
import Button from '../common/Button';

interface AddPlantFormProps {
  onClose: () => void;
  onPlantAdded: () => void;
}

const AddPlantForm: React.FC<AddPlantFormProps> = ({ onClose, onPlantAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    location: '',
    lightNeeds: '',
    wateringSchedule: '',
    wateringAmount: '',
    fertilizeSchedule: '',
    notes: '',
    healthStatus: 'Healthy' as 'Healthy' | 'Needs Attention' | 'Danger',
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Plant name is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Calculate next watering date if watering schedule is provided
      let nextWatering = undefined;
      if (formData.wateringSchedule) {
        // Simple logic to set next watering date based on schedule
        // In a real app, this would be more sophisticated
        const match = formData.wateringSchedule.match(/Every\s+(\d+)\s+days?/i);
        if (match && match[1]) {
          const days = parseInt(match[1], 10);
          const date = new Date();
          date.setDate(date.getDate() + days);
          nextWatering = date.toISOString();
        } else if (formData.wateringSchedule.toLowerCase().includes('weekly')) {
          const date = new Date();
          date.setDate(date.getDate() + 7);
          nextWatering = date.toISOString();
        } else if (formData.wateringSchedule.toLowerCase().includes('biweekly')) {
          const date = new Date();
          date.setDate(date.getDate() + 14);
          nextWatering = date.toISOString();
        } else if (formData.wateringSchedule.toLowerCase().includes('monthly')) {
          const date = new Date();
          date.setDate(date.getDate() + 30);
          nextWatering = date.toISOString();
        }
      }
      
      // Calculate next fertilizing date if fertilizing schedule is provided
      let nextFertilizing = undefined;
      if (formData.fertilizeSchedule) {
        // Simple logic to set next fertilizing date based on schedule
        const monthMatch = formData.fertilizeSchedule.match(/Every\s+(\d+)\s+months?/i);
        if (monthMatch && monthMatch[1]) {
          const months = parseInt(monthMatch[1], 10);
          const date = new Date();
          date.setMonth(date.getMonth() + months);
          nextFertilizing = date.toISOString();
        } else if (formData.fertilizeSchedule.toLowerCase().includes('weekly')) {
          const date = new Date();
          date.setDate(date.getDate() + 7);
          nextFertilizing = date.toISOString();
        } else if (formData.fertilizeSchedule.toLowerCase().includes('biweekly')) {
          const date = new Date();
          date.setDate(date.getDate() + 14);
          nextFertilizing = date.toISOString();
        } else if (formData.fertilizeSchedule.toLowerCase().includes('monthly')) {
          const date = new Date();
          date.setMonth(date.getMonth() + 1);
          nextFertilizing = date.toISOString();
        } else if (formData.fertilizeSchedule.toLowerCase().includes('quarterly')) {
          const date = new Date();
          date.setMonth(date.getMonth() + 3);
          nextFertilizing = date.toISOString();
        }
      }
      
      // Create plant
      await plantService.createPlant({
        ...formData,
        nextWatering,
        nextFertilizing
      });
      
      // Notify parent and close form
      onPlantAdded();
      onClose();
      
    } catch (err) {
      console.error('Error adding plant:', err);
      setError('Failed to add plant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Add New Plant</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div>
          <h3 className="text-md font-medium mb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Plant Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            
            <div>
              <label htmlFor="species" className="block text-sm font-medium mb-1">
                Species
              </label>
              <input
                type="text"
                id="species"
                name="species"
                value={formData.species}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., Living Room, Kitchen"
              />
            </div>
            
            <div>
              <label htmlFor="lightNeeds" className="block text-sm font-medium mb-1">
                Light Needs
              </label>
              <input
                type="text"
                id="lightNeeds"
                name="lightNeeds"
                value={formData.lightNeeds}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., Bright indirect, Low light"
              />
            </div>
          </div>
        </div>
        
        {/* Care Information */}
        <div>
          <h3 className="text-md font-medium mb-2">Care Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="wateringSchedule" className="block text-sm font-medium mb-1">
                Watering Schedule
              </label>
              <input
                type="text"
                id="wateringSchedule"
                name="wateringSchedule"
                value={formData.wateringSchedule}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., Every 7 days, Weekly"
              />
            </div>
            
            <div>
              <label htmlFor="wateringAmount" className="block text-sm font-medium mb-1">
                Watering Amount
              </label>
              <input
                type="text"
                id="wateringAmount"
                name="wateringAmount"
                value={formData.wateringAmount}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., 1 cup, Until drainage"
              />
            </div>
            
            <div>
              <label htmlFor="fertilizeSchedule" className="block text-sm font-medium mb-1">
                Fertilizing Schedule
              </label>
              <input
                type="text"
                id="fertilizeSchedule"
                name="fertilizeSchedule"
                value={formData.fertilizeSchedule}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., Monthly, Every 3 months"
              />
            </div>
            
            <div>
              <label htmlFor="healthStatus" className="block text-sm font-medium mb-1">
                Health Status
              </label>
              <select
                id="healthStatus"
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Healthy">Healthy</option>
                <option value="Needs Attention">Needs Attention</option>
                <option value="Danger">Danger</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            rows={3}
            placeholder="Any additional information about your plant..."
          />
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Adding Plant...' : 'Add Plant'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPlantForm; 