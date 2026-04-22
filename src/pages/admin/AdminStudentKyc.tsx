import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { adminService } from '../../services/adminService';
import { toast } from 'react-toastify';

export default function AdminStudentKyc() {
  const [kycs, setKycs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<any>(null);
  const [action, setAction] = useState('');
  const [remark, setRemark] = useState('');
  const [proc, setProc] = useState(false);

  const load = () => adminService.getPendingStudentKyc().then(r => setKycs(r.data || r || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const verify = async () => {
    if (action === 'REJECTED' && !remark.trim()) { toast.error('Rejection remark is required'); return; }
    setProc(true);
    try {
      await adminService.verifyStudentKyc(sel.kycId, action, remark);
      toast.success(`Student KYC ${action === 'VERIFIED' ? 'approved' : 'rejected'}!`);
      setSel(null); setRemark(''); load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Action failed'); }
    finally { setProc(false); }
  };

  return (
    <DashboardLayout title="Student KYC Review">
      <p className="text-gray-500 text-sm mb-4">{kycs.length} pending submissions</p>
      {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
      : kycs.length === 0 ? (<div className="text-center py-20 text-gray-400"><ClipboardList className="w-14 h-14 mx-auto mb-3 text-gray-200" /><p>No pending KYC submissions.</p></div>)
      : (
        <div className="space-y-4">
          {kycs.map((k: any) => (
            <div key={k.kycId} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-lg">{k.student?.user?.fullName}</h3>
                  <p className="text-gray-500 text-sm">{k.student?.user?.email} · {k.student?.gender}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">{k.kycStatus}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-4">
                {[['DOB',k.dateOfBirth],['Diet',k.dietType],['Document',`${k.documentType} — ${k.identityNumber}`],['Institute',k.instituteName],['Level',k.levelOfStudy],['Address',`${k.municipality}, ${k.district}, ${k.province}`]].map(([label,val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                    <p className="font-medium text-xs">{val || '—'}</p>
                  </div>
                ))}
              </div>
              {k.documentPhotoUrl && (
                <a href={`http://localhost:9091${k.documentPhotoUrl}`} target="_blank" rel="noreferrer" className="text-xs text-cyan-500 hover:underline mr-3">View Document Photo</a>
              )}
              {k.profilePhotoUrl && (
                <a href={`http://localhost:9091${k.profilePhotoUrl}`} target="_blank" rel="noreferrer" className="text-xs text-cyan-500 hover:underline">View Profile Photo</a>
              )}
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setSel(k); setAction('VERIFIED'); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm hover:bg-green-100 font-medium">
                  <CheckCircle className="w-4 h-4" />Verify
                </button>
                <button onClick={() => { setSel(k); setAction('REJECTED'); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm hover:bg-red-100 font-medium">
                  <XCircle className="w-4 h-4" />Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {sel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-medium mb-3">{action === 'VERIFIED' ? 'Verify' : 'Reject'} KYC</h2>
            <p className="text-sm text-gray-500 mb-4">Student: <strong>{sel.student?.user?.fullName}</strong></p>
            {action === 'REJECTED' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5">Rejection Reason *</label>
                <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={3} required
                  placeholder="Tell the student what to fix..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400 resize-none" />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setSel(null)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={verify} disabled={proc}
                className={`flex-1 py-3 text-white rounded-xl font-medium disabled:opacity-60 ${action === 'VERIFIED' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {proc ? '...' : action === 'VERIFIED' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
