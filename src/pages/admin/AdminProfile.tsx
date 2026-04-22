import { useState } from 'react';
import { User, Mail, Shield } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function AdminProfile() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Admin Profile">
      <div className="max-w-md space-y-4">
        {/* Avatar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-purple-700">{user?.fullName?.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.fullName}</h2>
            <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              <Shield className="w-3.5 h-3.5" />System Administrator
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-medium text-gray-700">Account Details</h3>
          <div className="flex items-center gap-3 py-2.5 border-b border-gray-100">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Full Name</p>
              <p className="font-medium">{user?.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2.5">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-700 text-sm">
            Admin profile management is handled directly in the database. Contact a super-admin to update account details.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
