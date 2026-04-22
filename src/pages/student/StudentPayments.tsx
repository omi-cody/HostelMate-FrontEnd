import { useEffect, useState } from 'react';
import { CreditCard, Download, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { studentService } from '../../services/studentService';
import { toast } from 'react-toastify';

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700',
};

export default function StudentPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [admission, setAdmission] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPay, setShowPay] = useState(false);
  const [feeMonth, setFeeMonth] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    Promise.all([
      studentService.getPaymentHistory(),
      studentService.getMyHostel(),
      studentService.getDashboard(),
    ]).then(([p, h, d]) => {
      setPayments(p.data || p || []);
      const adm = h.data || h;
      setAdmission(adm?.hostelName !== 'Not admitted' ? adm : null);
      setDashboard(d.data || d);
    }).finally(() => setLoading(false));
  }, []);

  const initiatePayment = async () => {
    if (!feeMonth) { toast.error('Please select a fee month'); return; }
    if (!admission?.admissionId) { toast.error('No active admission found'); return; }
    setPaying(true);
    try {
      const res = await studentService.initiateKhaltiPayment({
        admissionId: admission.admissionId,
        feeMonth: feeMonth + '-01',
      });
      const d = res.data || res;
      if (d?.paymentUrl) {
        window.open(d.paymentUrl, '_blank');
        toast.info('Complete your payment in the Khalti window that just opened.');
        setShowPay(false);
      } else {
        toast.error('Could not get Khalti payment URL. Please try again.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Payment initiation failed');
    } finally { setPaying(false); }
  };

  const downloadPdf = async () => {
    try {
      const token = localStorage.getItem('token');
      const r = await fetch('http://localhost:9091/api/student/payments/export-pdf', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!r.ok) throw new Error('Download failed');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'payment-history.pdf'; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF download failed'); }
  };

  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + Number(p.amount || 0), 0);

  if (loading) return (
    <DashboardLayout title="Payments">
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Payments">
      {/* Summary cards */}
      {admission && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <p className="text-xs text-green-600 font-medium mb-1">Total Paid</p>
            <p className="text-xl font-bold text-green-700">Rs {totalPaid.toLocaleString()}</p>
          </div>
          <div className={`border rounded-2xl p-4 ${dashboard?.pendingAmount > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
            <p className={`text-xs font-medium mb-1 ${dashboard?.pendingAmount > 0 ? 'text-red-600' : 'text-gray-500'}`}>Pending Amount</p>
            <p className={`text-xl font-bold ${dashboard?.pendingAmount > 0 ? 'text-red-700' : 'text-gray-600'}`}>
              Rs {Number(dashboard?.pendingAmount || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4">
            <p className="text-xs text-cyan-600 font-medium mb-1">Monthly Fee</p>
            <p className="text-xl font-bold text-cyan-700">Rs {Number(admission?.monthlyFeeAmount || 0).toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-xs text-blue-600 font-medium mb-1">Next Due</p>
            <p className="text-sm font-bold text-blue-700">{dashboard?.nextFeeDueDate || 'N/A'}</p>
          </div>
        </div>
      )}

      {/* Pending fee reminder */}
      {dashboard?.pendingAmount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-800 flex-1">
            You have <strong>Rs {Number(dashboard.pendingAmount).toLocaleString()}</strong> in pending fees.
          </p>
          {admission?.status === 'ACTIVE' && (
            <button onClick={() => setShowPay(true)}
              className="text-sm px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium flex-shrink-0">
              Pay Now
            </button>
          )}
        </div>
      )}

      {/* Actions bar */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-500 text-sm">{payments.length} payment record{payments.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          {admission?.status === 'ACTIVE' && (
            <button onClick={() => setShowPay(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 text-sm font-medium">
              <Plus className="w-4 h-4" />Pay Fee
            </button>
          )}
          {payments.length > 0 && (
            <button onClick={downloadPdf}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium">
              <Download className="w-4 h-4" />Export PDF
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {payments.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CreditCard className="w-14 h-14 mx-auto mb-3 text-gray-200" />
          <p className="mb-2">No payment records yet.</p>
          {admission?.status === 'ACTIVE' && (
            <button onClick={() => setShowPay(true)}
              className="text-sm text-cyan-500 hover:text-cyan-600 font-medium">Pay your first monthly fee →</button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Fee Month', 'Amount', 'Discount', 'Method', 'Status', 'Invoice / Ref', 'Paid On'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p: any) => (
                  <tr key={p.paymentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.feeMonth || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">Rs {Number(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{p.discountAmount ? `Rs ${p.discountAmount}` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.paymentMethod === 'KHALTI' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status] || 'bg-gray-100'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.invoiceNumber || p.khaltiTransactionId || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : <span className="text-yellow-500">Pending</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Khalti Pay Modal */}
      {showPay && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-semibold mb-1">Pay Monthly Fee</h2>
            <p className="text-sm text-gray-500 mb-5">
              Monthly fee: <strong>Rs {Number(admission?.monthlyFeeAmount).toLocaleString()}</strong>
              {admission?.hostel?.hostelName && ` — ${admission.hostel.hostelName}`}
            </p>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">Fee Month *</label>
              <input type="month" value={feeMonth} onChange={e => setFeeMonth(e.target.value)}
                max={new Date().toISOString().slice(0, 7)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400" />
              <p className="text-xs text-gray-400 mt-1">Select the month you are paying for</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPay(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={initiatePayment} disabled={paying}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium disabled:opacity-60 flex items-center justify-center gap-2">
                {paying ? 'Opening...' : '💳 Pay with Khalti'}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">You'll be redirected to Khalti to complete payment securely.</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
