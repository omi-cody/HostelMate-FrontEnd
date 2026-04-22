import { useEffect, useState } from 'react';
import { Users, CreditCard, Wrench, FileText, BedDouble } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { hostelService } from '../../services/hostelService';

// ── Tiny SVG charts (no external deps) ───────────────────────────────────────

function MiniLineChart({ data, color = '#22d3ee', height = 80 }: { data: number[]; color?: string; height?: number }) {
  if (!data.length || data.every(v => v === 0)) {
    return <div className="flex items-center justify-center text-gray-300 text-xs" style={{ height }}>No data yet</div>;
  }
  const max = Math.max(...data, 1);
  const w = 100 / (data.length - 1 || 1);
  const pts = data.map((v, i) => `${i * w},${100 - (v / max) * 88 - 6}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle key={i} cx={i * w} cy={100 - (v / max) * 88 - 6} r="2" fill={color} vectorEffect="non-scaling-stroke">
          <title>{v}</title>
        </circle>
      ))}
    </svg>
  );
}

function OccupancyDonut({ occupied, total, size = 100 }: { occupied: number; total: number; size?: number }) {
  const pct = total > 0 ? occupied / total : 0;
  const angle = pct * 2 * Math.PI;
  const cx = size / 2, cy = size / 2, R = size * 0.4, r = size * 0.25;
  const x1 = cx + R * Math.cos(-Math.PI / 2);
  const y1 = cy + R * Math.sin(-Math.PI / 2);
  const x2 = cx + R * Math.cos(angle - Math.PI / 2);
  const y2 = cy + R * Math.sin(angle - Math.PI / 2);
  const xi1 = cx + r * Math.cos(-Math.PI / 2);
  const yi1 = cy + r * Math.sin(-Math.PI / 2);
  const xi2 = cx + r * Math.cos(angle - Math.PI / 2);
  const yi2 = cy + r * Math.sin(angle - Math.PI / 2);
  const large = angle > Math.PI ? 1 : 0;
  const filledPath = pct > 0
    ? `M${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} L${xi2},${yi2} A${r},${r} 0 ${large} 0 ${xi1},${yi1} Z`
    : '';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={R} fill="#e2e8f0" />
      <circle cx={cx} cy={cy} r={r} fill="white" />
      {filledPath && <path d={filledPath} fill="#22d3ee" />}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" className="font-bold" style={{ fontSize: size * 0.18, fontWeight: 700, fill: '#0e7490' }}>
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function HostelDashboard() {
  const [dash, setDash] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      hostelService.getDashboard(),
      hostelService.getApplications(),
      hostelService.getRequests(),
      hostelService.getRooms(),
      hostelService.getPayments(),
      hostelService.getAdmittedStudents(),
    ]).then(([d, a, r, rm, p, s]) => {
      setDash(d.data || d);
      setApps((a.data || a || []).filter((ap: any) => ap.status === 'PENDING'));
      setRequests((r.data || r || []).filter((req: any) => req.status === 'PENDING').slice(0, 5));
      setRooms(rm.data || rm || []);
      setPayments((p.data || p || []).filter((pay: any) => pay.status === 'PAID'));
      setStudents(s.data || s || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout title="Dashboard">
      <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
    </DashboardLayout>
  );

  const TYPE_CAP: Record<string, number> = { SINGLE: 1, DOUBLE: 2, TRIPLE: 3, QUAD: 4 };
  const totalBeds = rooms.reduce((s, r) => s + (r.capacity || TYPE_CAP[r.roomType] || 1), 0);
  const activeBeds = dash?.totalStudents || 0;
  const availableBeds = Math.max(0, totalBeds - activeBeds);

  // Monthly revenue (last 6 months) for mini line chart
  const monthlyRevValues = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return payments.filter((p: any) => p.feeMonth?.startsWith(month))
      .reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
  });

  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleString('default', { month: 'short' });
  });

  // Room type distribution
  const roomTypeCounts = rooms.reduce((acc: any, r: any) => {
    acc[r.roomType] = (acc[r.roomType] || 0) + 1; return acc;
  }, {});
  const TYPE_COLORS: Record<string, string> = { SINGLE: '#22d3ee', DOUBLE: '#8b5cf6', TRIPLE: '#10b981', QUAD: '#f59e0b' };

  const statCards = [
    { label: 'Active Students',  value: activeBeds,    icon: Users,    color: 'text-cyan-600 bg-cyan-50',    link: '/hostel/students' },
    { label: 'Monthly Revenue',  value: `Rs ${Number(dash?.totalRevenue || 0).toLocaleString()}`, icon: CreditCard, color: 'text-green-600 bg-green-50', link: '/hostel/payments' },
    { label: 'Pending Requests', value: dash?.pendingComplaints ?? 0, icon: Wrench, color: 'text-red-500 bg-red-50', link: '/hostel/requests' },
    { label: 'New Applications', value: apps.length,   icon: FileText, color: 'text-yellow-600 bg-yellow-50', link: '/hostel/applications' },
    { label: 'Available Beds',   value: availableBeds, icon: BedDouble, color: availableBeds > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50', link: '/hostel/rooms' },
    { label: 'Total Beds',       value: totalBeds,     icon: BedDouble, color: 'text-blue-600 bg-blue-50',   link: '/hostel/rooms' },
  ];

  return (
    <DashboardLayout title="Hostel Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {statCards.map(c => { const Icon = c.icon; return (
          <Link key={c.label} to={c.link}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-cyan-200 transition-all group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${c.color}`}><Icon className="w-5 h-5" /></div>
            <p className="text-2xl font-bold text-gray-800">{c.value}</p>
            <p className="text-gray-500 text-sm mt-0.5 group-hover:text-cyan-600">{c.label}</p>
          </Link>
        ); })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Revenue line */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold mb-1 text-gray-800">Monthly Revenue (Rs)</h3>
          <p className="text-2xl font-bold text-cyan-600 mb-3">
            Rs {(monthlyRevValues[5] || 0).toLocaleString()}
            <span className="text-sm font-normal text-gray-400 ml-2">this month</span>
          </p>
          <MiniLineChart data={monthlyRevValues} color="#22d3ee" height={80} />
          <div className="flex justify-between mt-1">
            {monthLabels.map(l => <span key={l} className="text-gray-400 text-center flex-1" style={{ fontSize: 9 }}>{l}</span>)}
          </div>
        </div>

        {/* Occupancy donut */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold mb-3 text-gray-800">Occupancy & Room Types</h3>
          <div className="flex items-center gap-5">
            <OccupancyDonut occupied={activeBeds} total={totalBeds} size={100} />
            <div className="flex-1 space-y-2">
              <p className="text-sm text-gray-500">{activeBeds} of {totalBeds} beds occupied</p>
              {Object.entries(roomTypeCounts).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLORS[type] || '#94a3b8' }} />
                    <span className="text-gray-600">{type}</span>
                  </div>
                  <span className="font-bold text-gray-800">{String(count)} rooms</span>
                </div>
              ))}
              {Object.keys(roomTypeCounts).length === 0 && <p className="text-gray-300 text-sm">No rooms added yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Pending items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-500" />New Applications
              {apps.length > 0 && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">{apps.length}</span>}
            </h3>
            <Link to="/hostel/applications" className="text-cyan-500 text-sm hover:text-cyan-600">View all →</Link>
          </div>
          {apps.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No pending applications</p>
          : <div className="space-y-2">{apps.slice(0, 4).map((a: any) => (
            <div key={a.applicationId} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div><p className="text-sm font-medium">{a.student?.user?.fullName}</p><p className="text-xs text-gray-400">{a.roomType} · {a.applicationType}</p></div>
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">PENDING</span>
            </div>
          ))}</div>}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-red-500" />Pending Requests
              {requests.length > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">{requests.length}</span>}
            </h3>
            <Link to="/hostel/requests" className="text-cyan-500 text-sm hover:text-cyan-600">View all →</Link>
          </div>
          {requests.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No pending requests</p>
          : <div className="space-y-2">{requests.map((r: any) => (
            <div key={r.requestId} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div><p className="text-sm font-medium">{r.title}</p><p className="text-xs text-gray-400">{r.student?.user?.fullName} · {r.requestType}</p></div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.requestType === 'COMPLAINT' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{r.requestType}</span>
            </div>
          ))}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}
