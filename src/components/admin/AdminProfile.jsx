import { useState } from 'react';
import { User, Mail, Phone, Shield, Edit2 } from 'lucide-react';

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@hostelmate.com',
    phone: '+977 9812345678',
    role: 'System Administrator',
    joinedDate: '2024-01-01',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleSaveProfile = () => {
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      alert('Please fill all password fields');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match');
      return;
    }
    alert('Password changed successfully!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const stats = [
    { label: 'Students Verified', value: 138, color: 'cyan' },
    { label: 'Hostels Verified', value: 20, color: 'green' },
    { label: 'Total Actions', value: 158, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1">Admin Profile</h2>
        <p className="text-gray-600">Manage your admin account settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl">Profile Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-2">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400 disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Role</label>
            <div className="relative">
              <Shield className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={profileData.role}
                disabled
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Joined Date</label>
            <input
              type="text"
              value={profileData.joinedDate}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl mb-6">Change Password</h3>
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm mb-2">Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="Enter current password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">New Password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              placeholder="Enter new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            onClick={handleChangePassword}
            className="w-full py-3 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Admin Actions Log */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl mb-4">Recent Actions</h3>
        <div className="space-y-3">
          {[
            { action: 'Verified Student KYC', name: 'John Doe', time: '2 hours ago' },
            { action: 'Approved Hostel Registration', name: 'Sunrise Block A', time: '5 hours ago' },
            { action: 'Rejected Student KYC', name: 'Invalid User', time: '1 day ago' },
            { action: 'Verified Hostel', name: 'Greenwood Hall', time: '2 days ago' },
          ].map((log, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm mb-1">{log.action}</p>
                <p className="text-xs text-gray-500">{log.name}</p>
              </div>
              <p className="text-xs text-gray-400">{log.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}