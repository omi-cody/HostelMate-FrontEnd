import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
function Header() {

    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/register-student' || location.pathname === '/register-hostel';

    return (
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
            <div className="w-60 h-10  rounded flex items-center justify-center">
              <img src="/logo.png" alt="HostelMate Logo" className='h-25 w-30'/>
            </div>
          </Link>
            {!isAuthPage && (
                <>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-700 hover:text-gray-900">
                Home
              </a>
              <a href="#hostels" className="text-gray-700 hover:text-gray-900">
                Hostels
              </a>
              <a href="#capabilities" className="text-gray-700 hover:text-gray-900">
                Features
              </a>
            </nav>
            <Link
              to="/login"
              className="px-6 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500"
            >
              Login
            </Link>
            </>
            )}
          </div>
        </div>
      </header>
    )
}   
export default Header;