// API configuration and service functions
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('eventpro_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('eventpro_token', token);
    } else {
      localStorage.removeItem('eventpro_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(name, email, password, role = 'subscriber') {
    const response = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // Events
  async getEvents() {
    return await this.request('/events');
  }

  async getEvent(id) {
    return await this.request(`/events/${id}`);
  }

  async createEvent(eventData) {
    return await this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id, eventData) {
    return await this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id) {
    return await this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Event subscriptions
  async subscribeToEvent(eventId) {
    return await this.request(`/events/${eventId}/subscribe`, {
      method: 'POST',
    });
  }

  async unsubscribeFromEvent(eventId) {
    return await this.request(`/events/${eventId}/unsubscribe`, {
      method: 'DELETE',
    });
  }

  async getEventParticipants(eventId) {
    return await this.request(`/events/${eventId}/participants`);
  }

  // User management
  async getUserEvents(userId) {
    return await this.request(`/users/${userId}/events`);
  }

  async getUserRegistrations(userId) {
    return await this.request(`/users/${userId}/registrations`);
  }

  async updateUser(userId, userData) {
    return await this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return await this.request('/user');
  }
}

// Helper functions for backward compatibility
const apiService = new ApiService();

export const getUpcomingEvents = async () => {
  const events = await apiService.getEvents();
  return events.filter(event => event.status === 'upcoming');
};

export const getPastEvents = async () => {
  const events = await apiService.getEvents();
  return events.filter(event => event.status === 'past');
};

export const getEventById = async (id) => {
  return await apiService.getEvent(id);
};

export const getUserRegistrations = async (userId) => {
  return await apiService.getUserRegistrations(userId);
};

export const isUserRegistered = async (userId, eventId) => {
  try {
    const registrations = await apiService.getUserRegistrations(userId);
    return registrations.some(reg => reg.id === parseInt(eventId));
  } catch (error) {
    console.error('Error checking user registration:', error);
    return false;
  }
};

export const getOrganizerEvents = async (organizerId) => {
  return await apiService.getUserEvents(organizerId);
};

export const getEventParticipants = async (eventId) => {
  return await apiService.getEventParticipants(eventId);
};

export default apiService;

