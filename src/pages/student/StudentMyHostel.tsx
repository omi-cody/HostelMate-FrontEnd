import { useEffect, useState } from 'react';
import { Home, LogOut, Utensils, Calendar, MapPin, Phone, Wifi, FileText, CreditCard, ExternalLink } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { studentService } from '../../services/studentService';
import { toast } from 'react-toastify';

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function StudentMyHostel() {
  const [admission, setAdmission] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ rating: 5, reviewText: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'meals' | 'events' | 'rules'>('info');
  const [payingFee, setPayingFee] = useState(false);

  useEffect(() => {
    studentService.getMyHostel()
      .then(res => {
        const d = res.data || res;
        setAdmission(d);
        if (d?.hostel?.hostelId) {
          studentService.getEvents(d.hostel.hostelId)
            .then(r => setEvents((r.data || r || []).slice(0, 6)))
            .catch(() => {});
        }
      })
      .catch(() => setAdmission(null))
      .finally(() => setLoading(false));
  }, []);

  const requestLeave = async () => {
    setLeaving(true);
    try {
      await studentService.requestLeave();
      toast.success('Leave request sent to hostel. You\'ll be notified of their decision.');
      setAdmission((a: any) => ({ ...a, status: 'LEAVE_REQUESTED' }));
      setShowLeaveConfirm(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to request leave');
    } finally { setLeaving(false); }
  };

  const submitReview = async () => {
    if (!review.reviewText.trim()) { toast.error('Please write a review'); return; }
    setSubmittingReview(true);
    try {
      await studentService.reviewHostel(admission.admissionId, review);
      toast.success('Review submitted! Thank you for your feedback.');
      setShowReview(false);
      setAdmission((a: any) => ({ ...a, reviewSubmitted: true }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };


  const payAdmissionFee = async () => {
    if (!admission?.admissionId) return;
    setPayingFee(true);
    try {
      const today = new Date();
      const feeMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      const res = await studentService.initiateKhaltiPayment({
        admissionId: admission.admissionId,
        feeMonth,
      });
      const d = res.data || res;
      if (d?.paymentUrl) {
        toast.info('Opening Khalti payment window...');
        window.open(d.paymentUrl, '_blank');
        // Reload after delay
        setTimeout(() => {
          studentService.getMyHostel()
            .then(r => setAdmission(r.data || r))
            .catch(() => {});
        }, 8000);
      } else {
        toast.error('Could not get payment URL. Try again.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Payment initiation failed');
    } finally { setPayingFee(false); }
  };

  if (loading) return (
    <DashboardLayout title="My Hostel">
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  if (!admission || admission.hostelName === 'Not admitted') {
    return (
      <DashboardLayout title="My Hostel">
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Not Admitted Yet</h3>
          <p className="text-gray-500 mb-6">You haven't been admitted to any hostel yet.</p>
          <a href="/hostels" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium">
            Browse Hostels
          </a>
        </div>
      </DashboardLayout>
    );
  }

  const hostel = admission.hostel || {};
  const kyc = hostel.hostelKyc || {};
  const mealPlans = kyc.mealPlans || [];
  const amenities = kyc.amenities ? kyc.amenities.split(',').map((a: string) => a.trim()).filter(Boolean) : [];
  const rules = kyc.rulesAndRegulations;

  return (
    <DashboardLayout title="My Hostel">

      {/* PENDING_PAYMENT banner - student needs to pay admission fee */}
      {admission.status === 'PENDING_PAYMENT' && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5 mb-4">
          <div className="flex items-start gap-3">
            <CreditCard className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-blue-800 text-lg">Pay Admission Fee to Complete Admission</p>
              <p className="text-blue-600 text-sm mt-1">
                Your application has been accepted! Pay the admission fee to get officially admitted and access your room.
              </p>
              {hostel.hostelKyc?.admissionFee && (
                <p className="text-blue-800 font-bold text-xl mt-2">
                  Rs {Number(hostel.hostelKyc.admissionFee).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={payAdmissionFee} disabled={payingFee}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold disabled:opacity-60 transition-colors shadow-sm">
              {payingFee
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Opening Khalti...</>
                : <><ExternalLink className="w-4 h-4" />Pay with Khalti</>}
            </button>
            <p className="text-sm text-blue-500 self-center">Or pay cash at the hostel reception.</p>
          </div>
        </div>
      )}

      {/* Status banner for leave states */}
      {admission.status === 'LEAVE_REQUESTED' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <LogOut className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">Leave request pending</p>
            <p className="text-sm text-yellow-600">Your request to leave has been sent. The hostel will respond shortly.</p>
          </div>
        </div>
      )}
      {admission.status === 'LEFT' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
          <p className="font-medium text-blue-800 mb-2">Your stay at {hostel.hostelName} has ended.</p>
          {!admission.reviewSubmitted && !showReview && (
            <button onClick={() => setShowReview(true)}
              className="text-sm px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium">
              Leave a Review for this Hostel
            </button>
          )}
          {admission.reviewSubmitted && <p className="text-sm text-blue-600">✓ You've already submitted a review.</p>}
        </div>
      )}

      {/* Review form */}
      {showReview && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <h3 className="font-semibold text-lg mb-4">Rate your stay at {hostel.hostelName}</h3>
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Overall Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} onClick={() => setReview(v => ({ ...v, rating: r }))}
                  className={`w-12 h-12 rounded-xl font-bold text-xl transition-all ${r <= review.rating ? 'bg-yellow-400 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <textarea value={review.reviewText} onChange={e => setReview(v => ({ ...v, reviewText: e.target.value }))}
            rows={4} placeholder="Share your experience — cleanliness, food, staff, facilities..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400 resize-none mb-4 text-sm" />
          <div className="flex gap-3">
            <button onClick={() => setShowReview(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={submitReview} disabled={submittingReview}
              className="px-6 py-2.5 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* Hostel header card */}
      <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl p-6 mb-5 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">{hostel.hostelName}</h2>
            <p className="text-cyan-100 flex items-center gap-1.5 text-sm">
              <MapPin className="w-4 h-4" />
              {kyc.municipality ? `${kyc.tole}, ${kyc.municipality}, ${kyc.district}` : 'Nepal'}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
            admission.status === 'ACTIVE' ? 'bg-white text-cyan-600'
            : admission.status === 'LEAVE_REQUESTED' ? 'bg-yellow-200 text-yellow-800'
            : 'bg-gray-200 text-gray-700'}`}>
            {admission.status.replace('_', ' ')}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Room', admission.room?.roomNumber || '—'],
            ['Floor', admission.room?.floor ?? '—'],
            ['Type', admission.room?.roomType || '—'],
            ['Monthly Fee', `Rs ${admission.monthlyFeeAmount}`],
          ].map(([label, value]) => (
            <div key={label} className="bg-white/20 rounded-xl px-3 py-2.5">
              <p className="text-cyan-100 text-xs mb-0.5">{label}</p>
              <p className="font-bold">{value}</p>
            </div>
          ))}
        </div>
        {admission.roommateNames?.length > 0 && (
          <p className="text-cyan-100 text-sm mt-3">
            Roommates: {admission.roommateNames.join(', ')}
          </p>
        )}
        <p className="text-cyan-100 text-xs mt-2">Admitted: {admission.admittedDate}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {([
          ['info', 'Hostel Info'],
          ['meals', 'Meal Plan'],
          ['events', `Events (${events.length})`],
          ['rules', 'Rules'],
        ] as [string, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setActiveTab(t as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === t ? 'bg-cyan-400 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {activeTab === 'info' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold mb-3">Contact</h3>
            <div className="space-y-2 text-sm">
              {hostel.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-cyan-400" />{hostel.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-cyan-400" />
                {kyc.municipality}, {kyc.district}, {kyc.province}
              </div>
            </div>
          </div>
          {amenities.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-cyan-400" />Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a: string) => (
                  <span key={a} className="px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-xl text-sm font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
          {kyc.admissionFee && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold mb-3">Fee Information</h3>
              <div className="flex gap-4 text-sm">
                <div className="bg-gray-50 rounded-xl p-3 flex-1">
                  <p className="text-gray-400 text-xs mb-0.5">Monthly Fee</p>
                  <p className="font-bold text-lg text-cyan-600">Rs {admission.monthlyFeeAmount}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 flex-1">
                  <p className="text-gray-400 text-xs mb-0.5">Admission Fee</p>
                  <p className="font-bold text-lg">Rs {kyc.admissionFee}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Meals tab */}
      {activeTab === 'meals' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-cyan-400" />Weekly Meal Plan
          </h3>
          {mealPlans.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No meal plan set by the hostel.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Day', 'Breakfast', 'Lunch', 'Snack', 'Dinner'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs text-gray-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map(day => {
                    const m = mealPlans.find((p: any) => p.dayOfWeek === day);
                    if (!m) return null;
                    const hasContent = m.morningBreakfast || m.lunch || m.eveningSnack || m.dinner;
                    if (!hasContent) return null;
                    return (
                      <tr key={day} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-semibold text-cyan-700 text-xs w-14">{day.slice(0, 3)}</td>
                        {['morningBreakfast', 'lunch', 'eveningSnack', 'dinner'].map(field => (
                          <td key={field} className="px-3 py-2.5 text-gray-600">{(m as any)[field] || <span className="text-gray-300">—</span>}</td>
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

      {/* Events tab */}
      {activeTab === 'events' && (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p>No upcoming events from your hostel.</p>
            </div>
          ) : events.map((ev: any) => (
            <div key={ev.eventId} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-4">
              <div className="w-14 h-14 bg-cyan-400 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                <span className="text-xl font-bold leading-none">{new Date(ev.eventDate).getDate()}</span>
                <span className="text-xs">{new Date(ev.eventDate).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div>
                <h3 className="font-semibold">{ev.eventName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />{ev.location}
                </p>
                <p className="text-xs text-gray-400 mt-1">{new Date(ev.eventDate).toLocaleString()}</p>
                {ev.detail && <p className="text-sm text-gray-600 mt-1">{ev.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rules tab */}
      {activeTab === 'rules' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />Rules & Regulations
          </h3>
          {rules ? (
            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{rules}</p>
          ) : (
            <p className="text-gray-400 text-center py-8">No rules specified by the hostel.</p>
          )}
        </div>
      )}

      {/* Leave action */}
      {(admission.status === 'ACTIVE') && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <button onClick={() => setShowLeaveConfirm(true)}
            className="flex items-center gap-2 px-5 py-3 border-2 border-red-200 text-red-500 rounded-xl hover:bg-red-50 font-medium transition-colors">
            <LogOut className="w-5 h-5" />Request to Leave Hostel
          </button>
        </div>
      )}

      {/* Leave confirm modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-semibold mb-2">Request to Leave?</h2>
            <p className="text-gray-500 text-sm mb-5">
              A leave request will be sent to <strong>{hostel.hostelName}</strong>. The hostel will review and respond. You'll be notified of their decision.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={requestLeave} disabled={leaving}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium disabled:opacity-60">
                {leaving ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
