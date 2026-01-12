import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Home,
  Building,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Hotel,
} from "lucide-react";

import {authService} from '../services/authService';
import Header from "../components/shared/header";
import Footer from "../components/shared/footer";

export default function HostelRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    hostelName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    hostelType: "BOYS",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        setLoading(false);
      return;
    }

    // Call the registration API
    try {
      const response = await authService.registerHostel(formData);
      toast.success("Hostel registered successfully!");

      console.log(response);

      //clear form
      setFormData({
        hostelName: "",
        ownerName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        hostelType: "",
      });
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error(err)
      toast.error(err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-2">Hostel Registration</h1>
            <p className="text-gray-600">
              Register your hostel to reach more students
            </p>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hostel Name */}
              <div>
                <label className="block text-sm mb-2">Hostel Name *</label>
                <div className="relative">
                  <Building className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.hostelName}
                    onChange={(e) =>
                      setFormData({ ...formData, hostelName: e.target.value })
                    }
                    placeholder="Sunrise Hostel"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-sm mb-2">Owner Name *</label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                    placeholder="John Smith"
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
                    value={formData.email.toLowerCase()}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="hostel@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+977 9812345678"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
              {/* Hostel Type */}
              <div>
                <label className="block text-sm mb-2">Hostel Type *</label>
                <div className="relative">
                  <Hotel className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    required
                    value={formData.hostelType}
                    onChange={(e) =>
                      setFormData({ ...formData, hostelType: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Select Hostel Type</option>
                    <option value="BOYS">Boys Hostel</option>
                    <option value="GIRLS">Girls Hostel</option>
                  </select>
                </div>
              </div>

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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input type="checkbox" required className="mt-1" />
              <label className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-cyan-400 hover:text-cyan-500">
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-cyan-400 hover:text-cyan-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white rounded-lg transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-cyan-400 hover:bg-cyan-500"
              }`}
            >
              {loading ? "Registering..." : "Register Hostel"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-500">
                Sign In
              </Link>
            </p>
          </div>
          {/* Note */}
            <div className="mt-6 p-4 bg-cyan-50 rounded-lg">
              <p className="text-sm text-cyan-800">
                <strong>Note:</strong> After registration, you'll need to provide additional hostel details and documents for verification.
              </p>
            </div>
          
        </div>
      </div>
      {/* Link to Student Registration */}
      <div className="text-center mb-6">
          <Link to="/register-student" className="text-sm text-gray-600 hover:text-gray-900">
            ← Register as Student
          </Link>
        </div>

      <Footer />
    </div>
  );
}
