const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API request failed');
  }
  if (res.status === 204) {
    return null;
  }
  return await res.json();
};

export const api = {
  async register(name, email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return handleResponse(res);
  },

  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getHabits() {
    const res = await fetch(`${API_URL}/habits`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createHabit(habitData) {
    const res = await fetch(`${API_URL}/habits`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(habitData)
    });
    return handleResponse(res);
  },

  async updateHabit(id, habitData) {
    const res = await fetch(`${API_URL}/habits/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(habitData)
    });
    return handleResponse(res);
  },

  async deleteHabit(id) {
    const res = await fetch(`${API_URL}/habits/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async archiveHabit(id) {
    const res = await fetch(`${API_URL}/habits/${id}/archive`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async completeHabit(id, date) {
    const res = await fetch(`${API_URL}/habits/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ date })
    });
    return handleResponse(res);
  },

  async uncompleteHabit(id, date) {
    const res = await fetch(`${API_URL}/habits/${id}/complete`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ date })
    });
    return handleResponse(res);
  },

  async getDashboard() {
    const res = await fetch(`${API_URL}/dashboard`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getAnalytics(period) {
    const res = await fetch(`${API_URL}/analytics?period=${period}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getWeeklyAnalytics() {
    const res = await fetch(`${API_URL}/analytics/weekly`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getHabitPerformance() {
    const res = await fetch(`${API_URL}/analytics/performance`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getMonthlyAnalytics() {
    const res = await fetch(`${API_URL}/analytics/monthly`, { headers: getAuthHeaders() });
    return handleResponse(res);
  }
};
