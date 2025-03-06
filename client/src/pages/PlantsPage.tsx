/**
 * Plants Page
 *
 * Page for plant care tracking and management
 */

import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import { formatDateToLocale } from '../utils/dateUtils';

// Mock plant data (will be replaced with API calls)
const mockPlants = [
  {
    id: '1',
    name: 'Fiddle Leaf Fig',
    species: 'Ficus lyrata',
    image: null,
    wateringSchedule: 'Every 7 days',
    lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    nextWatering: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    fertilizeSchedule: 'Monthly during growing season',
    lastFertilized: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    nextFertilizing: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    location: 'Living Room',
    lightNeeds: 'Bright indirect light',
    notes: 'Showing new growth on top branches',
    healthStatus: 'Healthy',
  },
  {
    id: '2',
    name: 'Snake Plant',
    species: 'Sansevieria trifasciata',
    image: null,
    wateringSchedule: 'Every 14 days',
    lastWatered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    nextWatering: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    fertilizeSchedule: 'Every 3 months',
    lastFertilized: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    nextFertilizing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    location: 'Bedroom',
    lightNeeds: 'Low to medium light',
    notes: 'Thriving in current location',
    healthStatus: 'Healthy',
  },
  {
    id: '3',
    name: 'Monstera',
    species: 'Monstera deliciosa',
    image: null,
    wateringSchedule: 'Every 7 days',
    lastWatered: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    nextWatering: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (needs water)
    fertilizeSchedule: 'Monthly during growing season',
    lastFertilized: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    nextFertilizing: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    location: 'Office',
    lightNeeds: 'Bright indirect light',
    notes: 'Some brown spots on lower leaves',
    healthStatus: 'Needs Attention',
  },
  {
    id: '4',
    name: 'Peace Lily',
    species: 'Spathiphyllum',
    image: null,
    wateringSchedule: 'Every 5 days',
    lastWatered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    nextWatering: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (needs water)
    fertilizeSchedule: 'Every 2 months',
    lastFertilized: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    nextFertilizing: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    location: 'Bathroom',
    lightNeeds: 'Low to medium light',
    notes: 'Leaves drooping, needs water urgently',
    healthStatus: 'Danger',
  },
];

/**
 * PlantCard component for displaying individual plants
 */
const PlantCard: React.FC<{ plant: any }> = ({ plant }) => {
  // Determine status color based on watering needs
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
  const needsWatering = new Date(plant.nextWatering) <= new Date();

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plant.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{plant.species}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            plant.healthStatus === 'Healthy'
              ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
              : plant.healthStatus === 'Needs Attention'
              ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400'
              : 'bg-red-500/10 text-red-500 dark:text-red-400'
          }`}>
            {plant.healthStatus}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{plant.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Light Needs:</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{plant.lightNeeds}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Watering Schedule:</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{plant.wateringSchedule}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Last Watered:</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{formatDateToLocale(plant.lastWatered)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Next Watering:</span>
          <span className={`text-sm ${needsWatering ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
            {formatDateToLocale(plant.nextWatering)} {needsWatering && '(Overdue)'}
          </span>
        </div>
      </div>

      {plant.notes && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{plant.notes}</p>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <Button variant="outline" size="sm">
          Log Care
        </Button>
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      </div>
    </div>
  );
};

/**
 * Plants page component
 */
const PlantsPage: React.FC = () => {
  // Local state
  const [plants, setPlants] = useState(mockPlants);
  const [filter, setFilter] = useState('all'); // all, needs-water, needs-attention
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter plants based on selected filter and search query
  const filteredPlants = plants.filter(plant => {
    // Apply status filter
    if (filter === 'needs-water' && new Date(plant.nextWatering) > new Date()) {
      return false;
    }
    if (filter === 'needs-attention' && plant.healthStatus === 'Healthy') {
      return false;
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        plant.name.toLowerCase().includes(query) ||
        plant.species.toLowerCase().includes(query) ||
        plant.location.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Plants header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Plants</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your plant care and watering schedule
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="primary" onClick={() => {}}>
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
              Add Plant
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full sm:w-64">
              <label htmlFor="search" className="sr-only">
                Search plants
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  placeholder="Search plants..."
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('all')}
              >
                All Plants
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === 'needs-water'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('needs-water')}
              >
                Needs Water
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === 'needs-attention'
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                onClick={() => setFilter('needs-attention')}
              >
                Needs Attention
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* No plants message */}
        {!isLoading && filteredPlants.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No plants found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'No plants match your search criteria.'
                : filter === 'needs-water'
                ? 'All your plants are watered!'
                : filter === 'needs-attention'
                ? 'All your plants are healthy!'
                : 'Get started by adding your first plant.'}
            </p>
            {filter !== 'all' && (
              <button
                className="mt-4 text-sm text-primary hover:text-primary-dark"
                onClick={() => setFilter('all')}
              >
                View all plants
              </button>
            )}
          </div>
        )}

        {/* Plants grid */}
        {!isLoading && filteredPlants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        )}

        {/* Implementation note for future development */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Development Note
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                This page currently displays mock data. In a production version, it would connect to the backend API for plant management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlantsPage;