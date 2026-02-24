import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Users, Building, FileText, Settings, User, LogOut, 
  Menu, X, Bell
} from 'lucide-react';
import { useState } from 'react';
import AdminOverview from './AdminOverview';
import AllStudents from './AllStudents';
import AllHostels from './AllHostels';
import StudentVerifications from './StudentVerifications';
import HostelVerifications from './HostelVerifications';
import AdminProfile from './AdminProfile';

export default function AdminDashboard({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Option 1: Use relative paths that match your Routes
  const navItems = [
    { path: '/admin/dashboard', label: 'Overview', icon: Home }, // Removed trailing slash
    { path: '/admin/dashboard/student-verifications', label: 'Student Verifications', icon: Users },
    { path: '/admin/dashboard/hostel-verifications', label: 'Hostel Verifications', icon: Building },
    { path: '/admin/dashboard/students', label: 'All Students', icon: Users },
    { path: '/admin/dashboard/hostels', label: 'All Hostels', icon: Building },
    { path: '/admin/dashboard/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
   
    setShowProfileMenu(false);
    // Redirect to home page
    window.location.href = '/';
  };

  // Debug: Log current location to see what URL you're on
  console.log('Current location:', location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full overflow-y-auto">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-400 rounded flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl dark:text-white">HostelMate</span>
          </Link>
        </div>

        <nav className="px-3 pb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 bg-white dark:bg-gray-800 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-cyan-400 rounded flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl dark:text-white">HostelMate</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 dark:text-white" />
              </button>
            </div>

            <nav className="px-3 pb-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${
                      isActive
                        ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-6 h-6 dark:text-white" />
            </button>

            <div className="flex-1 lg:block hidden">
              <h1 className="text-xl dark:text-white">
                Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Bell className="w-5 h-5 dark:text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center text-white">
                    A
                  </div>
                  <span className="hidden md:block dark:text-white">Admin</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                    <Link
                      to="/admin/dashboard/profile"  // Fixed this path
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="student-verifications" element={<StudentVerifications />} />
            <Route path="hostel-verifications" element={<HostelVerifications />} />
            <Route path="students" element={<AllStudents />} />
            <Route path="hostels" element={<AllHostels />} />
            <Route path="/profile" element={<AdminProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}