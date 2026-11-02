import api from './api';

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// User Services
export const userService = {
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/change-password', data),
};

// Step Services
export const stepService = {
  addSteps: (data) => api.post('/steps/add', data),
  getHistory: (params) => api.get('/steps/history', { params }),
  updateSteps: (id, data) => api.put(`/steps/update/${id}`, data),
  deleteSteps: (id) => api.delete(`/steps/delete/${id}`),
};

// Reward Services
export const rewardService = {
  getRewards: () => api.get('/rewards'),
  redeem: (data) => api.post('/rewards/redeem', data),
  getHistory: () => api.get('/rewards/history'),
};

// Leaderboard Services
export const leaderboardService = {
  getLeaderboard: () => api.get('/leaderboard'),
  getUserRank: () => api.get('/leaderboard/user-rank'),
};

export const analyticsService = {
  getActivity: (params) => api.get('/analytics/activity', { params }),
};

export const aiService = {
  getInsights: () => api.get('/ai/insights'),
  getChatHistory: () => api.get('/ai/chat/history'),
  sendMessage: (message) => api.post('/ai/chat', { message }),
};

export const recommendationService = {
  generate: () => api.post('/ai/recommendations/generate'),
  getToday: () => api.get('/ai/recommendations'),
  getHistory: (params) => api.get('/ai/recommendations/history', { params }),
  updateStatus: (id, status) => api.patch(`/ai/recommendations/${id}/status`, { status }),
};

// Admin Services
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getRewards: () => api.get('/admin/rewards'),
  deleteUser: (id) => api.delete(`/admin/user/${id}`),
  blockUser: (id) => api.patch(`/admin/block/${id}`),
  createReward: (data) => api.post('/admin/rewards', data),
  updateReward: (id, data) => api.put(`/admin/rewards/${id}`, data),
  deleteReward: (id) => api.delete(`/admin/rewards/${id}`),
  getReports: () => api.get('/admin/reports'),
};
