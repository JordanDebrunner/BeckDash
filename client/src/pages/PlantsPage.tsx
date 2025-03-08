/**
 * Plants Page
 *
 * Page for plant care tracking and management
 */

import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import PlantCard from '../components/plants/PlantCard';
import PlantStatistics from '../components/plants/PlantStatistics';
import AddPlantForm from '../components/plants/AddPlantForm';
import EditPlantForm from '../components/plants/EditPlantForm';
import plantService, { Plant } from '../services/plant.service';
import { parseISO, isAfter } from 'date-fns';

/**
 * Plants page component
 */
const PlantsPage: React.FC = () => {
  // Local state
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filter, setFilter] = useState('all'); // all, needs-water, needs-attention, needs-fertilizer
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPlant, setCurrentPlant] = useState<Plant | null>(null);
  const [showStatistics, setShowStatistics] = useState(true);

  // Fetch plants on component mount
  useEffect(() => {
    fetchPlants();
  }, []);

  // Fetch plants from API
  const fetchPlants = async () => {
    setIsLoading(true);
    try {
      const fetchedPlants = await plantService.getPlants();
      setPlants(fetchedPlants);
      setError(null);
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError('Failed to load plants. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle plant deletion
  const handleDeletePlant = async (id: string) => {
    try {
      setIsLoading(true);
      await plantService.deletePlant(id);
      setPlants(plants.filter(plant => plant.id !== id));
    } catch (err) {
      console.error('Error deleting plant:', err);
      setError('Failed to delete plant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit plant click
  const handleEditClick = (plant: Plant) => {
    setCurrentPlant(plant);
    setShowEditModal(true);
  };

  // Filter plants based on selected filter and search query
  const filteredPlants = plants.filter(plant => {
    const today = new Date();
    
    // Apply status filter
    if (filter === 'needs-water' && (!plant.nextWatering || !isAfter(today, parseISO(plant.nextWatering)))) {
      return false;
    }
    if (filter === 'needs-fertilizer' && (!plant.nextFertilizing || !isAfter(today, parseISO(plant.nextFertilizing)))) {
      return false;
    }
    if (filter === 'needs-attention' && plant.healthStatus !== 'Needs Attention' && plant.healthStatus !== 'Danger') {
      return false;
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        plant.name.toLowerCase().includes(query) ||
        (plant.species && plant.species.toLowerCase().includes(query)) ||
        (plant.location && plant.location.toLowerCase().includes(query))
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
            <Button 
              variant="outline" 
              onClick={() => setShowStatistics(!showStatistics)}
            >
              {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setShowAddModal(true)}
            >
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

        {/* Statistics Section */}
        {showStatistics && (
          <div className="mb-6">
            <PlantStatistics plants={plants} />
          </div>
        )}

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
                  className="pl-10 w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Search plants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setFilter('all')}
              >
                All Plants
              </button>
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filter === 'needs-water'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setFilter('needs-water')}
              >
                Needs Water
              </button>
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filter === 'needs-fertilizer'
                    ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setFilter('needs-fertilizer')}
              >
                Needs Fertilizer
              </button>
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filter === 'needs-attention'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-700 dark:text-amber-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setFilter('needs-attention')}
              >
                Needs Attention
              </button>
            </div>
          </div>
        </div>

        {/* Plants grid */}
        {isLoading && plants.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading plants...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
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
            <p className="mt-4 text-red-500">{error}</p>
            <button
              className="mt-4 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              onClick={fetchPlants}
            >
              Try Again
            </button>
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="text-center py-12">
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
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'No plants match your search criteria'
                : filter !== 'all'
                ? 'No plants match the selected filter'
                : 'No plants found. Add your first plant to get started!'}
            </p>
            {(searchQuery || filter !== 'all') && (
              <button
                className="mt-4 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlants.map((plant) => (
              <PlantCard 
                key={plant.id} 
                plant={plant} 
                onUpdate={() => handleEditClick(plant)}
                onDelete={handleDeletePlant}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Plant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <AddPlantForm 
              onClose={() => setShowAddModal(false)}
              onPlantAdded={fetchPlants}
            />
          </div>
        </div>
      )}

      {/* Edit Plant Modal */}
      {showEditModal && currentPlant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <EditPlantForm 
              plant={currentPlant}
              onClose={() => {
                setShowEditModal(false);
                setCurrentPlant(null);
              }}
              onPlantUpdated={fetchPlants}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PlantsPage;