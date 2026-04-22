import { useEffect, useState } from 'react';
import { FileText, MapPin, ArrowRight, Calendar, CreditCard, CheckCircle, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { studentService } from '../../services/studentService';
import { toast } from 'react-toastify';

const BASE = 'http://localhost:9091';

const STATUS_COLORS: Record<string,string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  VISIT_SCHEDULED: 'bg-purple-100 text-purple-700',
  ADMITTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function StudentApplications() {
  const [apps, setApps] = useState<any[]>([]);
  const [myAdmission, setMyAdmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [payingId, setPayingId] = useState<string|null>(null);

  const load = () => {
    Promise.all([
      studentService.getMyApplications(),
      studentService.getMyHostel().catch(() => null),
    ]).then(([appsRes, hostelRes]) => {
      setApps(appsRes.data || appsRes || []);
      const adm = hostelRes ? (hostelRes.data || hostelRes) : null;
      // Store admission if it exists and has an admissionId (PENDING_PAYMENT or ACTIVE)
      if (adm?.admissionId) setMyAdmission(adm);
      else setMyAdmission(null);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cancelApplication = async (applicationId: string) => {
    if (!window.confirm('Cancel this application? You can reapply later.')) return;
    try {
      await studentService.cancelApplication(applicationId);
      toast.success('Application cancelled.');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not cancel. Please try again.');
    }
  };

  const payAdmissionFee = async (app: any) => {
    // Get admissionId from the fetched active/pending admission
    const admissionId = myAdmission?.admissionId;
    if (!admissionId) {
      toast.error('Could not find admission record. Refresh the page and try again.');
      return;
    }
    // Check hostel matches
    const hostelId = myAdmission?.hostel?.hostelId || myAdmission?.hostelId;
    const appHostelId = app.hostel?.hostelId;
    if (hostelId && appHostelId && hostelId !== appHostelId) {
      toast.error('Admission mismatch. Please refresh the page.');
      return;
    }

    setPayingId(app.applicationId);
    try {
      const today = new Date();
      const feeMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-01`;
      const res = await studentService.initiateKhaltiPayment({ admissionId, feeMonth });
      const d = res.data || res;
      if (d?.paymentUrl) {
        toast.info('Khalti payment window opened. Complete your payment there.');
        window.open(d.paymentUrl, '_blank');
        // Reload after 8s to reflect payment status
        setTimeout(() => load(), 8000);
      } else {
        toast.error('Could not get Khalti payment URL. Please try again.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Payment initiation failed. Please try again.');
    } finally { setPayingId(null); }
  };

  const displayed = filter === 'ALL' ? apps : apps.filter(a => a.status === filter);
  const filters = ['ALL','PENDING','ACCEPTED','VISIT_SCHEDULED','ADMITTED','REJECTED','CANCELLED'];

  // Find the ACCEPTED app that corresponds to the myAdmission hostel
  const acceptedHostelId = myAdmission?.hostel?.hostelId || myAdmission?.hostelId;

  return (
    <DashboardLayout title="My Applications">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5 overflow-x-auto pb-1">
        {filters.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border flex-shrink-0 ${
              filter === s ? 'bg-cyan-400 text-white border-cyan-400' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}>
            {s === 'ALL'
              ? `All (${apps.length})`
              : `${s.replace(/_/g,' ')} (${apps.filter(a => a.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="w-14 h-14 mx-auto mb-3 text-gray-200" />
          <p className="mb-4 font-medium">{filter === 'ALL' ? 'No applications yet.' : `No ${filter.replace(/_/g,' ')} applications.`}</p>
          {filter === 'ALL' && (
            <Link to="/hostels" className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-400 text-white rounded-xl text-sm hover:bg-cyan-500 font-medium">
              Browse Hostels <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((a: any) => {
            const isAccepted = a.status === 'ACCEPTED';
            const isAcceptedDirect = isAccepted && a.applicationType === 'DIRECT_ADMISSION';
            // Show pay button if: this is an ACCEPTED direct admission AND we have a PENDING_PAYMENT admission for this hostel
            const showPayButton = isAcceptedDirect && myAdmission?.admissionId &&
              (!acceptedHostelId || !a.hostel?.hostelId || acceptedHostelId === a.hostel?.hostelId);

            return (
              <div key={a.applicationId}
                className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-shadow ${
                  isAccepted ? 'border-blue-200' : 'border-gray-200'
                }`}>

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    {a.hostel?.hostelKyc?.logoUrl && (
                      <img src={`${BASE}${a.hostel.hostelKyc.logoUrl}`}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).style.display='none'; }} alt="" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{a.hostel?.hostelName}</h3>
                      {a.hostel?.hostelKyc?.municipality && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {a.hostel.hostelKyc.municipality}, {a.hostel.hostelKyc.district}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex-shrink-0 ${STATUS_COLORS[a.status] || 'bg-gray-100'}`}>
                    {a.status.replace(/_/g,' ')}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">{a.roomType}</span>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">{a.applicationType?.replace('_',' ')}</span>
                  <span className="px-2.5 py-1 bg-gray-50 text-gray-400 text-xs rounded-lg">Applied {new Date(a.appliedAt).toLocaleDateString()}</span>
                </div>

                {/* Visit scheduled */}
                {a.visitScheduledAt && (
                  <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5 mb-3">
                    <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-purple-500 font-semibold">Visit Scheduled</p>
                      <p className="text-sm text-purple-800 font-bold">{new Date(a.visitScheduledAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* Rejection reason */}
                {a.status === 'REJECTED' && a.remark && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-3">
                    <p className="text-xs text-red-500 font-semibold mb-0.5">Rejection Reason</p>
                    <p className="text-sm text-red-700">{a.remark}</p>
                  </div>
                )}

                {/* ACCEPTED DIRECT → Pay admission fee */}
                {isAcceptedDirect && (
                  <div className={`rounded-xl p-4 mb-3 border ${showPayButton ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <CreditCard className={`w-5 h-5 flex-shrink-0 mt-0.5 ${showPayButton ? 'text-blue-600' : 'text-yellow-600'}`} />
                      <div>
                        <p className={`font-semibold text-sm ${showPayButton ? 'text-blue-800' : 'text-yellow-800'}`}>
                          Pay Admission Fee to Complete Admission
                        </p>
                        {a.hostel?.hostelKyc?.admissionFee && (
                          <p className={`text-sm mt-0.5 ${showPayButton ? 'text-blue-600' : 'text-yellow-700'}`}>
                            Amount: <strong>Rs {Number(a.hostel.hostelKyc.admissionFee).toLocaleString()}</strong>
                          </p>
                        )}
                        {!showPayButton && (
                          <p className="text-xs text-yellow-600 mt-1">Refresh the page if you just got accepted.</p>
                        )}
                      </div>
                    </div>
                    {showPayButton && (
                      <div className="flex gap-3 flex-wrap items-center">
                        <button onClick={() => payAdmissionFee(a)} disabled={payingId === a.applicationId}
                          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold text-sm disabled:opacity-60 transition-colors shadow-sm">
                          {payingId === a.applicationId
                            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Opening Khalti...</>
                            : <><ExternalLink className="w-4 h-4" />Pay with Khalti</>}
                        </button>
                        <p className="text-xs text-blue-500">Or pay cash at the hostel.</p>

                      </div>
                    )}
                  </div>
                )}

                {/* ACCEPTED VISIT */}
                {isAccepted && a.applicationType === 'VISIT' && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-3">
                    <p className="text-sm text-blue-800 font-medium">✓ Accepted — hostel will schedule your visit soon.</p>
                  </div>
                )}

                {/* ADMITTED */}
                {a.status === 'ADMITTED' && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-800 font-medium">
                      You are admitted! <Link to="/student/my-hostel" className="underline font-semibold">View your hostel →</Link>
                    </p>
                  </div>
                )}

                {/* PENDING - cancel option */}
                {a.status === 'PENDING' && (
                  <div className="flex justify-end mb-2">
                    <button onClick={() => cancelApplication(a.applicationId)}
                      className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />Cancel application
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-gray-100 mt-2">
                  <Link to={`/hostels/${a.hostel?.hostelId}`}
                    className="inline-flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                    View Hostel <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
