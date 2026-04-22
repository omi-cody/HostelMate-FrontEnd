import { useEffect, useState } from 'react';
import { Users, Search, Eye, X, Star, MapPin, GraduationCap, FileText, MessageSquare } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { adminService } from '../../services/adminService';

const BASE = 'http://localhost:9091';
const VC: Record<string,string> = { VERIFIED:'bg-green-100 text-green-700', PENDING:'bg-gray-100 text-gray-500', SUBMITTED:'bg-yellow-100 text-yellow-700', REJECTED:'bg-red-100 text-red-700' };

export default function AdminStudents() {
  const [all, setAll] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [tab, setTab] = useState<'info'|'reviews'>('info');
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [documentViewModel, setDocumentViewModel] = useState<string | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    adminService.getAllStudents()
      .then(r => { const d = r.data || r || []; setAll(d); setFiltered(d); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(all.filter(s =>
      (s.user?.fullName?.toLowerCase().includes(q) || s.user?.email?.toLowerCase().includes(q)) &&
      (!kycFilter || s.studentKyc?.kycStatus === kycFilter)
    ));
  }, [search, kycFilter, all]);

  const openStudent = (s: any) => {
    setSelected(s);
    setTab('info');
    // Load reviews whenever modal opens
    setReviewsLoading(true);
    adminService.getStudentReviews()
      .then((r: any) => {
        const all = r.data || r || [];
        setAllReviews(all);
      })
      .catch(() => setAllReviews([]))
      .finally(() => setReviewsLoading(false));
  };

  const kyc = selected?.studentKyc;
  // Filter reviews for selected student
  const studentReviews = allReviews.filter((r: any) =>
    r.student?.studentId === selected?.studentId
  );

  return (
    <DashboardLayout title={`All Students (${filtered.length})`}>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400" />
        </div>
        <select value={kycFilter} onChange={e => setKycFilter(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-cyan-400">
          <option value="">All Statuses</option>
          <option value="VERIFIED">Verified</option>
          <option value="SUBMITTED">Pending KYC</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
      : filtered.length === 0 ? <div className="text-center py-20 text-gray-400"><Users className="w-14 h-14 mx-auto mb-3 text-gray-200" /><p>No students found.</p></div>
      : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Student','Email','Phone','Gender','KYC Status','Institute','Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s: any) => (
                  <tr key={s.studentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {s.studentKyc?.profilePhotoUrl
                            ? <img src={`${BASE}${s.studentKyc.profilePhotoUrl}`} className="w-full h-full object-cover" alt="" />
                            : <span className="text-cyan-700 font-semibold text-xs">{s.user?.fullName?.charAt(0)}</span>}
                        </div>
                        <span className="font-medium">{s.user?.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.user?.email}</td>
                    <td className="px-4 py-3 text-gray-500">{s.user?.phone || '—'}</td>
                    <td className="px-4 py-3">{s.gender || '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${VC[s.studentKyc?.kycStatus] || 'bg-gray-100 text-gray-500'}`}>{s.studentKyc?.kycStatus || 'NO KYC'}</span></td>
                    <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{s.studentKyc?.instituteName || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openStudent(s)} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-xl text-xs font-medium hover:bg-cyan-100">
                        <Eye className="w-3.5 h-3.5" />View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold">Student Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>

            {/* Profile header */}
            <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {kyc?.profilePhotoUrl
                  ? <img src={`${BASE}${kyc.profilePhotoUrl}`} className="w-full h-full object-cover" alt="profile" />
                  : <span className="text-3xl font-bold text-cyan-600">{selected.user?.fullName?.charAt(0)}</span>}
              </div>
              <div>
                <h3 className="text-lg font-bold">{selected.user?.fullName}</h3>
                <p className="text-gray-500 text-sm">{selected.user?.email} · {selected.user?.phone}</p>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{selected.gender}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${VC[kyc?.kycStatus] || 'bg-gray-100 text-gray-500'}`}>{kyc?.kycStatus || 'No KYC'}</span>
                  {kyc?.dietType && <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">{kyc.dietType}</span>}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-6 py-3 border-b border-gray-100">
              <button onClick={() => setTab('info')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium ${tab === 'info' ? 'bg-cyan-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <FileText className="w-4 h-4" />Details
              </button>
              <button onClick={() => setTab('reviews')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium ${tab === 'reviews' ? 'bg-cyan-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <MessageSquare className="w-4 h-4" />Reviews {studentReviews.length > 0 && <span className="bg-white text-cyan-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{studentReviews.length}</span>}
              </button>
            </div>

            <div className="p-6 space-y-5">
              {tab === 'info' && kyc && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Personal</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[['Date of Birth', kyc.dateOfBirth],['Diet', kyc.dietType],['KYC Status', kyc.kycStatus]].filter(([,v]) => v).map(([k,v]) => (
                        <div key={k} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{k}</p><p className="font-medium text-sm">{v}</p></div>
                      ))}
                    </div>
                    {kyc.rejectionRemark && <div className="mt-2 bg-red-50 border border-red-100 rounded-xl p-3"><p className="text-xs text-red-500 font-medium mb-0.5">Rejection Reason</p><p className="text-sm text-red-700">{kyc.rejectionRemark}</p></div>}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Guardian</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[['Name', kyc.guardianName],['Relation', kyc.guardianRelation],['Phone', kyc.guardianPhone]].map(([k,v]) => (
                        <div key={k} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{k}</p><p className="font-medium text-sm">{v || '—'}</p></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />Institute</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[['Institute', kyc.instituteName],['Level', kyc.levelOfStudy],['Address', kyc.instituteAddress]].map(([k,v]) => (
                        <div key={k} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{k}</p><p className="font-medium text-sm">{v || '—'}</p></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"><MapPin className="w-4 h-4" />Address</p>
                    <div className="bg-gray-50 rounded-xl p-3"><p className="text-sm font-medium">{[kyc.tole, kyc.municipality, kyc.district, kyc.province].filter(Boolean).join(', ') || '—'}{kyc.wardNumber && ` · Ward ${kyc.wardNumber}`}</p></div>
                  </div>
                  {kyc.documentPhotoUrl && (
                    <button onClick={() => setDocumentViewModel('KYC Document')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-medium hover:bg-blue-100">
                      <Eye className="w-3.5 h-3.5" />View KYC Document
                    </button>
                  )}
                  {documentViewModel && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-xl overflow-hidden max-w-lg w-full">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                          <h3 className="text-lg font-medium">{documentViewModel}</h3>
                          <button onClick={() => setDocumentViewModel(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
                        </div>
                        <img src={`${BASE}${kyc.documentPhotoUrl}`} alt={documentViewModel} className="w-full h-auto" />
                      </div>
                    </div>
                   )} 
                </>
              )}

              {tab === 'reviews' && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Reviews Given by Hostels</p>
                  {reviewsLoading ? (
                    <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
                  ) : studentReviews.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <Star className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                      <p className="text-sm">No reviews yet for this student.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {studentReviews.map((r: any) => (
                        <div key={r.reviewId} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-sm font-semibold">{r.hostel?.hostelName || 'Unknown Hostel'}</p>
                            <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}</div>
                          </div>
                          {r.reviewText && <p className="text-sm text-gray-600">{r.reviewText}</p>}
                          <p className="text-xs text-gray-400 mt-1">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
