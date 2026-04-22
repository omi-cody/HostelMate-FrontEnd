import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Wifi, ChevronLeft, CreditCard, Building, Phone, Mail, Star, Calendar, Shield, ImageIcon, RefreshCw } from 'lucide-react';
import logo from '../../assets/logo.png';
import { toast } from 'react-toastify';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
const BASE = 'http://localhost:9091';
// Statuses where student CANNOT apply (active application exists)
const ACTIVE_STATUSES = ['PENDING', 'ACCEPTED', 'VISIT_SCHEDULED'];
// Statuses where student CAN re-apply
const TERMINAL_STATUSES = ['ADMITTED', 'CANCELLED', 'REJECTED'];

export default function HostelDetail() {
  const { hostelId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hostel, setHostel] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info'|'meals'|'rooms'|'rules'|'reviews'>('info');
  const [showApply, setShowApply] = useState(false);
  const [applying, setApplying] = useState(false);
  const [form, setForm] = useState({ roomType: 'SINGLE', applicationType: 'DIRECT_ADMISSION', note: '' });
  const [lightbox, setLightbox] = useState<string|null>(null);
  const [roomAvailability, setRoomAvailability] = useState<Record<string,number>>({});
  const [aiRec, setAiRec] = useState<string|null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  // Existing application for this hostel (if any)
  const [existingApp, setExistingApp] = useState<any>(null);
  const [loadingExistingApp, setLoadingExistingApp] = useState(false);

  useEffect(() => {
    studentService.getHostelDetail(hostelId!)
      .then(res => {
        const d = res.data || res;
        if (d?.hostel) { setHostel(d.hostel); setReviews(d.reviews || []); setAvgRating(d.averageRating || 0); }
        else setHostel(d);
      })
      .catch(() => setHostel(null))
      .finally(() => setLoading(false));

    studentService.getRoomAvailability?.(hostelId!)
      .then(res => setRoomAvailability(res.data || res || {}))
      .catch(() => {});
  }, [hostelId]);

  // If logged in as student, fetch their existing application to this hostel
  useEffect(() => {
    if (!user || user.role !== 'STUDENT') return;
    setLoadingExistingApp(true);
    studentService.getMyApplications()
      .then(res => {
        const allApps = res.data || res || [];
        const appForThisHostel = allApps
          .filter((a: any) => a.hostel?.hostelId === hostelId)
          .sort((a: any, b: any) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())[0];
        setExistingApp(appForThisHostel || null);
      })
      .catch(() => {})
      .finally(() => setLoadingExistingApp(false));
  }, [hostelId, user]);

  const canApply = () => {
    if (!user || user.role !== 'STUDENT') return { allowed: false, reason: 'login' };
    if (!user.kycVerified) return { allowed: false, reason: 'kyc' };
    if (!existingApp) return { allowed: true, reason: null };
    if (ACTIVE_STATUSES.includes(existingApp.status)) return { allowed: false, reason: 'active' };
    // ADMITTED / CANCELLED / REJECTED → can reapply
    return { allowed: true, reason: 'reapply' };
  };

  const handleApplyClick = () => {
    const { allowed, reason } = canApply();
    if (reason === 'login') { navigate('/login'); return; }
    if (reason === 'kyc') { toast.error('Complete KYC verification before applying'); navigate('/student/kyc'); return; }
    if (reason === 'active') {
      toast.error(`You already have an active ${existingApp.status.replace('_',' ')} application for this hostel`);
      return;
    }
    setShowApply(true);
  };

  const apply = async () => {
    setApplying(true);
    try {
      await studentService.applyToHostel(hostelId!, form);
      toast.success('Application submitted! The hostel will review it shortly.');
      setShowApply(false);
      // Refresh existing app
      studentService.getMyApplications().then(res => {
        const allApps = res.data || res || [];
        const a = allApps.filter((a: any) => a.hostel?.hostelId === hostelId)
          .sort((a: any, b: any) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())[0];
        setExistingApp(a || null);
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Application failed. Please try again.');
    } finally { setApplying(false); }
  };

  const getAiRecommendation = async () => {
    if (!user || !hostelId) return;
    setLoadingAi(true);
    try {
      const { default: api } = await import('../../services/api');
      const res = await api.post(`/ai/hostel-recommendation/${hostelId}`);
      const rec = (res.data?.data || res.data)?.recommendation;
      setAiRec(rec || 'Could not generate recommendation.');
    } catch (err: any) {
      setAiRec('AI recommendation unavailable. Please try again.');
    } finally { setLoadingAi(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!hostel) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
      <Building className="w-16 h-16 text-gray-200" />
      <p className="text-gray-500 text-lg">Hostel not found</p>
      <Link to="/hostels" className="text-cyan-500 hover:text-cyan-600 font-medium">← Back to search</Link>
    </div>
  );

  const kyc = hostel.hostelKyc || {};
  const pricing = kyc.roomPricings || [];
  const mealPlans = kyc.mealPlans || [];
  const amenities = kyc.amenities ? kyc.amenities.split(',').map((a: string) => a.trim()).filter(Boolean) : [];
  const phone = hostel.user?.phone || '';
  const email = hostel.user?.email || '';

  let photos: string[] = [];
  if (kyc.hostelPhotoUrls) {
    try { photos = JSON.parse(kyc.hostelPhotoUrls); }
    catch { photos = kyc.hostelPhotoUrls.split(',').map((u: string) => u.trim()).filter(Boolean); }
  }

  const minPrice = pricing.length ? Math.min(...pricing.map((r: any) => Number(r.monthlyPrice))) : null;
  const { allowed: applyAllowed, reason: applyReason } = canApply();

  // Determine apply button text
  const getApplyButtonText = () => {
    if (!user) return 'Login to Apply';
    if (applyReason === 'reapply') return 'Apply Again';
    if (applyReason === 'active') return `Application ${existingApp?.status?.replace('_', ' ')}`;
    return 'Apply to This Hostel';
  };

  const APPSTATUS_COLOR: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-blue-100 text-blue-700',
    VISIT_SCHEDULED: 'bg-purple-100 text-purple-700',
    ADMITTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
  };

  const tabs: [string, string][] = [
    ['info','Overview'], ['meals','Meals'], ['rooms',`Rooms (${hostel.rooms?.length || 0})`],
    ['rules','Rules'], ['reviews',`Reviews (${reviews.length})`],
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link to="/hostels" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <ChevronLeft className="w-5 h-5" />All Hostels
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-60 h-10 rounded flex items-center justify-center">
              <img
                src={logo}
                alt="HostelMate Logo"
                className="h-auto w-40 object-contain"
              />
            </div>
          </Link>
        </div>
      </header>

      {/* Photos hero */}
      {photos.length > 0 ? (
        <div className="relative h-64 md:h-80 overflow-hidden bg-gray-200">
          <img src={`${BASE}${photos[0]}`} alt={hostel.hostelName} className="w-full h-full object-cover cursor-pointer"
            onClick={() => setLightbox(`${BASE}${photos[0]}`)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          {photos.length > 1 && (
            <div className="absolute bottom-3 right-3 flex gap-2">
              {photos.slice(1).map((p, i) => (
                <img key={i} src={`${BASE}${p}`} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-white cursor-pointer shadow-md"
                  onClick={() => setLightbox(`${BASE}${p}`)} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ))}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
          <Building className="w-20 h-20 text-white/40" />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Title card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${hostel.hostelType === 'BOYS' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{hostel.hostelType}</span>
                    {avgRating > 0 && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />{avgRating.toFixed(1)} ({reviews.length})
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{hostel.hostelName}</h1>
                  <p className="text-gray-500 text-sm">Owner: {hostel.ownerName}</p>
                  {kyc.municipality && <p className="text-gray-500 text-sm flex items-center gap-1 mt-1"><MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />{kyc.tole && `${kyc.tole}, `}{kyc.municipality}, {kyc.district}, {kyc.province}</p>}
                  {kyc.establishedYear && <p className="text-gray-400 text-xs mt-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Est. {kyc.establishedYear}</p>}
                </div>
                {kyc.logoUrl && <img src={`${BASE}${kyc.logoUrl}`} className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0" alt="logo" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                <div className="text-center"><p className="text-xl font-bold text-cyan-600">{minPrice ? `Rs ${minPrice.toLocaleString()}` : '—'}</p><p className="text-xs text-gray-400">from / month</p></div>
                <div className="text-center"><p className="text-xl font-bold text-gray-800">{hostel.rooms?.length || 0}</p><p className="text-xs text-gray-400">rooms</p></div>
                <div className="text-center"><p className="text-xl font-bold text-gray-800">{kyc.admissionFee ? `Rs ${Number(kyc.admissionFee).toLocaleString()}` : '—'}</p><p className="text-xs text-gray-400">admission fee</p></div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {tabs.map(([t, label]) => (
                <button key={t} onClick={() => setActiveTab(t as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t ? 'bg-cyan-400 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                {amenities.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><Wifi className="w-5 h-5 text-cyan-400" />Amenities</h3>
                    <div className="flex flex-wrap gap-2">{amenities.map((a: string) => <span key={a} className="px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-xl text-sm font-medium">{a}</span>)}</div>
                  </div>
                )}
                {pricing.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><CreditCard className="w-5 h-5 text-cyan-400" />Room Pricing</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {pricing.map((p: any) => {
                        const avail = roomAvailability[p.roomType];
                        const isFull = avail !== undefined && avail <= 0;
                        return (
                          <div key={p.roomType}
                            className={`border rounded-xl p-4 text-center transition-all ${isFull ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-gray-50 border-gray-100 hover:bg-cyan-50 hover:border-cyan-200 cursor-pointer'}`}
                            onClick={() => { if (!isFull) { setForm(f => ({...f, roomType: p.roomType})); handleApplyClick(); } }}>
                            <p className="font-semibold text-gray-600 text-sm">{p.roomType}</p>
                            <p className="text-xl font-bold text-cyan-600 mt-1">Rs {Number(p.monthlyPrice).toLocaleString()}</p>
                            <p className="text-gray-400 text-xs mt-0.5">per month</p>
                            {isFull && <p className="text-red-400 text-xs mt-1 font-semibold">FULL</p>}
                            {avail !== undefined && avail > 0 && <p className="text-green-500 text-xs mt-1">{avail} available</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {photos.length > 1 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-cyan-400" />Photos</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((p, i) => <img key={i} src={`${BASE}${p}`} alt={`Photo ${i+1}`} className="w-full h-28 object-cover rounded-xl cursor-pointer hover:opacity-90" onClick={() => setLightbox(`${BASE}${p}`)} onError={e => { (e.target as HTMLImageElement).parentElement?.remove(); }} />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Meals */}
            {activeTab === 'meals' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Weekly Meal Plan</h3>
                {mealPlans.length === 0 ? <p className="text-gray-400 text-center py-10">No meal plan information available.</p>
                : <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[560px]">
                    <thead><tr className="border-b border-gray-100">{['Day','Breakfast','Lunch','Snack','Dinner'].map(h => <th key={h} className="px-3 py-2 text-left text-xs text-gray-500 font-semibold">{h}</th>)}</tr></thead>
                    <tbody>
                      {DAYS.map(day => { const m = mealPlans.find((p: any) => p.dayOfWeek === day); if (!m) return null;
                        return <tr key={day} className="border-b border-gray-50 hover:bg-gray-50"><td className="px-3 py-2.5 font-semibold text-cyan-700 text-xs">{day.slice(0,3)}</td>{['morningBreakfast','lunch','eveningSnack','dinner'].map(f => <td key={f} className="px-3 py-2.5 text-gray-600 text-sm">{(m as any)[f] || <span className="text-gray-300">—</span>}</td>)}</tr>;
                      })}
                    </tbody>
                  </table>
                </div>}
              </div>
            )}

            {/* Rooms */}
            {activeTab === 'rooms' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Building className="w-5 h-5 text-cyan-400" />Available Rooms</h3>
                {Object.keys(roomAvailability).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(roomAvailability).map(([type, avail]: [string, any]) => (
                      <span key={type} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${avail > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{type}: {avail > 0 ? `${avail} available` : 'Full'}</span>
                    ))}
                  </div>
                )}
                {!hostel.rooms?.length ? <p className="text-gray-400 text-center py-10">No room information available.</p>
                : <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hostel.rooms.map((r: any) => (
                    <div key={r.roomId} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <p className="font-bold text-gray-800">Room {r.roomNumber}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Floor {r.floor}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-lg font-medium">{r.roomType}</span>
                      {pricing.find((p: any) => p.roomType === r.roomType) && <p className="text-sm font-semibold text-cyan-600 mt-1.5">Rs {Number(pricing.find((p: any) => p.roomType === r.roomType).monthlyPrice).toLocaleString()}/mo</p>}
                    </div>
                  ))}
                </div>}
              </div>
            )}

            {/* Rules */}
            {activeTab === 'rules' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-400" />Rules & Regulations</h3>
                {kyc.rulesAndRegulations ? <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{kyc.rulesAndRegulations}</p>
                : <p className="text-gray-400 text-center py-10">No rules specified.</p>}
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-3">
                {reviews.length === 0 ? <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400"><Star className="w-12 h-12 mx-auto mb-3 text-gray-200" /><p>No reviews yet.</p></div>
                : <>
                  <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 flex items-center gap-4">
                    <div className="text-center"><p className="text-4xl font-bold text-cyan-600">{avgRating.toFixed(1)}</p><p className="text-xs text-gray-500 mt-0.5">{reviews.length} reviews</p></div>
                    <div className="flex gap-1">{[1,2,3,4,5].map(s => <Star key={s} className={`w-6 h-6 ${s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}</div>
                  </div>
                  {reviews.map((r: any) => (
                    <div key={r.reviewId} className="bg-white border border-gray-200 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center"><span className="text-cyan-700 font-semibold text-sm">{r.student?.user?.fullName?.charAt(0) || '?'}</span></div>
                          <div><p className="text-sm font-medium">{r.student?.user?.fullName || 'Anonymous'}</p><p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p></div>
                        </div>
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}</div>
                      </div>
                      {r.reviewText && <p className="text-sm text-gray-600">{r.reviewText}</p>}
                    </div>
                  ))}
                </>}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-20">
              {minPrice && <div className="text-center mb-4"><p className="text-xs text-gray-400">Starting from</p><p className="text-3xl font-bold text-cyan-600">Rs {minPrice.toLocaleString()}</p><p className="text-xs text-gray-400">per month</p></div>}

              {/* Existing application status badge */}
              {user?.role === 'STUDENT' && existingApp && (
                <div className={`mb-3 px-4 py-3 rounded-xl text-sm font-medium ${APPSTATUS_COLOR[existingApp.status] || 'bg-gray-100 text-gray-600'}`}>
                  Your application: <strong>{existingApp.status.replace('_', ' ')}</strong>
                  {TERMINAL_STATUSES.includes(existingApp.status) && <p className="text-xs font-normal mt-0.5 opacity-80">You can apply again below</p>}
                </div>
              )}

              {/* Apply / Apply Again button */}
              <button onClick={handleApplyClick}
                disabled={!applyAllowed && applyReason === 'active'}
                className={`w-full py-3.5 rounded-xl font-semibold text-base transition-colors shadow-md mb-3 ${
                  applyReason === 'active'
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : applyReason === 'reapply'
                    ? 'bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2'
                    : 'bg-cyan-400 text-white hover:bg-cyan-500'
                }`}>
                {applyReason === 'reapply' && <RefreshCw className="w-4 h-4 inline mr-1" />}
                {getApplyButtonText()}
              </button>

              {!user && <p className="text-center text-xs text-gray-400 mb-3"><Link to="/login" className="text-cyan-500 font-medium">Log in</Link> or <Link to="/student/registration" className="text-cyan-500 font-medium">register</Link> to apply</p>}

              {/* AI Recommendation */}
              {user?.role === 'STUDENT' && (
                <div className="mb-4">
                  {!aiRec ? (
                    <button onClick={getAiRecommendation} disabled={loadingAi}
                      className="">
                      {loadingAi ? <><div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />Analyzing...</> : <></>}
                    </button>
                  ) : (
                    <div className="">
                      
                      <p className="text-xs text-gray-700 leading-relaxed">{aiRec}</p>
                      <button onClick={() => setAiRec(null)} className="text-xs text-gray-400 hover:text-gray-600 mt-1.5">↺ Refresh</button>
                    </div>
                  )}
                </div>
              )}

              {/* Contact */}
              <div className="pt-4 border-t border-gray-100 space-y-2.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
                {phone && <a href={`tel:${phone}`} className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-cyan-600"><Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />{phone}</a>}
                {email && <a href={`mailto:${email}`} className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-cyan-600 truncate"><Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />{email}</a>}
                {kyc.municipality && <p className="flex items-start gap-2.5 text-sm text-gray-600"><MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" /><span>{kyc.tole && `${kyc.tole}, `}{kyc.municipality}, {kyc.district}</span></p>}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</p>
                {[['Hostel Type', hostel.hostelType],['Admission Fee', kyc.admissionFee ? `Rs ${Number(kyc.admissionFee).toLocaleString()}` : '—'],['Established', kyc.establishedYear || '—'],['Total Rooms', hostel.rooms?.length || 0]].map(([k,v]) => (
                  <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{k}</span><span className="text-sm font-medium text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setLightbox(null)}><img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" /><button className="absolute top-4 right-4 text-white text-3xl font-light hover:text-gray-300">×</button></div>}

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-semibold mb-1">Apply to {hostel.hostelName}</h2>
            {applyReason === 'reapply' && <p className="text-sm text-green-600 mb-4">Re-applying after previous {existingApp?.status?.replace('_',' ')} application.</p>}
            <p className="text-sm text-gray-500 mb-5">Fill in your application details below.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Room Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(pricing.length > 0
                    ? pricing.filter((p: any) => { const avail = roomAvailability[p.roomType]; return avail === undefined || avail > 0; }).map((p: any) => p.roomType)
                    : ['SINGLE','DOUBLE','TRIPLE','QUAD']
                  ).map((t: string) => (
                    <button key={t} onClick={() => setForm(f => ({...f, roomType: t}))}
                      className={`py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${form.roomType === t ? 'border-cyan-400 bg-cyan-50 text-cyan-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {t}
                      {pricing.find((p: any) => p.roomType === t) && <span className="block text-xs font-normal text-gray-400 mt-0.5">Rs {Number(pricing.find((p: any) => p.roomType === t).monthlyPrice).toLocaleString()}/mo</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Application Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {([['DIRECT_ADMISSION','Direct Admission'],['VISIT','Visit First']] as [string,string][]).map(([v,l]) => (
                    <button key={v} onClick={() => setForm(f => ({...f, applicationType: v}))}
                      className={`py-3 border-2 rounded-xl text-sm font-medium transition-all ${form.applicationType === v ? 'border-cyan-400 bg-cyan-50 text-cyan-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{l}</button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{form.applicationType === 'VISIT' ? 'Hostel will schedule a visit.' : 'Admitted directly after acceptance + fee payment.'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Note (optional)</label>
                <textarea value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} rows={2} placeholder="Any questions or special requirements..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400 resize-none text-sm" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowApply(false)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={apply} disabled={applying} className="flex-1 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-semibold disabled:opacity-60">{applying ? 'Submitting...' : 'Submit'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
