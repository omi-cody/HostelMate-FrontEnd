import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Building, Search, Star, Shield, Clock, Users, Zap, Award, CheckCircle, Heart, MapPin, ArrowRight, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import logo from '../assets/logo.png';
const ICON_MAP: Record<string, any> = { Home, Building, Users, Shield, Star, Heart, Zap, Award, CheckCircle, Clock, Search, MapPin };

const DEFAULT_CONTENT = {
  heroTitle: 'Find Your Perfect Hostel', heroSubtitle: 'Discover comfortable, affordable hostels near your college. Apply online, pay digitally, and manage your stay all in one place.',
  heroButtonText: 'Browse Hostels',
  aboutTitle: 'Why HostelMate?', aboutDescription: 'We connect students with verified hostels, making the search for accommodation simple, transparent, and stress-free.',
  featuresJson: JSON.stringify([
    { title: 'Verified Hostels', description: 'Every hostel is KYC-verified by admin before listing.', icon: 'Shield' },
    { title: 'Easy Payments', description: 'Pay fees via Khalti or cash. Track every payment.', icon: 'CreditCard' },
    { title: 'Stay Connected', description: 'Get notifications for events, requests, and updates.', icon: 'Bell' },
  ]),
  contactEmail: 'info@hostelmate.com', contactPhone: '+977-9800000000', contactAddress: 'Kathmandu, Nepal',
  footerTagline: 'Making hostel life better for students across Nepal.',
  footerCopyright: `© ${new Date().getFullYear()} HostelMate. All rights reserved.`,
};

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(DEFAULT_CONTENT);
  const [hostels, setHostels] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const BASE = 'http://localhost:9091';


  useEffect(() => {
    api.get('/public/site-content').then(res => {
      const d = res.data?.data || res.data;
      if (d) { setContent(d); try { setFeatures(JSON.parse(d.featuresJson || '[]')); } catch { setFeatures([]); } }
      else { try { setFeatures(JSON.parse(DEFAULT_CONTENT.featuresJson)); } catch {} }
    }).catch(() => { try { setFeatures(JSON.parse(DEFAULT_CONTENT.featuresJson)); } catch {} });

    api.get('/public/hostels').then(res => {
      setHostels((res.data?.data || res.data || []).slice(0, 6));
    }).catch(() => {});
  }, []);

  const handleSearch = () => { navigate(`/hostels?q=${encodeURIComponent(search)}`); };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-60 h-10 rounded flex items-center justify-center">
              <img
                src={logo}
                alt="HostelMate Logo"
                className="h-auto w-40 object-contain"
              />
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link to="/hostels" className="hover:text-cyan-600 font-medium">Browse Hostels</Link>
            <a href="#about" className="hover:text-cyan-600">About</a>
            <a href="#contact" className="hover:text-cyan-600">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to={user.role === 'STUDENT' ? '/student/dashboard' : user.role === 'HOSTEL' ? '/hostel/dashboard' : '/admin/dashboard'}
                className="px-4 py-2 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 text-sm font-medium">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">Log In</Link>
                <Link to="/student/registration" className="px-4 py-2 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 text-sm font-medium">Register Free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-cyan-50 via-white to-cyan-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />100% Verified Hostels
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {content.heroTitle || DEFAULT_CONTENT.heroTitle}
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            {content.heroSubtitle || DEFAULT_CONTENT.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search by name or location..." value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 shadow-sm text-sm" />
            </div>
            <button onClick={handleSearch} className="px-8 py-4 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium transition-colors flex items-center gap-2 justify-center">
              {content.heroButtonText || DEFAULT_CONTENT.heroButtonText}<ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      {features.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">{content.aboutTitle || DEFAULT_CONTENT.aboutTitle}</h2>
              <p className="text-gray-500 max-w-xl mx-auto">{content.aboutDescription || DEFAULT_CONTENT.aboutDescription}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, i) => {
                const Icon = ICON_MAP[f.icon] || Star;
                return (
                  <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:border-cyan-200 hover:shadow-md transition-all text-center group">
                    <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-cyan-100 transition-colors">
                      <Icon className="w-7 h-7 text-cyan-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-gray-500 text-sm">{f.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Hostels */}
      {hostels.length > 0 && (
        <section className="py-16 px-4 bg-gray-50" id="about">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-1">Our Hostels</h2>
                <p className="text-gray-500">Browse verified hostels near you</p>
              </div>
              <Link to="/hostels" className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {hostels.map((h: any) => (
                <Link key={h.hostelId} to={`/hostels/${h.hostelId}`}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                  <img src={`${BASE}${h.hostelKyc.logoUrl}`} alt={h.hostelName} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold group-hover:text-cyan-600 transition-colors">{h.hostelName}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${h.hostelType === 'BOYS' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{h.hostelType}</span>
                    </div>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />{h.hostelKyc?.municipality || 'Nepal'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {!user && (
        <section className="py-16 px-4 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold mb-3">Ready to Find Your Hostel?</h2>
            <p className="text-cyan-100 mb-8">Join thousands of students who found their perfect home away from home.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/student/registration" className="px-8 py-4 bg-white text-cyan-600 rounded-xl hover:bg-gray-50 font-semibold transition-colors">
                Register as Student
              </Link>
              <Link to="/hostel/registration" className="px-8 py-4 bg-cyan-600/50 text-white border-2 border-white/30 rounded-xl hover:bg-cyan-600/70 font-semibold transition-colors">
                List Your Hostel
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-cyan-600 text-black py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-60 h-10 rounded flex items-center justify-center">
                <img
                  src={logo}
                  alt="HostelMate Logo"
                  className="h-auto w-40 object-contain"
                />
              </div>
            </div>
            <p className="text-black-400 text-sm">{content.footerTagline || DEFAULT_CONTENT.footerTagline}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm text-black-400">
              <Link to="/hostels" className="block hover:text-cyan-400">Browse Hostels</Link>
              <Link to="/login" className="block hover:text-cyan-400">Log In</Link>
              <Link to="/student/registration" className="block hover:text-cyan-400">Register as Student</Link>
              <Link to="/hostel/registration" className="block hover:text-cyan-400">Register as Hostel</Link>
            </div>
          </div>
          <div id="contact-section">
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm text-black-400">
              {content.contactEmail && <p><Mail className="w-4 h-4 inline" /> {content.contactEmail}</p>}
              {content.contactPhone && <p><Phone className="w-4 h-4 inline" /> {content.contactPhone}</p>}
              {content.contactAddress && <p><MapPin className="w-4 h-4 inline" /> {content.contactAddress}</p>}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-gray-800 mt-10 pt-6 text-center text-black-500 text-sm">
          {content.footerCopyright || DEFAULT_CONTENT.footerCopyright}
        </div>
      </footer>
    </div>
  );
}
