import api from './api';

// Points and Transactions API
export const pointsAPI = {
  // Get user points and transaction history
  getUserPoints: (userId) => api.get(`/students/${userId}/points`),
  
  // Get transaction history with pagination
  getTransactionHistory: (userId, page = 1, limit = 20) => 
    api.get(`/students/${userId}/transactions?page=${page}&limit=${limit}`),
  
  // Get user redemptions
  getUserRedemptions: (userId, page = 1, limit = 20) => 
    api.get(`/students/${userId}/redemptions?page=${page}&limit=${limit}`),
  
  // Redeem points for a reward
  redeemPoints: (userId, rewardId) => 
    api.post(`/students/${userId}/redeem`, { reward_id: rewardId }),
  
  // Get home data (dashboard)
  getHomeData: () => api.get('/students/Home')
};

// Rewards API
export const rewardsAPI = {
  // Get all available rewards
  getAllRewards: () => api.get('/rewards'),
  
  // Get reward by ID
  getRewardById: (rewardId) => api.get(`/rewards/${rewardId}`),
  
  // Get reward categories
  getRewardCategories: () => api.get('/rewards/categories'),
  
  // Get popular rewards
  getPopularRewards: () => api.get('/rewards/popular'),
  
  // Admin: Create new reward
  createReward: (rewardData) => api.post('/rewards', rewardData),
  
  // Admin: Update reward
  updateReward: (rewardId, rewardData) => api.put(`/rewards/${rewardId}`, rewardData),
  
  // Admin: Delete reward
  deleteReward: (rewardId) => api.delete(`/rewards/${rewardId}`),
  
  // Admin: Toggle reward availability
  toggleRewardAvailability: (rewardId) => api.patch(`/rewards/${rewardId}/toggle`)
};

// Auth API
export const authAPI = {
  // Login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Register
  register: (userData) => api.post('/auth/register', userData),
  
  // Get user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update profile
  updateProfile: (userData) => api.put('/auth/profile', userData)
};

// Admin API
export const adminAPI = {
  // Get all students
  getAllStudents: () => api.get('/admin/students'),
  
  // Get student by ID
  getStudentById: (studentId) => api.get(`/admin/students/${studentId}`),
  
  // Add points to student
  addPoints: (studentId, points, reason) => 
    api.post(`/admin/students/${studentId}/add-points`, { points, reason }),
  
  // Deduct points from student
  deductPoints: (studentId, points, reason) => 
    api.post(`/admin/students/${studentId}/deduct-points`, { points, reason }),
  
  // Get all transactions
  getAllTransactions: (page = 1, limit = 20) => 
    api.get(`/admin/transactions?page=${page}&limit=${limit}`),
  
  // Get admin dashboard data
  getDashboardData: () => api.get('/admin/dashboard')
};

// Error handling helper
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      success: false,
      message: error.response.data?.error || 'An error occurred',
      status: error.response.status
    };
  } else if (error.request) {
    // Network error
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      status: 0
    };
  } else {
    // Other error
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      status: 0
    };
  }
};

// Success response helper
export const handleAPISuccess = (data) => ({
  success: true,
  data,
  message: 'Operation completed successfully'
});
