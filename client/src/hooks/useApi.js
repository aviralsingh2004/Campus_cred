import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    method = 'GET',
    body = null,
    dependencies = [],
    immediate = true
  } = options;

  const execute = async (customUrl = url, customOptions = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        method: customOptions.method || method,
        url: customUrl,
        ...customOptions
      };

      if (config.method !== 'GET' && (customOptions.body || body)) {
        config.data = customOptions.body || body;
      }

      const response = await api(config);
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate && url) {
      execute();
    }
  }, dependencies);

  return { data, loading, error, execute, refetch: () => execute() };
};

export const usePoints = (userId) => {
  return useApi(`/students/${userId}/points`, {
    dependencies: [userId],
    immediate: !!userId
  });
};

export const useTransactions = (userId, page = 1) => {
  return useApi(`/students/${userId}/transactions?page=${page}`, {
    dependencies: [userId, page],
    immediate: !!userId
  });
};

export const useRewards = (availableOnly = false) => {
  const url = availableOnly ? '/rewards?available=true' : '/rewards';
  return useApi(url, { dependencies: [availableOnly] });
};

export const useStudents = (page = 1, search = '') => {
  let url = `/admin/students?page=${page}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return useApi(url, { dependencies: [page, search] });
};

export const useDashboard = (role) => {
  const url = role === 'admin' ? '/admin/dashboard' : '/students/dashboard';
  return useApi(url, { dependencies: [role] });
};
