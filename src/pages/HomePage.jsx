import { Link } from 'react-router-dom';
import { Search, MapPin, Home, Star, Bed, Utensils, Wrench, User, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import Footer from '../components/shared/footer.jsx';
import Header from '../components/shared/header.jsx';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthPage, setIsAuthPage] = useState('');
  const [userData, setUserData] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(userInfo));
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    setIsLoggedIn(false);
    setUserData(null);
    setShowProfileMenu(false);
    // Optionally redirect to home or login page
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

  const featuredHostels = [
    {
      id: 1,
      name: 'Sunrise Block A',
      location: 'North Campus',
      rating: 4.8,
      price: 1200,
      amenities: ['Wifi', 'AC', 'Gym', 'Laundry'],
      popular: true,
    },
    {
      id: 2,
      name: 'Greenwood Hall',
      location: 'East Wing',
      rating: 4.5,
      price: 1500,
      amenities: ['Single Room', 'Library', 'Garden'],
      popular: false,
    },
    {
      id: 3,
      name: 'Scholars Inn',
      location: 'South Gate',
      rating: 4.2,
      price: 800,
      amenities: ['Dormitory', 'Cafeteria', '24/7 Security'],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-white py-12" id="home">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Content */}
            <div>
              <div className="w-60 h-10 rounded flex items-center justify-center mb-10">
                <img src="/animation.gif" alt="HostelMate Logo" className='h-25 w-30'/>
              </div>
              <h1 className="text-4xl lg:text-5xl mb-4">
                Find Your Perfect <br />
                <span className="text-cyan-400">Hostel Home</span>
              </h1>
              <p className="text-gray-600 mb-8">
                Search hostels by location, amenities, and price. Apply instantly and
                secure your room near you college.
              </p>

              <button className="w-md px-8 py-3 bg-cyan-400 text-white rounded-lg hover:bg-transparent border border-cyan-400 shadow-md hover:text-cyan-400 flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Search Hostels
              </button>
            </div>

            {/* Right Side - Image */}
            <div>
              <div className="w-full h-full min-h-[500px] rounded-2xl flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1761839271800-f44070ff0eb9?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Hero" 
                  className="w-full h-full object-cover border rounded-2xl" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hostels */}
      <section className="w-full bg-gray-50 py-12" id="hostels">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl">Featured Hostels</h2>
            <Link to="/hostels" className="text-cyan-400 hover:text-cyan-500">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHostels.map((hostel) => (
              <div key={hostel.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg  hover:shadow-cyan-400 transition">
                {/* Image Placeholder */}
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center relative">
                  <Home className="w-12 h-12 text-gray-400" />
                  {hostel.popular && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-cyan-400 text-white text-sm rounded">
                      Popular
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-white rounded flex items-center gap-1">
                    <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                    <span className="text-sm">{hostel.rating}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg mb-1">{hostel.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {hostel.location}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {hostel.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-gray-500 text-xs">Starting from</p>
                      <p className="text-xl">
                        ₹{hostel.price}
                        <span className="text-sm text-gray-500">/month</span>
                      </p>
                    </div>
                    <button className="px-5 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 text-sm">
                      {isLoggedIn ? 'Apply Now' : 'Login to Apply'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Capabilities */}
      <section className="w-full bg-white py-12 " id="capabilities">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl mb-8">System Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-200 rounded-xl hover:border-cyan-400 transition">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Bed className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg mb-2">Room Allocation</h3>
              <p className="text-gray-600 text-sm">Automated bed assignment.</p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:border-cyan-400 transition">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Utensils className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg mb-2">Mess Management</h3>
              <p className="text-gray-600 text-sm">Digital meal coupons & menu.</p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl hover:border-cyan-400 transition">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg mb-2">Maintenance</h3>
              <p className="text-gray-600 text-sm">Track repair requests instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="w-full bg-gray-50 py-12" id="about">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl mb-8">About HostelMate</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 mb-4">
                HostelMate is your all-in-one platform for finding, applying, and managing 
                hostel accommodations. We connect students with verified hostels and provide 
                tools for both students and hostel administrators.
              </p>
              <p className="text-gray-600">
                Our system simplifies the entire hostel lifecycle - from discovery to 
                application, payment, and day-to-day management of facilities.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Why Choose HostelMate?</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Verified hostel listings</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Instant online applications</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Digital payment & receipts</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Maintenance request tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="w-full bg-cyan-400 py-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl text-white mb-4">Ready to Find Your Hostel?</h2>
            <p className="text-cyan-50 mb-8">
              Join thousands of students who've found their perfect hostel home with HostelMate
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-cyan-400 rounded-lg hover:bg-gray-100 font-semibold"
              >
                Sign Up Free
              </Link>
              <Link
                to="/hostels"
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-cyan-400"
              >
                Browse Hostels
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}