import { useEffect, useState } from 'react';
import { Users, Search, Star, LogOut, CheckCircle, XCircle, Eye, X, MapPin, Phone, GraduationCap, CreditCard, BedDouble } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { hostelService } from '../../services/hostelService';
import { toast } from 'react-toastify';

const BASE = 'http://localhost:9091';
const STATUS_COLORS: Record<string,string> = {
  PENDING_PAYMENT: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  LEAVE_REQUESTED: 'bg-yellow-100 text-yellow-700',
  LEFT: 'bg-gray-100 text-gray-500',
};

export default function HostelStudents() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');  // default: show all

  // Detail modal
  const [detailModal, setDetailModal] = useState<any>(null);
  const [detailTab, setDetailTab] = useState<'info'|'payment'|'allocate'>('info');

  // Rating modal
  const [rateModal, setRateModal] = useState<any>(null);
  const [review, setReview] = useState({ rating: 5, reviewText: '' });
  const [submitting, setSubmitting] = useState(false);

  // Leave response modal
  const [leaveModal, setLeaveModal] = useState<any>(null);
  const [leaveRemark, setLeaveRemark] = useState('');
  const [leaveAction, setLeaveAction] = useState<boolean|null>(null);
  const [processingLeave, setProcessingLeave] = useState(false);

  // Room allocation
  const [allocatingRoom, setAllocatingRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');

  const load = () =>
    Promise.all([
      hostelService.hostelGetAllAdmissions(),
      hostelService.getRooms(),
    ]).then(([a, r]) => {
      setAdmissions(a.data || a || []);
      setRooms(r.data || r || []);
    }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(admissions.filter((a: any) => {
      const name = a.student?.user?.fullName?.toLowerCase();
      const email = a.student?.user?.email?.toLowerCase();
      const matchSearch = !q || name?.includes(q) || email?.includes(q);
      const matchStatus = !statusFilter || a.status === statusFilter;
      return matchSearch && matchStatus;
    }));
  }, [search, statusFilter, admissions]);

  const allocateRoom = async () => {
    if (!selectedRoom || !detailModal) return;
    setAllocatingRoom(true);
    try {
      await hostelService.allocateRoom(detailModal.admissionId, selectedRoom);
      toast.success('Room allocated successfully!');
      setDetailModal(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Room allocation failed');
    } finally { setAllocatingRoom(false); }
  };

  const submitReview = async () => {
    if (!rateModal) return;
    setSubmitting(true);
    try {
      await hostelService.reviewStudent(rateModal.admissionId, review);
      toast.success('Review submitted!');
      setRateModal(null);
      setReview({ rating: 5, reviewText: '' });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Review failed');
    } finally { setSubmitting(false); }
  };

  const respondLeave = async () => {
    if (!leaveModal || leaveAction === null) return;
    setProcessingLeave(true);
    try {
      await hostelService.respondToLeave(leaveModal.admissionId, leaveAction, leaveRemark);
      toast.success(leaveAction ? 'Leave approved. Student has left.' : 'Leave rejected.');
      setLeaveModal(null); setLeaveRemark(''); setLeaveAction(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally { setProcessingLeave(false); }
  };

  const counts = {
    PENDING_PAYMENT: admissions.filter(a => a.status === 'PENDING_PAYMENT').length,
    ACTIVE: admissions.filter(a => a.status === 'ACTIVE').length,
    LEAVE_REQUESTED: admissions.filter(a => a.status === 'LEAVE_REQUESTED').length,
    LEFT: admissions.filter(a => a.status === 'LEFT').length,
  };

  const openDetail = (a: any) => {
    setDetailModal(a);
    setDetailTab(a.status === 'ACTIVE' && !a.room ? 'allocate' : 'info');
    setSelectedRoom('');
  };

  return (
    <DashboardLayout title="Students">
      {/* Stats row */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[
          ['PENDING_PAYMENT','Awaiting Payment','bg-blue-50 border-blue-100 text-blue-700'],
          ['ACTIVE','Active','bg-green-50 border-green-100 text-green-700'],
          ['LEAVE_REQUESTED','Leave Requested','bg-yellow-50 border-yellow-100 text-yellow-700'],
          ['LEFT','Left','bg-gray-50 border-gray-200 text-gray-600'],
        ].map(([status, label, cls]) => (
          <button key={status} onClick={() => setStatusFilter(status as string)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${cls} ${statusFilter === status ? 'ring-2 ring-offset-1 ring-current' : 'opacity-70 hover:opacity-100'}`}>
            {label} <span className="font-bold">({counts[status as keyof typeof counts]})</span>
          </button>
        ))}
        <button onClick={() => setStatusFilter('')} className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${!statusFilter ? 'bg-cyan-400 text-white border-cyan-400' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
          All ({admissions.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><Users className="w-14 h-14 mx-auto mb-3 text-gray-200" /><p>No students found.</p></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Student','Room','Monthly Fee','Status','Admitted','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((a: any) => (
                  <tr key={a.admissionId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {a.student?.studentKyc?.profilePhotoUrl
                            ? <img src={`${BASE}${a.student.studentKyc.profilePhotoUrl}`} className="w-full h-full object-cover" alt="" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                            : <span className="text-cyan-700 font-bold text-sm">{a.student?.user?.fullName?.charAt(0)}</span>}
                        </div>
                        <div>
                          <p className="font-semibold">{a.student?.user?.fullName}</p>
                          <p className="text-xs text-gray-400">{a.student?.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {a.room ? (
                        <span className="font-medium">Room {a.room.roomNumber} <span className="text-xs text-gray-400">({a.room.roomType})</span></span>
                      ) : (
                        <span className="text-yellow-600 text-xs font-medium bg-yellow-50 px-2 py-0.5 rounded-lg">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {a.monthlyFeeAmount ? `Rs ${Number(a.monthlyFeeAmount).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[a.status] || 'bg-gray-100'}`}>
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{a.admittedDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {a.status !== 'LEFT' && (
                          <button onClick={() => openDetail(a)} className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg text-xs font-medium hover:bg-cyan-100">
                            <Eye className="w-3.5 h-3.5" />View
                          </button>
                        )}
                        {a.status === 'LEAVE_REQUESTED' && (
                          <button onClick={() => { setLeaveModal(a); setLeaveAction(null); setLeaveRemark(''); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-medium hover:bg-yellow-100">
                            <LogOut className="w-3.5 h-3.5" />Respond
                          </button>
                        )}
                        {a.status === 'LEFT' && !a.studentReviewSubmitted && (
                          <button onClick={() => { setRateModal(a); setReview({ rating: 5, reviewText: '' }); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-medium hover:bg-purple-100">
                            <Star className="w-3.5 h-3.5" />Rate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Student Detail Modal ── */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Student Details</h2>
              <button onClick={() => setDetailModal(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>

            {/* Student header */}
            <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-cyan-100 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                {detailModal.student?.studentKyc?.profilePhotoUrl
                  ? <img src={`${BASE}${detailModal.student.studentKyc.profilePhotoUrl}`} className="w-full h-full object-cover" alt="" />
                  : <span className="text-3xl font-bold text-cyan-600">{detailModal.student?.user?.fullName?.charAt(0)}</span>}
              </div>
              <div>
                <p className="text-xl font-bold">{detailModal.student?.user?.fullName}</p>
                <p className="text-gray-500 text-sm">{detailModal.student?.user?.email}</p>
                <p className="text-gray-500 text-sm">{detailModal.student?.user?.phone}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[detailModal.status]}`}>{detailModal.status.replace('_',' ')}</span>
                  {detailModal.student?.gender && <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{detailModal.student.gender}</span>}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-6 py-3 border-b border-gray-100">
              {[['info','Info'],['payment','Payment'],['allocate','Room Allocation']].map(([t,l]) => (
                <button key={t} onClick={() => setDetailTab(t as any)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium ${detailTab === t ? 'bg-cyan-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{l}</button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              {/* INFO TAB */}
              {detailTab === 'info' && (() => {
                const kyc = detailModal.student?.studentKyc;
                return (
                  <div className="space-y-4">
                    {/* Admission info */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Admission Details</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ['Admitted', detailModal.admittedDate],
                          ['Room', detailModal.room ? `Room ${detailModal.room.roomNumber} (${detailModal.room.roomType})` : 'Not assigned'],
                          ['Monthly Fee', detailModal.monthlyFeeAmount ? `Rs ${Number(detailModal.monthlyFeeAmount).toLocaleString()}` : '—'],
                          ['Status', detailModal.status.replace('_',' ')],
                        ].map(([k,v]) => (
                          <div key={k} className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                            <p className="font-medium text-sm">{v || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {kyc && (
                      <>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />Education</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[['Institute', kyc.instituteName],['Level', kyc.levelOfStudy],['Diet', kyc.dietType],['DOB', kyc.dateOfBirth]].map(([k,v]) => (
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
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"><MapPin className="w-4 h-4" />Address</p>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-sm">{[kyc.tole, kyc.municipality, kyc.district, kyc.province].filter(Boolean).join(', ') || '—'}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* PAYMENT TAB */}
              {detailTab === 'payment' && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment Status</p>
                  {detailModal.status === 'PENDING_PAYMENT' ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="font-semibold text-blue-800">⏳ Awaiting Admission Fee Payment</p>
                      <p className="text-sm text-blue-600 mt-1">Student has been notified to pay the admission fee. Once paid, you can allocate a room.</p>
                      <p className="text-sm text-gray-500 mt-2">You can also mark it as paid manually from the Payments page if student pays cash.</p>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="font-semibold text-green-800">✅ Admission Fee Paid</p>
                      <p className="text-sm text-green-600 mt-1">Student is active. Monthly fee: Rs {Number(detailModal.monthlyFeeAmount || 0).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ALLOCATE ROOM TAB */}
              {detailTab === 'allocate' && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4" />Allocate Room
                  </p>
                  {detailModal.room ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="font-semibold text-green-800">Room already assigned</p>
                      <p className="text-sm text-green-700 mt-1">Room {detailModal.room.roomNumber} ({detailModal.room.roomType}) — Floor {detailModal.room.floor}</p>
                    </div>
                  ) : detailModal.status !== 'ACTIVE' ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="font-semibold text-yellow-800">⚠ Admission fee not paid yet</p>
                      <p className="text-sm text-yellow-700 mt-1">Room can only be allocated after the student pays the admission fee.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Select a room for this student:</p>
                      <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400 bg-white">
                        <option value="">Choose a room</option>
                        {rooms.filter(r => r.roomType === detailModal.student?.studentKyc?.levelOfStudy || true).map((r: any) => (
                          <option key={r.roomId} value={r.roomId}>
                            Room {r.roomNumber} — {r.roomType} (Floor {r.floor})
                          </option>
                        ))}
                      </select>
                      <button onClick={allocateRoom} disabled={!selectedRoom || allocatingRoom}
                        className="w-full py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-semibold disabled:opacity-60 transition-colors">
                        {allocatingRoom ? 'Allocating...' : 'Allocate Room'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Leave Response Modal ── */}
      {leaveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-semibold mb-2">Respond to Leave Request</h2>
            <p className="text-sm text-gray-500 mb-4">{leaveModal.student?.user?.fullName} has requested to leave.</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={() => setLeaveAction(true)} className={`py-3 rounded-xl border-2 font-medium text-sm transition-all flex items-center justify-center gap-2 ${leaveAction === true ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                <CheckCircle className="w-4 h-4" />Approve
              </button>
              <button onClick={() => setLeaveAction(false)} className={`py-3 rounded-xl border-2 font-medium text-sm transition-all flex items-center justify-center gap-2 ${leaveAction === false ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}>
                <XCircle className="w-4 h-4" />Reject
              </button>
            </div>
            <textarea value={leaveRemark} onChange={e => setLeaveRemark(e.target.value)} rows={2}
              placeholder={leaveAction === false ? 'Reason for rejection (required)...' : 'Optional remark...'}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setLeaveModal(null)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={respondLeave} disabled={leaveAction === null || processingLeave}
                className="flex-1 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-semibold disabled:opacity-60">
                {processingLeave ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rate Student Modal ── */}
      {rateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Rate {rateModal.student?.user?.fullName}</h2>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Rating</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(r => (
                  <button key={r} onClick={() => setReview(v => ({...v, rating: r}))}
                    className={`w-12 h-12 rounded-xl font-bold text-xl transition-all ${r <= review.rating ? 'bg-yellow-400 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={review.reviewText} onChange={e => setReview(v => ({...v, reviewText: e.target.value}))}
              rows={3} placeholder="Write a review about this student's behavior and cleanliness..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-cyan-400 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setRateModal(null)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={submitReview} disabled={submitting}
                className="flex-1 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-semibold disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
