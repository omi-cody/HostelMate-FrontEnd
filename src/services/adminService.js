import api from './api';

export const adminService = {
  getDashboard: async () => (await api.get('/admin/dashboard')).data,
  getSiteContent: async () => (await api.get('/admin/site-content')).data,
  updateSiteContent: async (data) => (await api.put('/admin/site-content', data)).data,
  getPendingStudentKyc: async () => (await api.get('/admin/kyc/students/pending')).data,
  verifyStudentKyc: async (kycId, action, remark) =>
    (await api.patch(`/admin/kyc/students/${kycId}`, { action, remark })).data,
  getPendingHostelKyc: async () => (await api.get('/admin/kyc/hostels/pending')).data,
  verifyHostelKyc: async (kycId, action, remark) =>
    (await api.patch(`/admin/kyc/hostels/${kycId}`, { action, remark })).data,
  getAllStudents: async () => (await api.get('/admin/students')).data,
  getAllHostels: async () => (await api.get('/admin/hostels')).data,
  getNotifications: async () => (await api.get('/admin/notifications')).data,
  getNotificationCount: async () => (await api.get('/admin/notifications/count')).data,
  getHostelReviews: async () => (await api.get('/admin/reviews/hostels')).data,
  getStudentReviews: async () => (await api.get('/admin/reviews/students')).data,
  getHostelAdmissions: async (hostelId) => (await api.get(`/admin/hostels/${hostelId}/admissions`)).data,
};
