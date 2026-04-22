import api from './api';

export const authService = {

  registerStudent: async (data) => {
    const res = await api.post('/auth/register/student', {
      fullName: data.name || data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      gender: (data.gender || '').toUpperCase(),
    });
    return res.data;
  },

  registerHostel: async (data) => {
    const res = await api.post('/auth/register/hostel', {
      hostelName: data.hostelName,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      hostelType: (data.hostelType || 'BOYS').toUpperCase(),
    });
    return res.data;
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data; // { success, message, data: { token, role, fullName, email, kycVerified } }
  },

  sendForgotOtp: async (email) => {
    const res = await api.post('/auth/forgot-password/send-otp', { email });
    return res.data;
  },

  verifyOtp: async (email, otp) => {
    const res = await api.post('/auth/forgot-password/verify-otp', { email, otp });
    return res.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const res = await api.post('/auth/forgot-password/reset', { email, otp, newPassword });
    return res.data;
  },
};
