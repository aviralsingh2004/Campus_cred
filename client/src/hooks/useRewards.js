import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Prevent excessive API calls
  const lastFetchTime = useRef(0);
  const isMounted = useRef(true);
  const FETCH_COOLDOWN = 3000; // 3 seconds cooldown

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch all rewards with cooldown
  const fetchRewards = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchTime.current < FETCH_COOLDOWN) {
      console.log('Rewards fetch skipped due to cooldown');
      return;
    }

    if (loading) return; // Prevent concurrent requests

    lastFetchTime.current = now;
    setLoading(true);
    setError(null);

    try {
      const response = await rewardsAPI.getAllRewards();
      
      if (isMounted.current) {
        setRewards(response.data.rewards || response.data);
      }
    } catch (error) {
      if (isMounted.current) {
        const errorData = handleAPIError(error);
        setError(errorData.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [loading]);

  // Fetch reward categories
  const fetchCategories = useCallback(async () => {
    try {
      // Extract categories from rewards instead of making separate API call
      if (rewards.length > 0) {
        const uniqueCategories = [...new Set(rewards.map(reward => reward.category))];
        if (isMounted.current) {
          setCategories(uniqueCategories);
        }
      }
    } catch (error) {
      console.error('Failed to extract categories:', error);
    }
  }, [rewards]);

  // Load initial data only once
  useEffect(() => {
    fetchRewards();
  }, []); // Empty dependency array

  // Update categories when rewards change
  useEffect(() => {
    if (rewards.length > 0) {
      fetchCategories();
    }
  }, [rewards, fetchCategories]);
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

  // Refresh data with cooldown
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
