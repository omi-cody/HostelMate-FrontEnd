import { Link, useLocation } from 'react-router-dom';
import { Home, User, ChevronDown ,LayoutDashboard, Settings, LogOut} from 'lucide-react';
import { useState, useEffect } from 'react';

function Header() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isAuthPage = location.pathname === '/login' || 
                    location.pathname === '/register' || 
                    location.pathname === '/register-student' || 
                    location.pathname === '/register-hostel';

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userInfo = localStorage.getItem('user');
    
    if (token && userInfo) {
      setIsLoggedIn(true);
      try {
        setUserData(JSON.parse(userInfo));
      } catch (e) {
        console.error('Error parsing user info:', e);
      }
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserData(null);
    setShowProfileMenu(false);
    // Redirect to home page
    window.location.href = '/';
  };

  // Get initials from full name
  const getUserInitials = () => {
    if (!userData?.fullName) return 'U';
    return userData.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="w-60 h-10 rounded flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="HostelMate Logo" 
                className="h-auto w-40 object-contain" 
              />
            </div>
          </Link>
          
          {!isAuthPage && (
            <>
              <nav className="hidden md:flex items-center gap-8">
                <a href="#home" className="text-gray-700  hover:text-cyan-400 transition-colors ">
                  Home
                </a>
                <a href="#hostels" className="text-gray-700 hover:text-cyan-400 transition-colors">
                  Hostels
                </a>
                <a href="#capabilities" className="text-gray-700 hover:text-cyan-400 transition-colors">
                  Features
                </a>
              </nav>
              
              {/* Login/Profile Section */}
              <div className="flex items-center gap-4">
                {isLoggedIn ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      {userData?.avatarUrl ? (
                        <img
                          src={userData.avatarUrl}
                          alt={userData.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {getUserInitials()}
                        </div>
                      )}
                      <span className="hidden md:inline text-gray-700 text-sm font-medium">
                        {userData?.fullName?.split(' ')[0] || 'User'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowProfileMenu(false)}
                        />
                        
                        {/* Dropdown */}
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-semibold text-gray-800 truncate">
                              {userData?.fullName || 'User'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {userData?.email || ''}
                            </p>
                            {userData?.role && (
                              <span className="inline-block mt-1 px-2 py-1 bg-cyan-50 text-cyan-600 text-xs rounded">
                                {userData.role}
                              </span>
                            )}
                          </div>
                          
                          {/* Menu Items */}
                          <div className="py-1">
                            <Link
                              to="/dashboard"
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              <span>Dashboard</span>
                            </Link>
                            
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <User className="w-4 h-4" />
                              <span>My Profile</span>
                            </Link>
                            
                            <Link
                              to="/settings"
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <Settings className="w-4 h-4" />
                              <span>Settings</span>
                            </Link>
                            
                            <div className="border-t border-gray-100 mt-1 pt-1">
                              <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50"
                              >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-cyan-400 hover:text-cyan-500 font-medium text-sm transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register-student"
                      className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-lg hover:from-cyan-500 hover:to-cyan-600 transition-all shadow-sm hover:shadow"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;