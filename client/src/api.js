const API_ROOT = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const BASE_URL = `${API_ROOT}/api`;

function getAuthHeaders() {
  const token = localStorage.getItem('tracker_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'An error occurred');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handleResponse),

  login: (payload) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handleResponse),

  demoLogin: () =>
    fetch(`${BASE_URL}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Dashboard
  getDashboard: (date) =>
    fetch(`${BASE_URL}/dashboard${date ? `?date=${date}` : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Habits
  getHabits: (date) =>
    fetch(`${BASE_URL}/habits${date ? `?date=${date}` : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  createHabit: (habit) =>
    fetch(`${BASE_URL}/habits`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(habit)
    }).then(handleResponse),

  updateHabit: (id, updates) =>
    fetch(`${BASE_URL}/habits/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    }).then(handleResponse),

  deleteHabit: (id) =>
    fetch(`${BASE_URL}/habits/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  toggleHabitCompletion: (id, payload) =>
    fetch(`${BASE_URL}/habits/${id}/completion`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload || {})
    }).then(handleResponse),

  getHabitCalendar: (month) =>
    fetch(`${BASE_URL}/habits/calendar${month ? `?month=${month}` : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getHabitHistory: (id) =>
    fetch(`${BASE_URL}/habits/${id}/history`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/tasks${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse);
  },

  createTask: (task) =>
    fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(task)
    }).then(handleResponse),

  updateTask: (id, updates) =>
    fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    }).then(handleResponse),

  toggleTask: (id) =>
    fetch(`${BASE_URL}/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    }).then(handleResponse),

  deleteTask: (id) =>
    fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Journal
  getJournalEntries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/journal${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse);
  },

  getJournalByDate: (date) =>
    fetch(`${BASE_URL}/journal/${date}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  saveJournalEntry: (entry) =>
    fetch(`${BASE_URL}/journal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entry)
    }).then(handleResponse),

  deleteJournalEntry: (date) =>
    fetch(`${BASE_URL}/journal/${date}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Scoring
  getMonthlyScore: (month) =>
    fetch(`${BASE_URL}/scoring/monthly${month ? `?month=${month}` : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getScoreHistory: () =>
    fetch(`${BASE_URL}/scoring/history`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Rewards
  getRewards: (month) =>
    fetch(`${BASE_URL}/rewards${month ? `?month=${month}` : ''}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  createReward: (reward) =>
    fetch(`${BASE_URL}/rewards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reward)
    }).then(handleResponse),

  updateReward: (id, updates) =>
    fetch(`${BASE_URL}/rewards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    }).then(handleResponse),

  claimReward: (id) =>
    fetch(`${BASE_URL}/rewards/${id}/claim`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    }).then(handleResponse),

  deleteReward: (id) =>
    fetch(`${BASE_URL}/rewards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Analytics
  getAnalytics: () =>
    fetch(`${BASE_URL}/analytics/overview`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getAnalyticsOverview: () =>
    fetch(`${BASE_URL}/analytics/overview`, {
      headers: getAuthHeaders()
    }).then(handleResponse)
};
