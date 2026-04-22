import { useEffect, useState } from 'react';
import { Wrench, Plus } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { studentService } from '../../services/studentService';
import { toast } from 'react-toastify';

const SC: Record<string,string> = { PENDING:'bg-yellow-100 text-yellow-700', IN_PROGRESS:'bg-blue-100 text-blue-700', RESOLVED:'bg-green-100 text-green-700' };

export default function StudentRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [sub, setSub] = useState(false);
  const [form, setForm] = useState({ requestType: 'COMPLAINT', title: '', description: '' });

  const load = () => studentService.getMyRequests().then(r => setRequests(r.data || r || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSub(true);
    try {
      await studentService.submitRequest(form);
      toast.success('Request submitted!');
      setShow(false); setForm({ requestType: 'COMPLAINT', title: '', description: '' }); load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Submit failed'); }
    finally { setSub(false); }
  };

  return (
    <DashboardLayout title="Complaints & Requests">
      <div className="flex justify-between items-center mb-5">
        <p className="text-gray-500 text-sm">{requests.length} requests</p>
        <button onClick={() => setShow(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 text-sm font-medium">
          <Plus className="w-4 h-4" />New Request
        </button>
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
      : requests.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><Wrench className="w-14 h-14 mx-auto mb-3 text-gray-200" /><p>No requests yet.</p></div>
      ) : (
        <div className="space-y-4">
          {requests.map((r: any) => (
            <div key={r.requestId} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${r.requestType === 'COMPLAINT' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{r.requestType}</span>
                    <h3 className="font-medium">{r.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{r.description}</p>
                  {r.hostelResponse && <p className="text-gray-400 text-xs mt-2 italic">Hostel: "{r.hostelResponse}"</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${SC[r.status] || 'bg-gray-100'}`}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-medium mb-4">New Request</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[['COMPLAINT','Complaint'],['MAINTENANCE','Maintenance']].map(([v,l]) => (
                    <button key={v} type="button" onClick={() => setForm(f => ({...f, requestType: v}))}
                      className={`py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${form.requestType === v ? 'border-cyan-400 bg-cyan-50 text-cyan-700' : 'border-gray-200 text-gray-600'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-2">Title *</label>
                <input type="text" required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400" /></div>
              <div><label className="block text-sm font-medium mb-2">Description *</label>
                <textarea required value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400 resize-none" /></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShow(false)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={sub} className="flex-1 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60">{sub ? 'Submitting...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
