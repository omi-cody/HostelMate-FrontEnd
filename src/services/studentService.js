import api from './api';

export const studentService = {
  // ── KYC ──────────────────────────────────────────────────────────────────
  submitKyc: async (data) => (await api.post('/student/kyc/submit', data)).data,
  resubmitKyc: async (data) => (await api.put('/student/kyc/resubmit', data)).data,
  getMyKyc: async () => (await api.get('/student/kyc/me')).data,
  updateProfile: async (data) => (await api.put('/student/profile', data)).data,

  //chatbot messaging 

  chat: async (message, history) =>
  (await api.post('/ai/chat', { message, history })).data,

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  getDashboard: async () => (await api.get('/student/dashboard')).data,

  // ── PUBLIC HOSTEL SEARCH ──────────────────────────────────────────────────
  searchHostels: async (name, hostelType) => {
    const params = {};
    if (name) params.name = name;
    if (hostelType) params.hostelType = hostelType;
    return (await api.get('/public/hostels', { params })).data;
  },
  getHostelDetail: async (hostelId) => (await api.get(`/public/hostels/${hostelId}`)).data,
  getAiRecommendations: async () =>
    (await api.post('/ai/hostel-recommendations')).data,
  getRoomAvailability: async (hostelId) =>
    (await api.get(`/public/hostels/${hostelId}/room-availability`)).data,

  // ── APPLICATIONS ──────────────────────────────────────────────────────────
  applyToHostel: async (hostelId, data) => (await api.post(`/student/apply/${hostelId}`, data)).data,
  getMyApplications: async () => (await api.get('/student/applications')).data,
  cancelApplication: async (applicationId) =>
    (await api.patch(`/student/applications/${applicationId}/cancel`)).data,

  // ── MY HOSTEL / ADMISSION ─────────────────────────────────────────────────
  getMyHostel: async () => (await api.get('/student/my-hostel')).data,
  requestLeave: async () => (await api.post('/student/my-hostel/request-leave')).data,
  reviewHostel: async (admissionId, data) =>
    (await api.post(`/student/admissions/${admissionId}/review`, data)).data,

  // ── COMPLAINTS & MAINTENANCE ──────────────────────────────────────────────
  submitRequest: async (data) => (await api.post('/student/requests', data)).data,
  getMyRequests: async () => (await api.get('/student/requests')).data,

  // ── EVENTS ────────────────────────────────────────────────────────────────
  getEvents: async (hostelId) => (await api.get(`/student/events/${hostelId}`)).data,

  // ── PAYMENTS ──────────────────────────────────────────────────────────────
  initiateKhaltiPayment: async (data) => (await api.post('/student/payments/initiate', data)).data,
  verifyKhaltiPayment: async (paymentId, pidx) =>
    (await api.post(`/student/payments/${paymentId}/verify`, null, { params: { pidx } })).data,
  getPaymentHistory: async () => (await api.get('/student/payments')).data,

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  getNotifications: async () => (await api.get('/student/notifications')).data,
  getUnreadCount: async () => (await api.get('/student/notifications/unread-count')).data,
  markAllRead: async () => (await api.post('/student/notifications/mark-all-read')).data,

  // ── FILE UPLOAD ───────────────────────────────────────────────────────────
  uploadFile: async (file, type) => {
    const fd = new FormData();
    fd.append('file', file);
    const ep = { profilePhoto: '/upload/profile-photo', document: '/upload/document' };
    return (await api.post(ep[type], fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
};
