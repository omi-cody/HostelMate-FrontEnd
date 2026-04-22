import { useEffect, useState } from 'react';
import { Users, Building, CheckCircle, Clock, AlertCircle, ArrowRight, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { adminService } from '../../services/adminService';

// ── Tiny self-contained chart components (no external dependency) ──────────

function BarChart({ data, dataKey, color = '#22d3ee', height = 160 }: {
  data: any[]; dataKey: string; color?: string; height?: number;
}) {
  if (!data?.length) return <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No data yet</div>;
  const max = Math.max(...data.map(d => d[dataKey] || 0), 1);
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height }}>
      {data.map((d, i) => {
        const pct = ((d[dataKey] || 0) / max) * 100;
        const label = d.month || d.label || '';
        return (
          <div key={i} className="flex flex-col items-center flex-1 h-full justify-end gap-1">
            <span className="text-xs font-semibold text-gray-700">{d[dataKey] || 0}</span>
            <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max(pct, 2)}%`, background: color }} title={`${label}: ${d[dataKey] || 0}`} />
            <span className="text-xs text-gray-400 text-center leading-tight" style={{ fontSize: 9 }}>{label.slice(0, 6)}</span>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ data, dataKey, color = '#8b5cf6', height = 160 }: {
  data: any[]; dataKey: string; color?: string; height?: number;
}) {
  if (!data?.length) return <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No data yet</div>;
  const max = Math.max(...data.map(d => d[dataKey] || 0), 1);
  const w = 100 / (data.length - 1 || 1);
  const pts = data.map((d, i) => {
    const x = i * w;
    const y = 100 - ((d[dataKey] || 0) / max) * 90 - 5;
    return `${x},${y}`;
  }).join(' ');
  return (
    <div style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height: height - 24 }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => {
          const x = i * w;
          const y = 100 - ((d[dataKey] || 0) / max) * 90 - 5;
          return <circle key={i} cx={x} cy={y} r="1.5" fill={color} vectorEffect="non-scaling-stroke"><title>{`${d.month || ''}: ${d[dataKey] || 0}`}</title></circle>;
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => <span key={i} className="text-gray-400 text-center flex-1" style={{ fontSize: 9 }}>{(d.month || '').slice(0, 6)}</span>)}
      </div>
    </div>
  );
}

function DonutChart({ data, nameKey, valueKey, colors = ['#22d3ee','#8b5cf6','#10b981','#f59e0b','#f43f5e','#6366f1'], size = 140 }: {
  data: any[]; nameKey: string; valueKey: string; colors?: string[]; size?: number;
}) {
  if (!data?.length) return <div className="flex items-center justify-center text-gray-300 text-sm" style={{ height: size }}>No data yet</div>;
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0) || 1;
  let cumAngle = -Math.PI / 2;
  const cx = size / 2, cy = size / 2, R = size * 0.4, r = size * 0.22;
  const slices = data.map((d, i) => {
    const angle = ((d[valueKey] || 0) / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(cumAngle), y1 = cy + R * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + R * Math.cos(cumAngle), y2 = cy + R * Math.sin(cumAngle);
    const xi1 = cx + r * Math.cos(cumAngle - angle), yi1 = cy + r * Math.sin(cumAngle - angle);
    const xi2 = cx + r * Math.cos(cumAngle), yi2 = cy + r * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} L${xi2},${yi2} A${r},${r} 0 ${large} 0 ${xi1},${yi1} Z`;
    return { path, color: colors[i % colors.length], label: d[nameKey], value: d[valueKey] };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="1"><title>{`${s.label}: ${s.value}`}</title></path>)}
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard().then(r => setStats(r.data || r)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout title="Admin Dashboard">
      <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
    </DashboardLayout>
  );

  const pendingTotal = (stats?.pendingStudentKyc ?? 0) + (stats?.pendingHostelKyc ?? 0);
  const studyData = (stats?.studyLevelChart || []).map((d: any) => ({ label: d.level, value: d.count }));
  const hostelTypeData = (stats?.hostelTypeChart || []).map((d: any) => ({ label: d.type, value: d.count }));

  const statCards = [
    { label: 'Total Students',      value: stats?.totalStudents ?? 0,    icon: Users,         color: 'text-cyan-600 bg-cyan-50',    link: '/admin/students' },
    { label: 'Total Hostels',       value: stats?.totalHostels ?? 0,     icon: Building,      color: 'text-blue-600 bg-blue-50',    link: '/admin/hostels' },
    { label: 'Verified Students',   value: stats?.verifiedStudents ?? 0, icon: CheckCircle,   color: 'text-green-600 bg-green-50',  link: '/admin/students' },
    { label: 'Verified Hostels',    value: stats?.verifiedHostels ?? 0,  icon: CheckCircle,   color: 'text-emerald-600 bg-emerald-50', link: '/admin/hostels' },
    { label: 'Pending Student KYC', value: stats?.pendingStudentKyc ?? 0, icon: Clock,        color: 'text-yellow-600 bg-yellow-50', link: '/admin/kyc/students' },
    { label: 'Pending Hostel KYC',  value: stats?.pendingHostelKyc ?? 0, icon: Clock,         color: 'text-orange-600 bg-orange-50', link: '/admin/kyc/hostels' },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Alert */}
      {pendingTotal > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-5">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <p className="text-yellow-800 text-sm font-medium flex-1">{pendingTotal} KYC submission{pendingTotal > 1 ? 's' : ''} awaiting review</p>
          <div className="flex gap-2">
            {stats?.pendingStudentKyc > 0 && <Link to="/admin/kyc/students" className="text-xs px-3 py-1.5 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-300 font-medium">Students ({stats.pendingStudentKyc})</Link>}
            {stats?.pendingHostelKyc > 0 && <Link to="/admin/kyc/hostels" className="text-xs px-3 py-1.5 bg-orange-200 text-orange-800 rounded-lg hover:bg-orange-300 font-medium">Hostels ({stats.pendingHostelKyc})</Link>}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {statCards.map(c => { const Icon = c.icon; return (
          <Link key={c.label} to={c.link}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-cyan-200 transition-all group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${c.color}`}><Icon className="w-5 h-5" /></div>
            <p className="text-3xl font-bold text-gray-800">{c.value}</p>
            <p className="text-gray-500 text-sm mt-0.5 group-hover:text-cyan-600 transition-colors">{c.label}</p>
          </Link>
        ); })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold mb-4 text-gray-800">Student Registrations — Last 6 Months</h3>
          <BarChart data={stats?.monthlyStudents || []} dataKey="count" color="#22d3ee" height={160} />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold mb-4 text-gray-800">Hostel Registrations — Last 6 Months</h3>
          <LineChart data={stats?.monthlyHostels || []} dataKey="count" color="#8b5cf6" height={160} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold mb-4 text-gray-800">Students by Level of Study</h3>
          <div className="flex items-center gap-4">
            <DonutChart data={studyData} nameKey="label" valueKey="value" />
            <div className="flex flex-col gap-2 flex-1">
              {studyData.map((d: any, i: number) => (
                <div key={d.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: ['#22d3ee','#8b5cf6','#10b981','#f59e0b','#f43f5e','#6366f1'][i % 6] }} />
                    <span className="text-gray-600 truncate max-w-[110px]">{d.label}</span>
                  </div>
                  <span className="font-semibold text-gray-800 ml-2">{d.value}</span>
                </div>
              ))}
              {studyData.length === 0 && <p className="text-gray-300 text-sm">No data yet</p>}
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold mb-4 text-gray-800">Hostels by Type</h3>
          <div className="flex items-center gap-4">
            <DonutChart data={hostelTypeData} nameKey="label" valueKey="value" colors={['#3b82f6','#ec4899']} />
            <div className="flex flex-col gap-3 flex-1">
              {hostelTypeData.map((d: any, i: number) => (
                <div key={d.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: ['#3b82f6','#ec4899'][i] || '#94a3b8' }} />
                    <span className="text-gray-600 text-sm">{d.label}</span>
                  </div>
                  <span className="font-bold text-gray-800">{d.value}</span>
                </div>
              ))}
              {hostelTypeData.length === 0 && <p className="text-gray-300 text-sm">No data yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2"><CreditCard className="w-6 h-6" /><p className="font-semibold">Platform Revenue</p></div>
          <p className="text-3xl font-bold">Rs {Number(stats?.revenueStats?.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-cyan-100 text-sm mt-1">{stats?.revenueStats?.totalPayments || 0} payments processed</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold mb-3 text-gray-800">Quick Actions</h3>
          <div className="space-y-2">
            {[['Review Student KYC','/admin/kyc/students'],['Review Hostel KYC','/admin/kyc/hostels'],['Edit Homepage','/admin/site-content']].map(([l,p]) => (
              <Link key={p} to={p} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-cyan-50 border border-transparent hover:border-cyan-200 transition-all group text-sm font-medium text-gray-700">
                {l}<ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-cyan-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
