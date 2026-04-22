import api from './api';

export const hostelService = {
  // ── KYC & PROFILE ─────────────────────────────────────────────────────────
  submitKyc: async (data) => (await api.post('/hostel/kyc/submit', data)).data,
  resubmitKyc: async (data) => (await api.put('/hostel/kyc/resubmit', data)).data,
  getMyKyc: async () => (await api.get('/hostel/kyc/me')).data,
  updateProfile: async (data) => (await api.put('/hostel/profile', data)).data,

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  getDashboard: async () => (await api.get('/hostel/dashboard')).data,

  // ── ROOMS ─────────────────────────────────────────────────────────────────
  addRoom: async (data) => (await api.post('/hostel/rooms', data)).data,
  getRooms: async () => (await api.get('/hostel/rooms')).data,
  getRoomDetail: async (roomId) => (await api.get(`/hostel/rooms/${roomId}`)).data,
  deleteRoom: async (roomId) => (await api.delete(`/hostel/rooms/${roomId}`)).data,

  // ── APPLICATIONS ──────────────────────────────────────────────────────────
  getApplications: async () => (await api.get('/hostel/applications')).data,
  acceptApplication: async (applicationId, roomId) =>
    (await api.post(`/hostel/applications/${applicationId}/accept`, { roomId })).data,
  scheduleVisit: async (applicationId, visitDateTime) =>
    (await api.post(`/hostel/applications/${applicationId}/schedule-visit`, { visitDateTime })).data,
  admitAfterVisit: async (applicationId, roomId) =>
    (await api.post(`/hostel/applications/${applicationId}/admit-after-visit`, { roomId })).data,
  rejectApplication: async (applicationId, remark) =>
    (await api.post(`/hostel/applications/${applicationId}/reject`, { remark })).data,
  deleteApplication: async (applicationId) =>
    (await api.delete(`/hostel/applications/${applicationId}`)).data,

  // ── STUDENTS (admitted) ───────────────────────────────────────────────────
  getAdmittedStudents: async () => (await api.get('/hostel/students')).data,
  hostelGetAllAdmissions: async () => (await api.get('/hostel/admissions')).data,

  // ── ADMISSION MANAGEMENT ──────────────────────────────────────────────────
  respondToLeave: async (admissionId, accept, remark) =>
    (await api.patch(`/hostel/admissions/${admissionId}/leave-response`, { accept, remark })).data,
  reviewStudent: async (admissionId, data) =>
    (await api.post(`/hostel/admissions/${admissionId}/review`, data)).data,

  // ── COMPLAINTS ────────────────────────────────────────────────────────────
  getRequests: async () => (await api.get('/hostel/requests')).data,
  updateRequestStatus: async (requestId, data) =>
    (await api.patch(`/hostel/requests/${requestId}`, data)).data,
  deleteRequest: async (requestId) =>
    (await api.delete(`/hostel/requests/${requestId}`)).data,

  // ── EVENTS ────────────────────────────────────────────────────────────────
  createEvent: async (data) => (await api.post('/hostel/events', data)).data,
  updateEvent: async (eventId, data) => (await api.put(`/hostel/events/${eventId}`, data)).data,
  deleteEvent: async (eventId) => (await api.delete(`/hostel/events/${eventId}`)).data,
  getEvents: async () => (await api.get('/hostel/events')).data,

  // ── PAYMENTS ──────────────────────────────────────────────────────────────
  generateInvoice: async (data) => (await api.post('/hostel/payments/invoice', data)).data,
  getPayments: async () => (await api.get('/hostel/payments')).data,
  getPaymentsByStudent: async () => (await api.get('/hostel/payments/by-student')).data,
  allocateRoom: async (admissionId, roomId) =>
    (await api.post(`/hostel/admissions/${admissionId}/allocate-room`, { roomId })).data,

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  getNotifications: async () => (await api.get('/hostel/notifications')).data,

  // ── FILE UPLOADS ──────────────────────────────────────────────────────────
  uploadFile: async (file, type) => {
    const fd = new FormData();
    fd.append('file', file);
    const ep = { logo: '/upload/hostel-logo', photo: '/upload/hostel-photo', pan: '/upload/pan-document' };
    return (await api.post(ep[type], fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
};
