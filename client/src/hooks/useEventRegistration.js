import { useState, useCallback } from 'react';
import { eventsAPI, handleAPIError } from '../utils/apiServices';

export const useEventRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Register for an event
  const registerForEvent = useCallback(async (eventId, userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventsAPI.registerForEvent(eventId, userId);
      setLoading(false);
      
      return {
        success: true,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      const errorData = handleAPIError(error);
      setError(errorData.message);
      setLoading(false);
      
      return {
        success: false,
        message: errorData.message
      };
    }
  }, []);

  // Cancel registration
  const cancelRegistration = useCallback(async (eventId, userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventsAPI.cancelRegistration(eventId, userId);
      setLoading(false);
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      const errorData = handleAPIError(error);
      setError(errorData.message);
      setLoading(false);
      
      return {
        success: false,
        message: errorData.message
      };
    }
  }, []);

  return {
    loading,
    error,
    registerForEvent,
    cancelRegistration
  };
};
