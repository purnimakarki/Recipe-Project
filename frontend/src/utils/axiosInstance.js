// axiosInstance.js

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api/v1', // Update with your API's base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from local storage or your preferred storage
    const token = localStorage.getItem('token');
    
    // If the token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle error responses here
    if (error.response && error.response.status === 401) {
      // For example, if you want to logout the user when the token is invalid
      localStorage.removeItem('token');
      window.location.href = '/signin'; // Redirect to signin page
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;