import { useEffect, useState } from 'react';
import { FileText, Check, X, Calendar, Home, Trash2, ChevronDown, Eye, MapPin, GraduationCap, Phone } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { hostelService } from '../../services/hostelService';
import { toast } from 'react-toastify';

const SC: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  VISIT_SCHEDULED: 'bg-purple-100 text-purple-700',
  ADMITTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function HostelApplications() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [modal, setModal] = useState<{ app: any; type: string } | null>(null);
  const [detailApp, setDetailApp] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const[showDeleteModel, setShowDeleteModel] = useState<{ id: string; status: string } | null>(null);
  const [form, setForm] = useState({ roomId: '', remark: '', visitDateTime: '' });
  const [saving, setSaving] = useState(false);

  const load = () =>
    hostelService.getApplications()
      .then(r => setApps(r.data || r || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    hostelService.getRooms().then(r => setRooms(r.data || r || []));
  }, []);

  const openModal = (app: any, type: string) => {
    setForm({ roomId: '', remark: '', visitDateTime: '' });
    setModal({ app, type });
  };

  const deleteApp = async (id: string, status: string) => {
    if (status === 'ADMITTED') { toast.error('Cannot delete an admitted application'); return; }

    try {
      await hostelService.deleteApplication(id);
      setShowDeleteModel(null);
      toast.success('Application deleted');
      load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Delete failed'); }  
  };

  const submit = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      const { app, type } = modal;
      if (type === 'accept') {
        // Accept without room - room allocated after student pays admission fee
        await hostelService.acceptApplication(app.applicationId, null);
        toast.success('Application accepted! Student will be notified to pay the admission fee.');
      } else if (type === 'reject') {
        await hostelService.rejectApplication(app.applicationId, form.remark);
        toast.success('Application rejected');
      } else if (type === 'schedule') {
        if (!form.visitDateTime) { toast.error('Set visit date/time'); setSaving(false); return; }
        await hostelService.scheduleVisit(app.applicationId, form.visitDateTime);
        toast.success('Visit scheduled');
      } else if (type === 'admit') {
        if (!form.roomId) { toast.error('Select a room'); setSaving(false); return; }
        await hostelService.admitAfterVisit(app.applicationId, form.roomId);
        toast.success('Student admitted successfully!');
      }
      setModal(null);
      load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Action failed'); }
    finally { setSaving(false); }
  };

  const filters = ['ALL', 'PENDING', 'ACCEPTED', 'VISIT_SCHEDULED', 'ADMITTED', 'REJECTED', 'CANCELLED'];
  const displayed = filter === 'ALL' ? apps : apps.filter(a => a.status === filter);

  return (
    <DashboardLayout title={`Applications (${apps.length})`}>
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex-shrink-0 ${
              filter === f ? 'bg-cyan-400 text-white border-cyan-400' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}>
            {f === 'ALL' ? `All (${apps.length})` : `${f.replace('_', ' ')} (${apps.filter(a => a.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="w-14 h-14 mx-auto mb-3 text-gray-200" />
          <p>No {filter === 'ALL' ? '' : filter.replace('_', ' ').toLowerCase() + ' '}applications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((a: any) => (
            <div key={a.applicationId} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-lg">{a.student?.user?.fullName}</p>
                  </div>
                  <p className="text-sm text-gray-500">{a.student?.user?.email} · {a.student?.user?.phone}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-lg">{a.roomType}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-lg">{a.applicationType?.replace('_', ' ')}</span>
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-xs rounded-lg">
                      {new Date(a.appliedAt).toLocaleDateString()}
                    </span>
                    {/* Student KYC info */}
                    {a.student?.studentKyc?.instituteName && (
                      <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs rounded-lg">
                        {a.student.studentKyc.instituteName}
                      </span>
                    )}
                    {a.student?.studentKyc?.levelOfStudy && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-lg">
                        {a.student.studentKyc.levelOfStudy}
                      </span>
                    )}
                  </div>
                  {a.visitScheduledAt && (
                    <p className="text-purple-600 text-sm mt-1.5 flex items-center gap-1">
                       Visit: {new Date(a.visitScheduledAt).toLocaleString()}
                    </p>
                  )}
                  {a.remark && <p className="text-gray-500 text-sm mt-1 italic">Note: {a.remark}</p>}
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${SC[a.status] || 'bg-gray-100'}`}>
                  {a.status.replace('_', ' ')}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap pt-3 border-t border-gray-100">
                <button onClick={() => setDetailApp(a)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-sm hover:bg-gray-100 font-medium">
                  <Eye className="w-4 h-4" />View Student
                </button>
                {/* PENDING actions */}
                {a.status === 'PENDING' && <>
                  <button onClick={() => openModal(a, 'accept')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm hover:bg-green-100 font-medium">
                    <Check className="w-4 h-4" />Accept
                  </button>
                  {a.applicationType === 'VISIT' && (
                    <button onClick={() => openModal(a, 'schedule')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-sm hover:bg-purple-100 font-medium">
                      <Calendar className="w-4 h-4" />Schedule Visit
                    </button>
                  )}
                  <button onClick={() => openModal(a, 'reject')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm hover:bg-red-100 font-medium">
                    <X className="w-4 h-4" />Reject
                  </button>
                </>}

                {/* VISIT_SCHEDULED action */}
                {a.status === 'VISIT_SCHEDULED' && (
                  <button onClick={() => openModal(a, 'admit')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm hover:bg-green-100 font-medium">
                    <Home className="w-4 h-4" />Admit After Visit
                  </button>
                )}

                {/* ACCEPTED info */}
                {a.status === 'ACCEPTED' && (
                  <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                     Awaiting student payment
                  </span>
                )}

                {/* DELETE — available for all except ADMITTED */}
                {a.status !== 'ADMITTED' && (
                  <button onClick={() => setShowDeleteModel({ id: a.applicationId, status: a.status })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-xl text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 font-medium ml-auto transition-colors">
                    <Trash2 className="w-4 h-4" />Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteModel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Delete Application</h2>
              <button onClick={() => setShowDeleteModel(  null)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4"> 
              <p className="text-sm text-gray-500">Are you sure you want to delete this application?</p>
              <div className="flex gap-2">  
                <button onClick={() => setShowDeleteModel(null)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={() => deleteApp(showDeleteModel.id, showDeleteModel.status)} className="flex-1 py-3 text-white rounded-xl font-semibold bg-red-500 hover:bg-red-600">Delete</button>
                
              </div>
            </div>
          </div>
        </div>
      )}

      


      {/* Student Detail Modal */}
      {detailApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Applicant Details</h2>
              <button onClick={() => setDetailApp(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-cyan-100 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {detailApp.student?.studentKyc?.profilePhotoUrl
                    ? <img src={`http://localhost:9091${detailApp.student.studentKyc.profilePhotoUrl}`} className="w-full h-full object-cover" alt="" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                    : <span className="text-3xl font-bold text-cyan-600">{detailApp.student?.user?.fullName?.charAt(0)}</span>}
                </div>
                <div>
                  <p className="text-xl font-bold">{detailApp.student?.user?.fullName}</p>
                  <p className="text-sm text-gray-500">{detailApp.student?.user?.email}</p>
                  <p className="text-sm text-gray-500">{detailApp.student?.user?.phone}</p>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{detailApp.student?.gender}</span>
                    {detailApp.student?.studentKyc?.dietType && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">{detailApp.student.studentKyc.dietType}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Application info */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Application</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['Room Type', detailApp.roomType],
                    ['Type', detailApp.applicationType?.replace('_',' ')],
                    ['Status', detailApp.status],
                    ['Applied', new Date(detailApp.appliedAt).toLocaleDateString()],
                  ].map(([k,v]) => (
                    <div key={k} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                      <p className="font-medium text-sm">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              {detailApp.student?.studentKyc && (() => {
                const kyc = detailApp.student.studentKyc;
                return (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />Education</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[['Institute', kyc.instituteName],['Level', kyc.levelOfStudy],['Address', kyc.instituteAddress]].map(([k,v]) => (
                          <div key={k} className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                            <p className="font-medium text-sm">{v || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Guardian</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[['Name', kyc.guardianName],['Relation', kyc.guardianRelation],['Phone', kyc.guardianPhone]].map(([k,v]) => (
                          <div key={k} className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                            <p className="font-medium text-sm">{v || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {(kyc.municipality || kyc.district) && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"><MapPin className="w-4 h-4" />Address</p>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-sm">{[kyc.tole, kyc.municipality, kyc.district, kyc.province].filter(Boolean).join(', ')}</p>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      {/* Action Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              {modal.type === 'accept' ? 'Accept Application' :
               modal.type === 'reject' ? 'Reject Application' :
               modal.type === 'schedule' ? 'Schedule Visit' :
               ' Admit After Visit'}
            </h2>

            <div className="space-y-4">
              {/* ACCEPT: no room needed - allocated after payment */}
              {modal.type === 'accept' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-sm font-semibold text-blue-800 mb-1">Accept Application</p>
                  <p className="text-sm text-blue-600">Student will be notified to pay the admission fee. After payment, go to <strong>Students</strong> tab to allocate a room.</p>
                </div>
              )}
              {/* ADMIT AFTER VISIT: room needed */}
              {modal.type === 'admit' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Select Room * <span className="text-gray-400 font-normal">(for {modal.app.roomType})</span>
                  </label>
                  <select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400 bg-white">
                    <option value="">Choose a room</option>
                    {rooms.filter(r => r.roomType === modal.app.roomType).map((r: any) => (
                      <option key={r.roomId} value={r.roomId}>
                        Room {r.roomNumber} — Floor {r.floor} ({r.roomType})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {modal.type === 'reject' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Reason (optional)</label>
                  <textarea value={form.remark}
                    onChange={e => setForm(f => ({ ...f, remark: e.target.value }))}
                    rows={3} placeholder="Reason for rejection..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400 resize-none" />
                </div>
              )}

              {modal.type === 'schedule' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Visit Date & Time *</label>
                  <input type="datetime-local" value={form.visitDateTime}
                    onChange={e => setForm(f => ({ ...f, visitDateTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400" />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={submit} disabled={saving}
                className={`flex-1 py-3 text-white rounded-xl font-semibold disabled:opacity-60 transition-colors ${
                  modal.type === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-400 hover:bg-cyan-500'
                }`}>
                {saving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
