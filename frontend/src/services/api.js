const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Check backend health and DB connection
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

  // Calculate EMI & Schedule via backend
  async calculateEMI(params) {
    const res = await fetch(`${API_BASE_URL}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Calculation request failed');
    }
    return await res.json();
  },

  // Save calculation to Database
  async saveCalculation(data) {
    const res = await fetch(`${API_BASE_URL}/calculations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to save calculation');
    }
    return await res.json();
  },

  // Get all saved calculations
  async getCalculations() {
    const res = await fetch(`${API_BASE_URL}/calculations`);
    if (!res.ok) {
      throw new Error('Failed to fetch calculations');
    }
    return await res.json();
  },

  // Delete saved calculation
  async deleteCalculation(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/calculations/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 404) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete calculation');
      }
      return res.ok ? await res.json() : { success: true };
    } catch (err) {
      console.warn('Backend delete notification:', err.message);
      return { success: true };
    }
  },
};
