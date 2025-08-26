import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { pointsAPI, handleAPIError } from '../utils/apiServices';

export const usePoints = () => {
  const { user, updateUser } = useAuth();
  const [pointsData, setPointsData] = useState({
    user: null,
    transactions: [],
    redemptions: [],
    loading: false,
    error: null
  });

  const [stats, setStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    monthlyEarned: 0,
    monthlySpent: 0
  });

  // Use refs to prevent dependency issues and avoid infinite loops
  const userRef = useRef(user);
  const updateUserRef = useRef(updateUser);
  const hasLoadedOnce = useRef(false);
  
  // Update refs when values change
  useEffect(() => {
    userRef.current = user;
    updateUserRef.current = updateUser;
  }, [user, updateUser]);

  // Fetch user points and transaction data - stable function with no dependencies
  const fetchPointsData = useCallback(async () => {
    const currentUser = userRef.current;
    const currentUpdateUser = updateUserRef.current;
    
    if (!currentUser?.id) return;

    setPointsData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await pointsAPI.getUserPoints(currentUser.id);
      const { user: userData, transactions } = response.data;

      // Calculate stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const totalEarned = transactions
        .filter(t => t.transaction_type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalSpent = transactions
        .filter(t => t.transaction_type === 'redemption')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.created_at);
        return transactionDate.getMonth() === thisMonth && 
               transactionDate.getFullYear() === thisYear;
      });

      const monthlyEarned = monthlyTransactions
        .filter(t => t.transaction_type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlySpent = monthlyTransactions
        .filter(t => t.transaction_type === 'redemption')
        .reduce((sum, t) => sum + t.amount, 0);

      setPointsData({
        user: userData,
        transactions: transactions.slice(0, 10), // Show last 10 transactions
        redemptions: [],
        loading: false,
        error: null
      });

      setStats({
        totalEarned,
        totalSpent,
        monthlyEarned,
        monthlySpent
      });

      // Update user points in auth context
      if (currentUpdateUser) {
        currentUpdateUser({ points_balance: userData.points_balance });
      }

    } catch (error) {
      const errorData = handleAPIError(error);
      setPointsData(prev => ({
        ...prev,
        loading: false,
        error: errorData.message
      }));
    }
  }, []); // Empty dependency array - function uses refs

  // Fetch redemptions - stable function with no dependencies
  const fetchRedemptions = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser?.id) return;

    try {
      const response = await pointsAPI.getUserRedemptions(currentUser.id, 1, 10);
      setPointsData(prev => ({
        ...prev,
        redemptions: response.data.redemptions
      }));
    } catch (error) {
      console.error('Failed to fetch redemptions:', error);
    }
  }, []); // Empty dependency array - function uses refs

  // Redeem points for a reward
  const redeemPoints = useCallback(async (rewardId) => {
    const currentUser = userRef.current;
    const currentUpdateUser = updateUserRef.current;
    
    if (!currentUser?.id) return { success: false, message: 'User not authenticated' };

    try {
      const response = await pointsAPI.redeemPoints(currentUser.id, rewardId);
      const { new_balance, redemption } = response.data;

      // Update user points balance
      if (currentUpdateUser) {
        currentUpdateUser({ points_balance: new_balance });
      }

      // Refresh points and redemption data
      await fetchPointsData();
      await fetchRedemptions();

      return {
        success: true,
        message: 'Points redeemed successfully!',
        redemption,
        newBalance: new_balance
      };
    } catch (error) {
      const errorData = handleAPIError(error);
      return {
        success: false,
        message: errorData.message
      };
    }
  }, [fetchPointsData]);

  // Load data only once when user changes - prevents infinite loops
  useEffect(() => {
    if (user?.id) {
      // Reset the flag when user changes
      hasLoadedOnce.current = false;
      
      // Fetch data only if not already loaded for this user
      if (!hasLoadedOnce.current) {
        hasLoadedOnce.current = true;
        console.log('Loading points data for user:', user.id);
        fetchPointsData();
        fetchRedemptions();
      }
    }
  }, [user?.id]); // Only depend on user.id

  // Refresh data function - for manual refresh only
  const refreshData = useCallback(() => {
    console.log('Manual refresh triggered');
    hasLoadedOnce.current = false; // Allow fresh reload
    fetchPointsData();
    fetchRedemptions();
  }, [fetchPointsData, fetchRedemptions]);

  return {
    ...pointsData,
    stats,
    redeemPoints,
    refreshData,
    userPoints: pointsData.user?.points_balance || 0
  };
};
