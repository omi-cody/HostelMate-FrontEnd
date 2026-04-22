import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ReactNode } from 'react';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import StudentRegistration from './pages/StudentRegistration';
import HostelRegistration from './pages/HostelRegistration';
import HostelList from './pages/student/HostelList';
import HostelDetail from './pages/student/HostelDetail';
import PaymentCallback from './pages/student/PaymentCallback';

// Student
import StudentKyc from './pages/student/StudentKyc';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentApplications from './pages/student/StudentApplications';
import StudentMyHostel from './pages/student/StudentMyHostel';
import StudentRequests from './pages/student/StudentRequests';
import StudentPayments from './pages/student/StudentPayments';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentProfile from './pages/student/StudentProfile';

// Hostel
import HostelProfile from './pages/hostel/HostelProfile';
import HostelDashboard from './pages/hostel/HostelDashboard';
import HostelRooms from './pages/hostel/HostelRooms';
import HostelApplications from './pages/hostel/HostelApplications';
import HostelStudents from './pages/hostel/HostelStudents';
import HostelRequests from './pages/hostel/HostelRequests';
import HostelEvents from './pages/hostel/HostelEvents';
import HostelPayments from './pages/hostel/HostelPayments';
import HostelNotifications from './pages/hostel/HostelNotifications';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudentKyc from './pages/admin/AdminStudentKyc';
import AdminHostelKyc from './pages/admin/AdminHostelKyc';
import AdminStudents from './pages/admin/AdminStudents';
import AdminHostels from './pages/admin/AdminHostels';
import AdminSiteContent from './pages/admin/AdminSiteContent';
import AdminProfile from './pages/admin/AdminProfile';
import AdminPayments from './pages/admin/AdminPayments';





function AuthLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// Requires login. While still loading, show spinner (never flash redirect).
function PrivateRoute({ children, role }: { children: ReactNode; role?: string }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Requires login + KYC verified. Redirects to KYC page if not verified.
function KycRoute({ children, role }: { children: ReactNode; role: 'STUDENT' | 'HOSTEL' }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== role) return <Navigate to="/" replace />;
  if (!user.kycVerified) {
    const kycPath = role === 'STUDENT' ? '/student/kyc' : '/hostel/kyc';
    return <Navigate to={kycPath} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ───────────────────────────────────────────────────────── */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/student/registration" element={<StudentRegistration />} />
      <Route path="/hostel/registration" element={<HostelRegistration />} />
      <Route path="/hostels" element={<HostelList />} />
      <Route path="/hostels/:hostelId" element={<HostelDetail />} />
      <Route path="/payment/callback" element={<PaymentCallback />} />

      {/* ── Student KYC (login required, KYC not yet required) ───────────── */}
      <Route path="/student/kyc" element={<PrivateRoute role="STUDENT"><StudentKyc /></PrivateRoute>} />

      {/* ── Student (KYC verified required) ──────────────────────────────── */}
      <Route path="/student/dashboard"     element={<KycRoute role="STUDENT"><StudentDashboard /></KycRoute>} />
      <Route path="/student/applications"  element={<KycRoute role="STUDENT"><StudentApplications /></KycRoute>} />
      <Route path="/student/my-hostel"     element={<KycRoute role="STUDENT"><StudentMyHostel /></KycRoute>} />
      <Route path="/student/requests"      element={<KycRoute role="STUDENT"><StudentRequests /></KycRoute>} />
      <Route path="/student/payments"      element={<KycRoute role="STUDENT"><StudentPayments /></KycRoute>} />
      <Route path="/student/notifications" element={<KycRoute role="STUDENT"><StudentNotifications /></KycRoute>} />
      <Route path="/student/profile"       element={<KycRoute role="STUDENT"><StudentProfile /></KycRoute>} />

      {/* ── Hostel KYC & Profile (login required) ────────────────────────── */}
      <Route path="/hostel/kyc"     element={<PrivateRoute role="HOSTEL"><HostelProfile /></PrivateRoute>} />
      <Route path="/hostel/profile" element={<PrivateRoute role="HOSTEL"><HostelProfile /></PrivateRoute>} />

      {/* ── Hostel (KYC verified required) ───────────────────────────────── */}
      <Route path="/hostel/dashboard"     element={<KycRoute role="HOSTEL"><HostelDashboard /></KycRoute>} />
      <Route path="/hostel/rooms"         element={<KycRoute role="HOSTEL"><HostelRooms /></KycRoute>} />
      <Route path="/hostel/applications"  element={<KycRoute role="HOSTEL"><HostelApplications /></KycRoute>} />
      <Route path="/hostel/students"      element={<KycRoute role="HOSTEL"><HostelStudents /></KycRoute>} />
      <Route path="/hostel/requests"      element={<KycRoute role="HOSTEL"><HostelRequests /></KycRoute>} />
      <Route path="/hostel/events"        element={<KycRoute role="HOSTEL"><HostelEvents /></KycRoute>} />
      <Route path="/hostel/payments"      element={<KycRoute role="HOSTEL"><HostelPayments /></KycRoute>} />
      <Route path="/hostel/notifications" element={<KycRoute role="HOSTEL"><HostelNotifications /></KycRoute>} />

      {/* ── Admin ────────────────────────────────────────────────────────── */}
      <Route path="/admin/dashboard"    element={<PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/kyc/students" element={<PrivateRoute role="ADMIN"><AdminStudentKyc /></PrivateRoute>} />
      <Route path="/admin/kyc/hostels"  element={<PrivateRoute role="ADMIN"><AdminHostelKyc /></PrivateRoute>} />
      <Route path="/admin/students"     element={<PrivateRoute role="ADMIN"><AdminStudents /></PrivateRoute>} />
      <Route path="/admin/hostels"      element={<PrivateRoute role="ADMIN"><AdminHostels /></PrivateRoute>} />
      <Route path="/admin/site-content" element={<PrivateRoute role="ADMIN"><AdminSiteContent /></PrivateRoute>} />
      <Route path="/admin/payments" element={<PrivateRoute role="ADMIN"><AdminPayments /></PrivateRoute>} />
      <Route path="/admin/profile"      element={<PrivateRoute role="ADMIN"><AdminProfile /></PrivateRoute>} />

      {/* ── Fallback ─────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
