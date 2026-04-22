import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login(form.email, form.password);
      const u = res.data || res;
      login({ token: u.token, role: u.role, fullName: u.fullName, email: u.email, kycVerified: u.kycVerified });
      toast.success(`Welcome back, ${u.fullName}!`);
      if (u.role === 'STUDENT') navigate(u.kycVerified ? '/student/dashboard' : '/student/kyc');
      else if (u.role === 'HOSTEL') navigate(u.kycVerified ? '/hostel/dashboard' : '/hostel/kyc');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-60 h-10 rounded flex items-center justify-center">
              <img src={logo} alt="HostelMate Logo" className="h-auto w-40 object-contain" />
            </div>
          </Link>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-medium mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to continue to HostelMate</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-cyan-500 hover:text-cyan-600">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm space-y-2">
            <p className="text-gray-500">Don't have an account?</p>
            <div className="flex gap-4 justify-center">
              <Link to="/student/registration" className="text-cyan-500 hover:text-cyan-600 font-medium">Register as Student</Link>
              <span className="text-gray-300">|</span>
              <Link to="/hostel/registration" className="text-cyan-500 hover:text-cyan-600 font-medium">Register as Hostel</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
