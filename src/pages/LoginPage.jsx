import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';



export default function LoginPage({ onLogin }) {
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    
   try{
    const response = await authService.login(formData.email, formData.password);
    // console.log('Login successful:', response);
    // toast.success('Login successful!');

    const user = authService.getCurrentUser();
    if (user.role === 'STUDENT') {
      navigate('/student/dashboard');
      toast.info('Welcome Student!');

    } else if (user.role === 'HOSTEL') {
      navigate('/hostel/dashboard');
      toast.info('Welcome Hostel Admin!');
    } else if (user.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      toast.error('Unknown user role. Please contact support.');
    }

   }catch(err){
    console.error('Login failed:', err);
    toast.error("Invalid email or password");
   }finally{
    setLoading(false);
   }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-400 rounded flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl">HostelMate</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue to HostelMate</p>
          </div>
          {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Password */}
            {/* Password */}
              <div>
                <label className="block text-sm mb-2">Password *</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-cyan-400 hover:text-cyan-500">
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-cyan-400 hover:bg-cyan-500'}`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Register Links */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 mb-2">Don't have an account?</p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/register-student"
                className="text-cyan-400 hover:text-cyan-500"
              >
                Register as Student
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/register-hostel"
                className="text-cyan-400 hover:text-cyan-500"
              >
                Register as Hostel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
