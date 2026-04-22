import { useEffect, useState } from 'react';
import { Wrench, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { hostelService } from '../../services/hostelService';
import { toast } from 'react-toastify';

const SC: Record<string,string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
};
const NEXT: Record<string,string> = { PENDING: 'IN_PROGRESS', IN_PROGRESS: 'RESOLVED' };

export default function HostelRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upd, setUpd] = useState<string|null>(null);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const[ShowDeleteModel, setShowDeleteModel] = useState<{id:string}|null>(null);
  const [remarkModal, setRemarkModal] = useState<{id:string, status:string}|null>(null);
  const [hostelResponse, setHostelResponse] = useState('');

  const load = () => hostelService.getRequests()
    .then(r => setRequests(r.data || r || []))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string, response = '') => {
    setUpd(id);
    try {
      await hostelService.updateRequestStatus(id, { status, hostelResponse: response });
      toast.success(`Marked as ${status.replace('_', ' ')}`);
      setRequests(r => r.map(x => x.requestId === id ? {...x, status, hostelResponse: response} : x));
      setRemarkModal(null);
      setHostelResponse('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally { setUpd(null); }
  };

  const deleteRequest = async (id: string) => {
    
    try {
      await hostelService.deleteRequest(id);
      toast.success('Request deleted');
      setRequests(r => r.filter(x => x.requestId !== id));
      setShowDeleteModel(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  const displayed = filterStatus ? requests.filter(r => r.status === filterStatus) : requests;

  return (
    <DashboardLayout title="Complaints & Requests">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(s => {
          const cnt = s ? requests.filter(r => r.status === s).length : requests.length;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filterStatus === s ? 'bg-cyan-400 text-white border-cyan-400' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {s ? s.replace('_', ' ') : 'All'} ({cnt})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Wrench className="w-14 h-14 mx-auto mb-3 text-gray-200" />
          <p>No {filterStatus ? filterStatus.replace('_',' ').toLowerCase() : ''} requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((r: any) => (
            <div key={r.requestId} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold">{r.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{r.requestType}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${SC[r.status]}`}>{r.status.replace('_',' ')}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{r.description}</p>
                  <p className="text-xs text-gray-400">
                    By {r.student?.user?.fullName} · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  {r.hostelResponse && (
                    <div className="mt-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5 font-semibold">Your Response</p>
                      <p className="text-sm text-gray-700">{r.hostelResponse}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {NEXT[r.status] && (
                    <button
                      onClick={() => { setRemarkModal({id: r.requestId, status: NEXT[r.status]}); setHostelResponse(''); }}
                      disabled={upd === r.requestId}
                      className="px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-xl text-xs font-medium hover:bg-cyan-100 whitespace-nowrap">
                      Mark {NEXT[r.status].replace('_', ' ')}
                    </button>
                  )}
                  {/* Delete only for RESOLVED requests */}
                  {r.status === 'RESOLVED' && (
                    <button
                      onClick={() => setShowDeleteModel({id: r.requestId})}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-xl text-xs font-medium hover:bg-red-100">
                      <Trash2 className="w-3.5 h-3.5" />Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {ShowDeleteModel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Delete Request</h2>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this request?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModel(null)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button> 
              <button onClick={() => deleteRequest(ShowDeleteModel.id)} className="flex-1 py-3 bg-red-50 text-red-500 border border-red-200 rounded-xl hover:bg-red-100">Delete</button>
            </div>
          </div>  
        </div>
      )}
      {/* Remark Modal */}
      {remarkModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Mark as {remarkModal.status.replace('_', ' ')}</h2>
            <textarea value={hostelResponse} onChange={e => setHostelResponse(e.target.value)}
              rows={3} placeholder="Add a response or note for the student (optional)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setRemarkModal(null)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => updateStatus(remarkModal.id, remarkModal.status, hostelResponse)}
                className="flex-1 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
