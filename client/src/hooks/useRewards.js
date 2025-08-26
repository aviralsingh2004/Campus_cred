import { useState, useEffect, useCallback } from 'react';
import { rewardsAPI, handleAPIError } from '../utils/apiServices';

export const useRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    sortBy: 'name'
  });

  // Fetch all rewards
  const fetchRewards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await rewardsAPI.getAllRewards();
      setRewards(response.data.rewards || response.data);
    } catch (error) {
      const errorData = handleAPIError(error);
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch reward categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await rewardsAPI.getRewardCategories();
      setCategories(response.data.categories || response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  // Get filtered and sorted rewards
  const getFilteredRewards = useCallback(() => {
    let filtered = [...rewards];

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(reward => reward.category === filters.category);
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(reward => 
        reward.name.toLowerCase().includes(searchTerm) ||
        reward.description.toLowerCase().includes(searchTerm)
      );
    }

    // Sort rewards
    switch (filters.sortBy) {
      case 'points':
        filtered.sort((a, b) => a.points_cost - b.points_cost);
        break;
      case 'points-desc':
        filtered.sort((a, b) => b.points_cost - a.points_cost);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.redemption_count || 0) - (a.redemption_count || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [rewards, filters]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Get reward by ID
  const getRewardById = useCallback(async (rewardId) => {
    try {
      const response = await rewardsAPI.getRewardById(rewardId);
      return response.data;
    } catch (error) {
      const errorData = handleAPIError(error);
      throw new Error(errorData.message);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchRewards();
    fetchCategories();
  }, [fetchRewards, fetchCategories]);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchRewards();
  }, [fetchRewards]);

  return {
    rewards: getFilteredRewards(),
    categories,
    loading,
    error,
    filters,
    updateFilters,
    getRewardById,
    refreshData,
    allRewards: rewards // Unfiltered rewards
  };
};
