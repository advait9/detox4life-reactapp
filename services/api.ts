import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, API_TOKEN } from '../constants/config';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${API_TOKEN}`,
  },
});

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          return Promise.reject(new Error('Invalid image. Please try again.'));
        case 401:
          return Promise.reject(new Error('Authentication failed. Check API configuration.'));
        case 413:
          return Promise.reject(new Error('Image too large. Please use a smaller image.'));
        case 500:
          return Promise.reject(new Error('Server error. Please try again later.'));
        case 502:
          return Promise.reject(new Error('AI service unavailable. Please try again.'));
        default:
          return Promise.reject(new Error(`Request failed (${status})`));
      }
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Analysis timed out. Please try again with a clearer image.'));
    }
    return Promise.reject(new Error('Network error. Check your connection.'));
  }
);

export default api;
