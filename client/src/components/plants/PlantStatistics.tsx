/**
 * Plant Statistics Component
 * 
 * Displays statistics and insights about plant collection
 */

import React, { useState, useEffect } from 'react';
import { Plant } from '../../services/plant.service';
import { parseISO, isAfter, format, differenceInDays } from 'date-fns';

interface PlantStatisticsProps {
  plants: Plant[];
}

const PlantStatistics: React.FC<PlantStatisticsProps> = ({ plants }) => {
  const [stats, setStats] = useState({
    totalPlants: 0,
    healthyPlants: 0,
    needsAttentionPlants: 0,
    dangerPlants: 0,
    needsWateringToday: 0,
    needsWateringThisWeek: 0,
    needsFertilizingThisWeek: 0,
    mostCommonLocation: '',
    longestWithoutWatering: { name: '', days: 0 },
  });

  useEffect(() => {
    if (!plants.length) return;

    // Count plants by health status
    const healthyPlants = plants.filter(p => p.healthStatus === 'Healthy').length;
    const needsAttentionPlants = plants.filter(p => p.healthStatus === 'Needs Attention').length;
    const dangerPlants = plants.filter(p => p.healthStatus === 'Danger').length;

    // Count plants needing water
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const needsWateringToday = plants.filter(p => {
      if (!p.nextWatering) return false;
      const waterDate = parseISO(p.nextWatering);
      return (
        waterDate.getDate() === today.getDate() &&
        waterDate.getMonth() === today.getMonth() &&
        waterDate.getFullYear() === today.getFullYear()
      );
    }).length;

    const needsWateringThisWeek = plants.filter(p => {
      if (!p.nextWatering) return false;
      const waterDate = parseISO(p.nextWatering);
      return waterDate <= nextWeek && waterDate >= today;
    }).length;

    const needsFertilizingThisWeek = plants.filter(p => {
      if (!p.nextFertilizing) return false;
      const fertilizeDate = parseISO(p.nextFertilizing);
      return fertilizeDate <= nextWeek && fertilizeDate >= today;
    }).length;

    // Find most common location
    const locationCounts: Record<string, number> = {};
    plants.forEach(p => {
      if (p.location) {
        locationCounts[p.location] = (locationCounts[p.location] || 0) + 1;
      }
    });

    let mostCommonLocation = '';
    let maxCount = 0;
    Object.entries(locationCounts).forEach(([location, count]) => {
      if (count > maxCount) {
        mostCommonLocation = location;
        maxCount = count;
      }
    });

    // Find plant that hasn't been watered for the longest time
    let longestWithoutWatering = { name: '', days: 0 };
    plants.forEach(p => {
      if (p.lastWatered) {
        const lastWateredDate = parseISO(p.lastWatered);
        const daysSinceWatering = differenceInDays(today, lastWateredDate);
        if (daysSinceWatering > longestWithoutWatering.days) {
          longestWithoutWatering = {
            name: p.name,
            days: daysSinceWatering
          };
        }
      }
    });

    setStats({
      totalPlants: plants.length,
      healthyPlants,
      needsAttentionPlants,
      dangerPlants,
      needsWateringToday,
      needsWateringThisWeek,
      needsFertilizingThisWeek,
      mostCommonLocation,
      longestWithoutWatering,
    });
  }, [plants]);

  // Calculate percentages for health status
  const healthyPercentage = stats.totalPlants ? Math.round((stats.healthyPlants / stats.totalPlants) * 100) : 0;
  const attentionPercentage = stats.totalPlants ? Math.round((stats.needsAttentionPlants / stats.totalPlants) * 100) : 0;
  const dangerPercentage = stats.totalPlants ? Math.round((stats.dangerPlants / stats.totalPlants) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Plant Collection Insights</h2>
      
      {/* Health Status */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Plant Health</h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-1">
          <div className="flex h-4 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500" 
              style={{ width: `${healthyPercentage}%` }}
              title={`Healthy: ${stats.healthyPlants} plants (${healthyPercentage}%)`}
            ></div>
            <div 
              className="bg-amber-500" 
              style={{ width: `${attentionPercentage}%` }}
              title={`Needs Attention: ${stats.needsAttentionPlants} plants (${attentionPercentage}%)`}
            ></div>
            <div 
              className="bg-red-500" 
              style={{ width: `${dangerPercentage}%` }}
              title={`Danger: ${stats.dangerPlants} plants (${dangerPercentage}%)`}
            ></div>
          </div>
        </div>
        <div className="flex text-xs justify-between">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block mr-1"></span>
            <span>Healthy: {stats.healthyPlants}</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-amber-500 rounded-full inline-block mr-1"></span>
            <span>Needs Attention: {stats.needsAttentionPlants}</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1"></span>
            <span>Danger: {stats.dangerPlants}</span>
          </div>
        </div>
      </div>
      
      {/* Care Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Watering</h3>
          <div className="flex justify-between items-center">
            <span>Today:</span>
            <span className="font-medium">{stats.needsWateringToday} plants</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span>This week:</span>
            <span className="font-medium">{stats.needsWateringThisWeek} plants</span>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Fertilizing</h3>
          <div className="flex justify-between items-center">
            <span>This week:</span>
            <span className="font-medium">{stats.needsFertilizingThisWeek} plants</span>
          </div>
        </div>
      </div>
      
      {/* Interesting Facts */}
      <div className="space-y-3">
        <h3 className="text-md font-medium mb-2">Plant Facts</h3>
        
        {stats.mostCommonLocation && (
          <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
            <span>Most plants are in the <strong>{stats.mostCommonLocation}</strong></span>
          </div>
        )}
        
        {stats.longestWithoutWatering.name && (
          <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
            </svg>
            <span>
              <strong>{stats.longestWithoutWatering.name}</strong> hasn't been watered for {stats.longestWithoutWatering.days} days
            </span>
          </div>
        )}
        
        {plants.length > 0 && (
          <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <svg className="w-5 h-5 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            <span>
              You're taking care of <strong>{stats.totalPlants} plants</strong> - great job!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantStatistics; 