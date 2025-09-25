import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// User API calls
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  changePassword: (id, passwordData) => api.put(`/users/${id}/change-password`, passwordData),
  getUserStats: () => api.get('/users/stats/overview'),
};

// Event API calls
export const eventAPI = {
  getAllEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (eventData) => api.post('/events', eventData),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  registerForEvent: (id) => api.post(`/events/${id}/register`),
  unregisterFromEvent: (id) => api.delete(`/events/${id}/register`),
  getMyEvents: () => api.get('/events/user/my-events'),
  getOrganizedEvents: () => api.get('/events/user/organized'),
};

// Membership API calls
export const membershipAPI = {
  getAllMemberships: (params) => api.get('/memberships', { params }),
  getMembership: (id) => api.get(`/memberships/${id}`),
  createMembership: (membershipData) => api.post('/memberships', membershipData),
  updateMembership: (id, membershipData) => api.put(`/memberships/${id}`, membershipData),
  cancelMembership: (id) => api.delete(`/memberships/${id}`),
  getCurrentMembership: () => api.get('/memberships/user/current'),
  getMembershipHistory: (params) => api.get('/memberships/user/history', { params }),
  getMembershipPricing: () => api.get('/memberships/info/pricing'),
  getMembershipStats: () => api.get('/memberships/admin/stats'),
};

// Transaction API calls
export const transactionAPI = {
  getAllTransactions: (params) => api.get('/transactions', { params }),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  updateTransaction: (id, transactionData) => api.put(`/transactions/${id}`, transactionData),
  processRefund: (id, refundData) => api.post(`/transactions/${id}/refund`, refundData),
  getMyTransactions: (params) => api.get('/transactions/user/history', { params }),
  getTransactionStats: (params) => api.get('/transactions/admin/stats', { params }),
  getRecentTransactions: (params) => api.get('/transactions/admin/recent', { params }),
  getPendingTransactions: (params) => api.get('/transactions/admin/pending', { params }),
};

// Report API calls
export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getUserAnalytics: (params) => api.get('/reports/users', { params }),
  getEventAnalytics: (params) => api.get('/reports/events', { params }),
  getRevenueAnalytics: (params) => api.get('/reports/revenue', { params }),
  getMembershipAnalytics: (params) => api.get('/reports/memberships', { params }),
  exportData: (type, params) => api.get(`/reports/export/${type}`, { params }),
};

export default api;