const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'smart_emi_auth_token';

export const api = {
  // Token management
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Helper for authenticated fetch
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || data.error || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  },

  // ================= Auth Endpoints =================
  async register(email, password, name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  },

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) this.setToken(data.token);
    return data;
  },

  async googleAuth(googleUser) {
    const data = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleUser),
    });
    if (data.token) this.setToken(data.token);
    return data;
  },

  async getMe() {
    return await this.request('/auth/me');
  },

  // ================= Calculation Endpoints =================
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (err) {
      return {
        status: 'error',
        error: err.message,
        database: { connected: false, mode: 'disconnected' },
      };
    }
  },

  async calculateEMI(params) {
    return await this.request('/calculate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async saveCalculation(data) {
    return await this.request('/calculations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCalculations() {
    return await this.request('/calculations');
  },

  async searchCalculations(query = '', filters = {}) {
    const params = new URLSearchParams({ q: query, ...filters });
    return await this.request(`/search?${params.toString()}`);
  },

  async deleteCalculation(id) {
    try {
      return await this.request(`/calculations/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete notification:', err.message);
      return { success: true };
    }
  },
};
