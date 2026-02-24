import { Users, Building, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminOverview() {
  const monthlyData = [
    { month: 'Jul', students: 120, hostels: 18 },
    { month: 'Aug', students: 135, hostels: 20 },
    { month: 'Sep', students: 140, hostels: 22 },
    { month: 'Oct', students: 145, hostels: 23 },
    { month: 'Nov', students: 148, hostels: 24 },
    { month: 'Dec', students: 150, hostels: 25 },
  ];

  const statusData = [
    { name: 'Verified Students', value: 138, color: '#22d3ee' },
    { name: 'Pending Students', value: 12, color: '#fb923c' },
  ];

  const hostelStatusData = [
    { name: 'Verified Hostels', value: 20, color: '#22d3ee' },
    { name: 'Pending Hostels', value: 5, color: '#fb923c' },
  ];

  const recentActivities = [
    { id: 1, type: 'Student Verified', name: 'John Doe', time: '5 mins ago' },
    { id: 2, type: 'Hostel Registered', name: 'Pearl Residence', time: '15 mins ago' },
    { id: 3, type: 'Student KYC Pending', name: 'Jane Smith', time: '1 hour ago' },
    { id: 4, type: 'Hostel Verified', name: 'Scholars Inn', time: '2 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1 text-cyan-600">Dashboard Overview</h2>
        <p className="text-white">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Total Students</p>
            <Users className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-3xl mb-1">150</p>
          <p className="text-xs text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +5 this week
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Total Hostels</p>
            <Building className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-3xl mb-1">25</p>
          <p className="text-xs text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +2 this month
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Pending Student KYC</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl mb-1 text-orange-600">12</p>
          <p className="text-xs text-gray-600">Requires attention</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Pending Hostel KYC</p>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl mb-1 text-orange-600">5</p>
          <p className="text-xs text-gray-600">Requires verification</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl mb-4">Growth Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="students" fill="#22d3ee" name="Students" />
              <Bar dataKey="hostels" fill="#06b6d4" name="Hostels" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl mb-4">Verification Status</h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-3">Students</p>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-cyan-400 rounded"></div>
                  <span>Verified (138)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-400 rounded"></div>
                  <span>Pending (12)</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-3">Hostels</p>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={hostelStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {hostelStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-cyan-400 rounded"></div>
                  <span>Verified (20)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-400 rounded"></div>
                  <span>Pending (5)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-700">Verification Rate</p>
            <CheckCircle className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-3xl mb-1">92%</p>
          <p className="text-xs text-gray-600">Student verifications</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-700">Active Hostels</p>
            <Building className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl mb-1">20</p>
          <p className="text-xs text-gray-600">Currently operating</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-700">Total Capacity</p>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl mb-1">450</p>
          <p className="text-xs text-gray-600">Available beds</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type.includes('Verified') ? 'bg-green-500' : 
                  activity.type.includes('Pending') ? 'bg-orange-500' : 'bg-cyan-500'
                }`}></div>
                <div>
                  <p className="text-sm">{activity.type}</p>
                  <p className="text-xs text-gray-500">{activity.name}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}