import axios from 'axios';
import { storage } from './storage';
import { API_URL } from '@/constants/Api';

/**
 * Custom axios instance that automatically attaches the user token
 * to every request for authenticated routes.
 */
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await storage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error fetching token for API call:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
