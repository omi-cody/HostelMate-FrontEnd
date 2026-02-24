import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Upload, Calendar, Building, MapPin, CreditCard } from 'lucide-react';

export default function StudentKYC() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profilePicture: null,
    dob: '',
    levelOfStudy: '',
    instituteName: '',
    instituteAddress: '',
    idType: '',
    identityNumber: '',
    identityPhoto: null,
    province: '',
    district: '',
    municipality: '',
    tole: '',
    wardNo: '',
  });

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('KYC details submitted successfully! Waiting for admin verification.');
    navigate('/login');
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

      <div className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl mb-2">Complete Your Profile</h1>
              <p className="text-gray-600">Please provide the following details to verify your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm mb-2">Profile Picture *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profilePicture')}
                    className="hidden"
                    id="profilePicture"
                  />
                  <label htmlFor="profilePicture" className="cursor-pointer">
                    <span className="text-cyan-400 hover:text-cyan-500">Upload a photo</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  {formData.profilePicture && (
                    <p className="text-sm text-gray-600 mt-2">{formData.profilePicture.name}</p>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-xl mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">Date of Birth *</label>
                    <div className="relative">
                      <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Level of Study *</label>
                    <select
                      required
                      value={formData.levelOfStudy}
                      onChange={(e) => setFormData({ ...formData, levelOfStudy: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">Select Level</option>
                      <option value="secondary">Secondary Level</option>
                      <option value="bachelor">Bachelor</option>
                      <option value="master">Master</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Institute Information */}
              <div>
                <h3 className="text-xl mb-4">Institute Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Name of Institute *</label>
                    <div className="relative">
                      <Building className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.instituteName}
                        onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                        placeholder="University Name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Address of Institute *</label>
                    <div className="relative">
                      <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.instituteAddress}
                        onChange={(e) => setFormData({ ...formData, instituteAddress: e.target.value })}
                        placeholder="Institute Address"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Identity Verification */}
              <div>
                <h3 className="text-xl mb-4">Identity Verification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">Type of ID *</label>
                    <select
                      required
                      value={formData.idType}
                      onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">Select ID Type</option>
                      <option value="citizenship">Citizenship</option>
                      <option value="voter">Voter ID</option>
                      <option value="pan">PAN Card</option>
                      <option value="nid">National ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Identity Number *</label>
                    <div className="relative">
                      <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.identityNumber}
                        onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                        placeholder="ID Number"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm mb-2">Photo of Identity Document *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'identityPhoto')}
                      className="hidden"
                      id="identityPhoto"
                    />
                    <label htmlFor="identityPhoto" className="cursor-pointer">
                      <span className="text-cyan-400 hover:text-cyan-500">Upload ID photo</span>
                    </label>
                    {formData.identityPhoto && (
                      <p className="text-sm text-gray-600 mt-2">{formData.identityPhoto.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Permanent Address */}
              <div>
                <h3 className="text-xl mb-4">Permanent Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">Province *</label>
                    <input
                      type="text"
                      required
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      placeholder="Province"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">District *</label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="District"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">VDC/Municipality *</label>
                    <input
                      type="text"
                      required
                      value={formData.municipality}
                      onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                      placeholder="VDC/Municipality"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Tole *</label>
                    <input
                      type="text"
                      required
                      value={formData.tole}
                      onChange={(e) => setFormData({ ...formData, tole: e.target.value })}
                      placeholder="Tole"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Ward No. *</label>
                    <input
                      type="text"
                      required
                      value={formData.wardNo}
                      onChange={(e) => setFormData({ ...formData, wardNo: e.target.value })}
                      placeholder="Ward Number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition-colors"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}