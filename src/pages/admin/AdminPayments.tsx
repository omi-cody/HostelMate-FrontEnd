import { useEffect, useState } from 'react';
import { CreditCard, Search, Check, X, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { adminService } from '../../services/adminService';
import api from '../../services/api';
import { toast } from 'react-toastify';

const SC: Record<string,string> = {
  PAID: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700',
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState<string|null>(null);

  const load = () =>
    api.get('/admin/payments')
      .then(r => setPayments(r.data?.data || r.data || []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const updateStatus = async (paymentId: string, status: string) => {
    if (!window.confirm(`Mark this payment as ${status}?`)) return;
    setUpdating(paymentId);
    try {
      await api.patch(`/admin/payments/${paymentId}/status`, { status });
      toast.success(`Payment marked as ${status}`);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const nameMatch = p.student?.user?.fullName?.toLowerCase().includes(q) ||
                      p.student?.user?.email?.toLowerCase().includes(q) ||
                      p.invoiceNumber?.toLowerCase().includes(q) ||
                      p.hostel?.hostelName?.toLowerCase().includes(q);
    const statusMatch = !statusFilter || p.status === statusFilter;
    return nameMatch && statusMatch;
  });

  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + Number(p.amount||0), 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + Number(p.amount||0), 0);

  return (
    <DashboardLayout title="All Payments">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">Rs {totalPaid.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-0.5">Total Collected ({payments.filter(p=>p.status==='PAID').length})</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">Rs {totalPending.toLocaleString()}</p>
          <p className="text-xs text-yellow-600 mt-0.5">Pending ({payments.filter(p=>p.status==='PENDING').length})</p>
        </div>
        <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-700">{payments.length}</p>
          <p className="text-xs text-cyan-600 mt-0.5">Total Records</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search student, hostel, invoice..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:border-cyan-400">
          <option value="">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><CreditCard className="w-14 h-14 mx-auto mb-3 text-gray-200" /><p>No payments found.</p></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Student','Hostel','Month','Amount','Method','Status','Invoice','Date','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p: any) => (
                  <tr key={p.paymentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.student?.user?.fullName || '—'}</p>
                      <p className="text-xs text-gray-400">{p.student?.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.hostel?.hostelName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.feeMonth || '—'}</td>
                    <td className="px-4 py-3 font-semibold">Rs {Number(p.amount||0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-lg font-medium ${p.paymentMethod === 'KHALTI' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.paymentMethod || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SC[p.status] || 'bg-gray-100 text-gray-500'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.invoiceNumber || p.khaltiTransactionId?.slice(0,12) || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      {p.status !== 'PAID' && (
                        <button
                          onClick={() => updateStatus(p.paymentId, 'PAID')}
                          disabled={updating === p.paymentId}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100 disabled:opacity-60">
                          {updating === p.paymentId
                            ? <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                            : <Check className="w-3 h-3" />}
                          Mark Paid
                        </button>
                      )}
                      {p.status === 'PAID' && (
                        <button
                          onClick={() => updateStatus(p.paymentId, 'PENDING')}
                          disabled={updating === p.paymentId}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-200 disabled:opacity-60">
                          <X className="w-3 h-3" />Revert
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
