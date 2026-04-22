import { useEffect, useState } from 'react';
import { CreditCard, Download, Plus, Search, Users, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { hostelService } from '../../services/hostelService';
import { toast } from 'react-toastify';

const SC: Record<string, string> = { PAID: 'bg-green-100 text-green-700', PENDING: 'bg-yellow-100 text-yellow-700', FAILED: 'bg-red-100 text-red-700' };

export default function HostelPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'all' | 'by-student'>('all');
  const [search, setSearch] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ admissionId: '', feeMonth: '', discountAmount: '', note: '' });
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([hostelService.getPayments(), hostelService.getAdmittedStudents()])
      .then(([p, s]) => { setPayments(p.data || p || []); setStudents(s.data || s || []); })
      .finally(() => setLoading(false));
  }, []);

  // Group payments by student admissionId
  const grouped: Record<string, { student: any; payments: any[]; totalPaid: number; pending: number }> = {};
  payments.forEach((p: any) => {
    const admId = p.admission?.admissionId || 'unknown';
    if (!grouped[admId]) {
      grouped[admId] = { student: p.student, payments: [], totalPaid: 0, pending: 0 };
    }
    grouped[admId].payments.push(p);
    if (p.status === 'PAID') grouped[admId].totalPaid += Number(p.amount || 0);
    else grouped[admId].pending += Number(p.amount || 0);
  });

  const filteredPayments = payments.filter((p: any) =>
    p.student?.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.student?.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.invoiceNumber?.includes(search) || p.feeMonth?.includes(search)
  );

  const generateInvoice = async () => {
    if (!form.admissionId || !form.feeMonth) { toast.error('Select student and fee month'); return; }
    setSaving(true);
    try {
      await hostelService.generateInvoice({
        admissionId: form.admissionId, feeMonth: form.feeMonth + '-01',
        discountAmount: form.discountAmount ? parseFloat(form.discountAmount) : null, note: form.note
      });
      toast.success('Cash invoice generated!');
      setShowInvoice(false);
      setForm({ admissionId: '', feeMonth: '', discountAmount: '', note: '' });
      hostelService.getPayments().then(r => setPayments(r.data || r || []));
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Invoice generation failed'); }
    finally { setSaving(false); }
  };

  const downloadPdf = async () => {
    try {
      const token = localStorage.getItem('token');
      const r = await fetch('http://localhost:9091/api/hostel/payments/export-pdf', { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error('Download failed');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'financial-report.pdf'; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF download failed'); }
  };

  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <DashboardLayout title="Payments">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">Rs {totalPaid.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-0.5">Total Collected</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">Rs {totalPending.toLocaleString()}</p>
          <p className="text-xs text-yellow-600 mt-0.5">Total Pending</p>
        </div>
        <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-700">{payments.length}</p>
          <p className="text-xs text-cyan-600 mt-0.5">Total Records</p>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="flex gap-2">
          <button onClick={() => setView('all')} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${view === 'all' ? 'bg-cyan-400 text-white border-cyan-400' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>All Payments</button>
          <button onClick={() => setView('by-student')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${view === 'by-student' ? 'bg-cyan-400 text-white border-cyan-400' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}><Users className="w-4 h-4" />By Student</button>
        </div>
        <div className="flex-1 relative min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search student, month, invoice..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowInvoice(true)} className="flex items-center gap-2 px-4 py-2.5 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 text-sm font-medium">
            <Plus className="w-4 h-4" />Cash Invoice
          </button>
          <button onClick={downloadPdf} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium">
            <Download className="w-4 h-4" />Export PDF
          </button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>

      /* ── BY STUDENT VIEW ── */
      : view === 'by-student' ? (
        <div className="space-y-3">
          {Object.entries(grouped).length === 0 ? (
            <div className="text-center py-20 text-gray-400"><CreditCard className="w-14 h-14 mx-auto mb-3 text-gray-200" /><p>No payment records yet.</p></div>
          ) : Object.entries(grouped).map(([admId, data]) => {
            const name = data.student?.user?.fullName || 'Unknown';
            const isOpen = expanded === admId;
            const admission = students.find((s: any) => s.admissionId === admId);
            const monthlyFee = admission?.monthlyFeeAmount;
            // Calculate months since admission and expected payments
            const admDate = admission?.admittedDate ? new Date(admission.admittedDate) : null;
            const monthsSince = admDate ? Math.max(0, Math.floor((Date.now() - admDate.getTime()) / (30 * 24 * 3600 * 1000))) : 0;
            const expectedTotal = monthlyFee ? monthsSince * Number(monthlyFee) : null;
            const due = expectedTotal !== null ? Math.max(0, expectedTotal - data.totalPaid) : null;
            return (
              <div key={admId} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : admId)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-700 font-bold text-sm">{name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{name}</p>
                    <p className="text-xs text-gray-400">{data.student?.user?.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-green-600">Rs {data.totalPaid.toLocaleString()} paid</p>
                    {due !== null && due > 0 && <p className="text-xs font-semibold text-red-500 flex items-center justify-end gap-1"><AlertCircle className="w-3 h-3" />Rs {due.toLocaleString()} due</p>}
                    {data.pending > 0 && <p className="text-xs text-yellow-600">Rs {data.pending.toLocaleString()} pending</p>}
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead className="bg-gray-50">
                        <tr>{['Fee Month', 'Amount', 'Discount', 'Method', 'Status', 'Date'].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs text-gray-500 font-semibold">{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.payments.map((p: any) => (
                          <tr key={p.paymentId} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5">{p.feeMonth || '—'}</td>
                            <td className="px-4 py-2.5 font-medium">Rs {Number(p.amount).toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-gray-400">{p.discountAmount ? `Rs ${p.discountAmount}` : '—'}</td>
                            <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-xs rounded ${p.paymentMethod === 'KHALTI' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{p.paymentMethod}</span></td>
                            <td className="px-4 py-2.5"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${SC[p.status]}`}>{p.status}</span></td>
                            <td className="px-4 py-2.5 text-gray-400 text-xs">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'Pending'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      /* ── ALL PAYMENTS TABLE ── */
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><CreditCard className="w-14 h-14 mx-auto mb-3 text-gray-200" /><p>No payment records.</p></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Student','Month','Amount','Discount','Method','Status','Invoice','Date'].map(h => <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayments.map((p: any) => (
                  <tr key={p.paymentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.student?.user?.fullName || '—'}</td>
                    <td className="px-4 py-3">{p.feeMonth || '—'}</td>
                    <td className="px-4 py-3 font-semibold">Rs {Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400">{p.discountAmount ? `Rs ${p.discountAmount}` : '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded ${p.paymentMethod === 'KHALTI' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{p.paymentMethod}</span></td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${SC[p.status]}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.invoiceNumber || p.khaltiTransactionId || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : <span className="text-yellow-500">Pending</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cash Invoice Modal */}
      {showInvoice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-semibold mb-5">Generate Cash Invoice</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1.5">Student *</label>
                <select value={form.admissionId} onChange={e => setForm(f => ({...f, admissionId: e.target.value}))} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400 bg-white">
                  <option value="">Select student</option>
                  {students.map((s: any) => <option key={s.admissionId} value={s.admissionId}>{s.student?.user?.fullName} — Room {s.room?.roomNumber}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium mb-1.5">Fee Month *</label>
                <input type="month" value={form.feeMonth} onChange={e => setForm(f => ({...f, feeMonth: e.target.value}))} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400" /></div>
              <div><label className="block text-sm font-medium mb-1.5">Discount (Rs) optional</label>
                <input type="number" min="0" value={form.discountAmount} onChange={e => setForm(f => ({...f, discountAmount: e.target.value}))} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400" /></div>
              <div><label className="block text-sm font-medium mb-1.5">Note</label>
                <input type="text" value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} placeholder="e.g. Early payment discount" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400" /></div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowInvoice(false)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={generateInvoice} disabled={saving} className="flex-1 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60">{saving ? 'Generating...' : 'Generate'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
