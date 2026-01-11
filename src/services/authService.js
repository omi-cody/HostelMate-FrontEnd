import api from './api';

export const authService = {
  // Hostel Registration
  registerHostel: async (data) => {
    try {
      const response = await api.post('/auth/register/hostel', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
   registerStudent: async (data) => {
    try {
      const response = await api.post('/auth/register/student', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log(response.data);
      const { token, role } = response.data;  
      
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
      
      return role;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Get current user
  getCurrentUser: () => {
    const role = localStorage.getItem('role');
    console.log(role);
    return role ? { role } : null;
  },
};