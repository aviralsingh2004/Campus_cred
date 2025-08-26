import { useState, useEffect, useCallback } from 'react';
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

  // Fetch user points and transaction data
  const fetchPointsData = useCallback(async () => {
    if (!user?.id) return;

    setPointsData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await pointsAPI.getUserPoints(user.id);
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
      updateUser({ points_balance: userData.points_balance });

    } catch (error) {
      const errorData = handleAPIError(error);
      setPointsData(prev => ({
        ...prev,
        loading: false,
        error: errorData.message
      }));
    }
  }, [user?.id, updateUser]);

  // Fetch redemptions
  const fetchRedemptions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await pointsAPI.getUserRedemptions(user.id, 1, 10);
      setPointsData(prev => ({
        ...prev,
        redemptions: response.data.redemptions
      }));
    } catch (error) {
      console.error('Failed to fetch redemptions:', error);
    }
  }, [user?.id]);

  // Redeem points for a reward
  const redeemPoints = useCallback(async (rewardId) => {
    if (!user?.id) return { success: false, message: 'User not authenticated' };

    try {
      const response = await pointsAPI.redeemPoints(user.id, rewardId);
      const { new_balance, redemption } = response.data;

      // Update user points balance
      updateUser({ points_balance: new_balance });

      // Refresh points data
      await fetchPointsData();

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
  }, [user?.id, updateUser, fetchPointsData]);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchPointsData();
      fetchRedemptions();
    }
  }, [user?.id, fetchPointsData, fetchRedemptions]);

  // Refresh data
  const refreshData = useCallback(() => {
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
