import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import Footer from '../components/shared/footer';
import Header from '../components/shared/header';

export default function StudentRegistration() {
  const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    gender: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
     if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
    }
    try{
      const requestData = { ...formData, gender: formData.gender.toUpperCase() };
      console.log(requestData);
        const response = await authService.registerStudent(requestData);
        console.log('Registration successful:', response);
        toast.success("Registration successful! Please proceed to KYC.");
        setFormData({
      fullName: '',
      email: '',
      gender: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });

    }catch(err){
      Object.keys(err).forEach(key => {
        toast.error(`${key}: ${err[key]}`);
      });
      console.error('Registration failed:', err);
    }finally{
        setLoading(false);
    }
    
   

  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Registration Form */}

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-2">Student Registration</h1>
            <p className="text-gray-600">Create your account to find the perfect hostel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm mb-2">Full Name *</label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm mb-2">Gender *</label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHERS">Other</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+977 9812345678"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm mb-2">Password *</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input type="checkbox" required className="mt-1" />
              <label className="text-sm text-gray-600">
                I agree to the <a href="#" className="text-cyan-400 hover:text-cyan-500">Terms & Conditions</a> and <a href="#" className="text-cyan-400 hover:text-cyan-500">Privacy Policy</a>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition-colors"
            >
              Register
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-500">
                Sign In
              </Link>
            </p>
          </div>
          <div className="mt-6 p-4 bg-cyan-50 rounded-lg">
              <p className="text-sm text-cyan-800">
                <strong>Note:</strong> After registration, you'll need to complete your KYC (additional details) to access the system.
              </p>
            </div>
        </div>
      </div>
      {/* Link to Student Registration */}
      <div className="text-center mb-6">
          <Link to="/register-hostel" className="text-sm text-gray-600 hover:text-gray-900">
            ← Register as Hostel
          </Link>
        </div>
        <Footer />
    </div>
  );
}
