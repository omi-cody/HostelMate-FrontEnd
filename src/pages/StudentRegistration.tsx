import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import logo from '../assets/logo.png';

export default function StudentRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', gender: '', phone: '', password: '', confirmPassword: '' });
  const s = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const inp = 'w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!/^[0-9]{10}$/.test(form.phone)) { toast.error('Phone must be exactly 10 digits'); return; }
    setLoading(true);
    try {
      await authService.registerStudent(form);
      toast.success('Registered successfully! Please log in and complete your KYC.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Registration failed');
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
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-medium mb-2">Student Registration</h1>
            <p className="text-gray-500">Create your account to find the perfect hostel</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <div className="relative"><User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" required value={form.name} onChange={e => s('name')(e.target.value)} placeholder="John Doe" className={inp} /></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <div className="relative"><Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="email" required value={form.email} onChange={e => s('email')(e.target.value)} placeholder="john@example.com" className={inp} /></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gender *</label>
                <select required value={form.gender} onChange={e => s('gender')(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400">
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHERS">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <div className="relative"><Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="tel" required value={form.phone} onChange={e => s('phone')(e.target.value)} placeholder="98XXXXXXXX" className={inp} /></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password *</label>
                <div className="relative"><Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => s('password')(e.target.value)} placeholder="Min 6 characters" className={`${inp} pr-12`} />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                <div className="relative"><Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type={showCp ? 'text' : 'password'} required value={form.confirmPassword} onChange={e => s('confirmPassword')(e.target.value)} placeholder="Repeat password" className={`${inp} pr-12`} />
                  <button type="button" onClick={() => setShowCp(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showCp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
              </div>
            </div>
            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" required className="mt-1 accent-cyan-400" id="terms" />
              <label htmlFor="terms" className="text-sm text-gray-600">I agree to the <a href="#" className="text-cyan-500">Terms & Conditions</a> and <a href="#" className="text-cyan-500">Privacy Policy</a></label>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60 transition-colors">
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-cyan-500 font-medium">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
