import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Home, Clock, Wrench, AlertCircle, Calendar, Bell } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { studentService } from '../../services/studentService';

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getDashboard()
      .then(res => setData(res.data || res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Dashboard"><div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;

  const notAdmitted = !data || data?.hostelName === 'Not admitted' || !data?.hostelName;

  const cards = [
    { label: 'Total Paid', value: `Rs ${Number(data?.totalPaidToDate || 0).toLocaleString()}`, icon: CreditCard, color: 'bg-green-50 text-green-600 border-green-100' },
    { label: 'Pending Amount', value: `Rs ${Number(data?.pendingAmount || 0).toLocaleString()}`, icon: AlertCircle, color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'Monthly Fee', value: `Rs ${Number(data?.monthlyFeeAmount || 0).toLocaleString()}`, icon: CreditCard, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
    { label: 'Months of Stay', value: String(data?.monthsOfStay ?? 0), icon: Clock, color: 'bg-purple-50 text-purple-600 border-purple-100' },
  ];

  return (
    <DashboardLayout title="My Dashboard">
      {/* Hostel banner */}
      {!notAdmitted ? (
        <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{data.hostelName}</h2>
              <p className="text-cyan-100 mt-0.5">Room {data.roomNumber} · Floor {data.floor}</p>
              {data.roommateNames?.length > 0 && (
                <p className="text-cyan-100 text-sm mt-1">Roommates: {data.roommateNames.join(', ')}</p>
              )}
            </div>
            {data.nextFeeDueDate && (
              <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
                <p className="text-xs text-cyan-100">Next fee due</p>
                <p className="text-sm font-semibold">{data.nextFeeDueDate}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-6 text-center">
          <Home className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Not admitted to any hostel yet</h3>
          <p className="text-gray-500 text-sm mb-4">Browse available hostels and apply to get started.</p>
          <Link to="/hostels" className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium text-sm">
            Browse Hostels
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`bg-white border rounded-xl p-4 ${c.color}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-semibold text-gray-800">{c.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent complaints */}
      {data?.recentComplaints?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-medium flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-cyan-400" />Recent Requests
          </h3>
          <div className="divide-y divide-gray-100">
            {data.recentComplaints.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-gray-400">{c.requestType}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                  c.status === 'RESOLVED' ? 'bg-green-100 text-green-700'
                  : c.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
