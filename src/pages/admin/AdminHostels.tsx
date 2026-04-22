import { useEffect, useState } from 'react';
import { Building, Search, Eye, X, MapPin, Phone, Mail, Star, Users, CreditCard, Utensils } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { adminService } from '../../services/adminService';

const BASE = 'http://localhost:9091';
const DAYS = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];

const VC: Record<string,string> = {
  VERIFIED: 'bg-green-100 text-green-700',
  PENDING: 'bg-gray-100 text-gray-500',
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function AdminHostels() {
  const [all, setAll] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentViewModel, setDocumentViewModel] = useState<string|null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [hostelReviews, setHostelReviews] = useState<any[]>([]);
  const [hostelAdmissions, setHostelAdmissions] = useState<any[]>([]);
  const [admissionsLoading, setAdmissionsLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'info'|'rooms'|'meals'|'students'>('info');

  useEffect(() => {
    adminService.getAllHostels()
      .then(r => { const d = r.data || r || []; setAll(d); setFiltered(d); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(all.filter(h =>
      (h.hostelName?.toLowerCase().includes(q) || h.ownerName?.toLowerCase().includes(q) || h.user?.email?.toLowerCase().includes(q)) &&
      (!typeFilter || h.hostelType === typeFilter) &&
      (!statusFilter || h.verificationStatus === statusFilter)
    ));
  }, [search, typeFilter, statusFilter, all]);

  const open = (h: any) => {
    setSelected(h);
    setDetailTab('info');
    setHostelAdmissions([]);
    setReviewsLoading(true);
    setAdmissionsLoading(true);
    adminService.getHostelReviews()
      .then((r: any) => setHostelReviews(r.data || r || []))
      .catch(() => setHostelReviews([]))
      .finally(() => setReviewsLoading(false));
    adminService.getHostelAdmissions(h.hostelId)
      .then((r: any) => setHostelAdmissions(r.data || r || []))
      .catch(() => setHostelAdmissions([]))
      .finally(() => setAdmissionsLoading(false));
  };

  const kyc = selected?.hostelKyc;
  const rooms = selected?.rooms || [];
  const admissions = selected?.admissions || [];

  // Parse hostel photos
  let photos: string[] = [];
  if (kyc?.hostelPhotoUrls) {
    try { photos = JSON.parse(kyc.hostelPhotoUrls); } catch {
      photos = kyc.hostelPhotoUrls.split(',').map((u: string) => u.trim()).filter(Boolean);
    }
  }

  const avgRating = selected?.reviews?.length
    ? (selected.reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / selected.reviews.length).toFixed(1)
    : null;

  return (
    <DashboardLayout title={`All Hostels (${filtered.length})`}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search by hostel, owner or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400 bg-white">
          <option value="">All Types</option>
          <option value="BOYS">Boys</option>
          <option value="GIRLS">Girls</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400 bg-white">
          <option value="">All Statuses</option>
          <option value="VERIFIED">Verified</option>
          <option value="SUBMITTED">Pending KYC</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Building className="w-14 h-14 mx-auto mb-3 text-gray-200" />
          <p>No hostels found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Hostel','Owner','Type','Email','Rooms','Students','Status','Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((h: any) => {
                  const activeStudents = 0; // loaded separately per hostel
                  return (
                    <tr key={h.hostelId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {h.hostelKyc?.logoUrl
                              ? <img src={`${BASE}${h.hostelKyc.logoUrl}`} className="w-full h-full object-cover" alt="" />
                              : <Building className="w-4 h-4 text-cyan-600" />}
                          </div>
                          <span className="font-medium">{h.hostelName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{h.ownerName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${h.hostelType === 'BOYS' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                          {h.hostelType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{h.user?.email}</td>
                      <td className="px-4 py-3 font-medium">{h.rooms?.length || 0}</td>
                      <td className="px-4 py-3 font-medium">{activeStudents}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${VC[h.verificationStatus] || 'bg-gray-100 text-gray-500'}`}>
                          {h.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => open(h)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-xl text-xs font-medium hover:bg-cyan-100 transition-colors">
                          <Eye className="w-3.5 h-3.5" />View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hostel Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                {kyc?.logoUrl && (
                  <img src={`${BASE}${kyc.logoUrl}`} className="w-10 h-10 rounded-xl object-cover border border-gray-200" alt="logo" />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{selected.hostelName}</h2>
                  <p className="text-sm text-gray-500">{selected.hostelType} Hostel</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photos */}
            {photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto px-6 py-4 bg-gray-50 border-b border-gray-100">
                {photos.map((p, i) => (
                  <img key={i} src={`${BASE}${p}`} alt={`Photo ${i+1}`}
                    className="h-28 w-40 object-cover rounded-xl flex-shrink-0 border border-gray-200"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 px-6 py-4 border-b border-gray-100">
              {([['info','Overview'],['rooms',`Rooms (${rooms.length})`],['meals','Meal Plan'],['students',`Students (${hostelAdmissions.length})`]] as [string,string][]).map(([t,l]) => (
                <button key={t} onClick={() => setDetailTab(t as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${detailTab === t ? 'bg-cyan-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-5">
              {/* ── Overview Tab ─────────────────────────────── */}
              {detailTab === 'info' && (
                <div className="space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      ['Rooms', rooms.length, Building],
                      ['Students', hostelAdmissions.length, Users],
                      ['Rating', avgRating ? `${avgRating}★` : '—', Star],
                      ['Revenue', `Rs ${(selected.payments||[]).filter((p:any)=>p.status==='PAID').reduce((s:number,p:any)=>s+Number(p.amount||0),0).toLocaleString()}`, CreditCard],
                    ].map(([label, val, Icon]: any) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-gray-800">{val}</p>
                        <p className="text-xs text-gray-400">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Owner & contact */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact & Registration</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        ['Owner', selected.ownerName],
                        ['Status', selected.verificationStatus],
                        ['Email', selected.user?.email],
                        ['Phone', selected.user?.phone],
                      ].map(([k,v]) => (
                        <div key={k} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                          <p className="font-medium text-sm break-all">{v || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {kyc && (
                    <>
                      {/* KYC / Address */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">KYC & Address</p>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            ['PAN Number', kyc.panNumber],
                            ['Established', kyc.establishedYear],
                            ['Admission Fee', kyc.admissionFee ? `Rs ${Number(kyc.admissionFee).toLocaleString()}` : '—'],
                            ['KYC Status', kyc.kycStatus],
                            ['Province', kyc.province],
                            ['District', kyc.district],
                            ['Municipality', kyc.municipality],
                            ['Tole', kyc.tole],
                            ['Ward No.', kyc.wardNumber],
                          ].map(([k,v]) => v ? (
                            <div key={k} className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                              <p className="font-medium text-sm">{v}</p>
                            </div>
                          ) : null)}
                        </div>
                        {kyc.rejectionRemark && (
                          <div className="mt-2 bg-red-50 border border-red-100 rounded-xl p-3">
                            <p className="text-xs text-red-500 font-medium mb-0.5">Rejection Reason</p>
                            <p className="text-sm text-red-700">{kyc.rejectionRemark}</p>
                          </div>
                        )}
                        {kyc.panDocumentUrl && (
                          <button onClick={() => setDocumentViewModel('PAN Document')} className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-medium hover:bg-blue-100">
                            <span>View PAN Document</span>
                            <Eye className="w-4 h-4" />
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
                      </div>

                      {/* Amenities */}
                      {kyc.amenities && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Amenities</p>
                          <div className="flex flex-wrap gap-2">
                            {kyc.amenities.split(',').map((a: string) => a.trim()).filter(Boolean).map((a: string) => (
                              <span key={a} className="px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-xl text-sm">{a}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Room pricing */}
                      {kyc.roomPricings?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Room Pricing</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {kyc.roomPricings.map((r: any) => (
                              <div key={r.roomType} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                <p className="text-sm font-semibold text-gray-600">{r.roomType}</p>
                                <p className="text-lg font-bold text-cyan-600 mt-0.5">Rs {Number(r.monthlyPrice).toLocaleString()}</p>
                                <p className="text-xs text-gray-400">/month</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rules */}
                      {kyc.rulesAndRegulations && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Rules & Regulations</p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-xl p-4">{kyc.rulesAndRegulations}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Reviews from admin endpoint - filtered for this hostel */}
                  {(() => {
                    const filtered = hostelReviews.filter((r: any) =>
                      r.hostel?.hostelId === selected.hostelId
                    );
                    if (reviewsLoading) return <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>;
                    if (filtered.length === 0) return <p className="text-gray-400 text-sm py-2">No student reviews yet.</p>;
                    return (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Student Reviews ({filtered.length})</p>
                        <div className="space-y-2">
                          {filtered.map((r: any) => (
                            <div key={r.reviewId} className="bg-gray-50 rounded-xl p-3 flex items-start gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{r.student?.user?.fullName || 'Student'}</p>
                                {r.reviewText && <p className="text-sm text-gray-500 mt-0.5">{r.reviewText}</p>}
                                <p className="text-xs text-gray-400 mt-0.5">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</p>
                              </div>
                              <div className="flex gap-0.5 flex-shrink-0">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ── Rooms Tab ────────────────────────────────── */}
              {detailTab === 'rooms' && (
                <div>
                  {rooms.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">No rooms added yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {rooms.map((r: any) => (
                        <div key={r.roomId} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                          <p className="font-bold text-gray-800">Room {r.roomNumber}</p>
                          <p className="text-xs text-gray-400">Floor {r.floor}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-lg font-medium">{r.roomType}</span>
                          {kyc?.roomPricings?.find((p: any) => p.roomType === r.roomType) && (
                            <p className="text-sm font-semibold text-cyan-600 mt-1">
                              Rs {Number(kyc.roomPricings.find((p: any) => p.roomType === r.roomType).monthlyPrice).toLocaleString()}/mo
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Meals Tab ────────────────────────────────── */}
              {detailTab === 'meals' && (
                <div>
                  {(!kyc?.mealPlans || kyc.mealPlans.length === 0) ? (
                    <p className="text-gray-400 text-center py-10">No meal plan set.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[540px]">
                        <thead>
                          <tr className="border-b border-gray-100">
                            {['Day','Breakfast','Lunch','Snack','Dinner'].map(h => (
                              <th key={h} className="px-3 py-2 text-left text-xs text-gray-500 font-semibold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {DAYS.map(day => {
                            const m = kyc.mealPlans.find((p: any) => p.dayOfWeek === day);
                            if (!m) return null;
                            const hasAny = m.morningBreakfast || m.lunch || m.eveningSnack || m.dinner;
                            if (!hasAny) return null;
                            return (
                              <tr key={day} className="border-b border-gray-50">
                                <td className="px-3 py-2.5 font-semibold text-cyan-700 text-xs">{day.slice(0,3)}</td>
                                {['morningBreakfast','lunch','eveningSnack','dinner'].map(f => (
                                  <td key={f} className="px-3 py-2.5 text-gray-600 text-xs">{(m as any)[f] || '—'}</td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Students Tab ─────────────────────────────── */}
              {detailTab === 'students' && (
                <div>
                  {(() => {
                    const activeStudents = (selected.admissions||[]).filter((a:any) =>
                      a.status === 'ACTIVE' || a.status === 'PENDING_PAYMENT'
                    );
                    if (activeStudents.length === 0) return <p className="text-gray-400 text-center py-10">No admitted students yet.</p>;
                    return (
                      <div className="space-y-2">
                        {activeStudents.map((a: any) => (
                          <div key={a.admissionId} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {a.student?.studentKyc?.profilePhotoUrl
                                ? <img src={'http://localhost:9091' + a.student.studentKyc.profilePhotoUrl}
                                    className="w-full h-full object-cover" alt=""
                                    onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                                : <span className="text-cyan-700 font-bold text-sm">{a.student?.user?.fullName?.charAt(0)}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{a.student?.user?.fullName}</p>
                              <p className="text-xs text-gray-400">{a.student?.user?.email}</p>
                              {a.student?.studentKyc?.instituteName && (
                                <p className="text-xs text-cyan-600 truncate">{a.student.studentKyc.instituteName}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 space-y-1">
                              {a.room
                                ? <><p className="text-xs font-semibold text-cyan-600">Room {a.room.roomNumber}</p><p className="text-xs text-gray-400">{a.room.roomType}</p></>
                                : <p className="text-xs text-yellow-600 font-medium">Room TBD</p>}
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${a.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {a.status.replace('_',' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
