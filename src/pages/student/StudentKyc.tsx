import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { studentService } from '../../services/studentService';

const STEPS = ['Personal', 'Guardian', 'Document', 'Institute & Address'];

const inp = 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400';
const lbl = 'block text-sm font-medium mb-1.5 text-gray-700';

export default function StudentKyc() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [existingKyc, setExistingKyc] = useState<any>(null);
  const [checkingKyc, setCheckingKyc] = useState(true);

  const [form, setForm] = useState({
    dateOfBirth: '', dietType: 'VEG', profilePhotoUrl: '',
    guardianName: '', guardianRelation: '', guardianPhone: '',
    documentType: 'CITIZENSHIP', identityNumber: '', documentPhotoUrl: '',
    instituteName: '', instituteAddress: '', levelOfStudy: '',
    province: '', district: '', municipality: '', tole: '', wardNumber: '',
  });
  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    studentService.getMyKyc()
      .then(res => { const d = res.data || res; setExistingKyc(d); })
      .catch(() => setExistingKyc(null))
      .finally(() => setCheckingKyc(false));
  }, []);

  const uploadFile = async (file: File, type: 'profilePhoto' | 'document') => {
    setUploading(type);
    try {
      const res = await studentService.uploadFile(file, type);
      const url = (res.data || res)?.url || res?.url;
      if (!url) throw new Error('No URL returned');
      f(type === 'profilePhoto' ? 'profilePhotoUrl' : 'documentPhotoUrl', url);
      toast.success('File uploaded successfully');
    } catch { toast.error('Upload failed. Please try again.'); }
    finally { setUploading(null); }
  };

  const handleSubmit = async () => {
    if (!form.dateOfBirth) { toast.error('Date of birth is required'); return; }
    if (!form.guardianName || !form.guardianRelation || !form.guardianPhone) { toast.error('All guardian fields are required'); return; }
    if (!form.identityNumber || !form.documentPhotoUrl) { toast.error('Document details and photo are required'); return; }
    if (!form.instituteName || !form.levelOfStudy) { toast.error('Institute details are required'); return; }
    if (!form.province || !form.district || !form.municipality || !form.tole || !form.wardNumber) { toast.error('All address fields are required'); return; }

    setLoading(true);
    try {
      existingKyc?.kycStatus === 'REJECTED'
        ? await studentService.resubmitKyc(form)
        : await studentService.submitKyc(form);
      toast.success('KYC submitted successfully! Awaiting admin verification.');
      navigate('/student/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'KYC submission failed');
    } finally { setLoading(false); }
  };

  if (checkingKyc) return <DashboardLayout title="KYC"><div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;

  // Show status if already submitted / verified
  if (existingKyc && existingKyc.kycStatus !== 'REJECTED') {
    return (
      <DashboardLayout title="KYC Status">
        <div className="max-w-lg mx-auto mt-8">
          <div className={`rounded-2xl p-8 text-center border-2 ${existingKyc.kycStatus === 'VERIFIED' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            {existingKyc.kycStatus === 'VERIFIED'
              ? <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              : <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />}
            <h2 className="text-2xl font-medium mb-2">
              {existingKyc.kycStatus === 'VERIFIED' ? 'KYC Verified!' : 'Under Review'}
            </h2>
            <p className="text-gray-600">
              {existingKyc.kycStatus === 'VERIFIED'
                ? 'Your KYC is verified. You can now apply to hostels.'
                : 'Your KYC is submitted and being reviewed by admin. Please wait.'}
            </p>
            {existingKyc.kycStatus === 'VERIFIED' && (
              <button onClick={() => navigate('/student/dashboard')}
                className="mt-6 px-6 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium">
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={existingKyc?.kycStatus === 'REJECTED' ? 'Resubmit KYC' : 'Complete KYC'}>
      {existingKyc?.kycStatus === 'REJECTED' && (
        <div className="max-w-2xl mx-auto mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-700">KYC Rejected</p>
            {existingKyc.rejectionRemark && <p className="text-red-600 text-sm mt-1">Reason: {existingKyc.rejectionRemark}</p>}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all ${i <= step ? 'bg-cyan-400 text-white' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
              <div className="hidden sm:block ml-2 mr-1">
                <p className={`text-xs font-medium ${i === step ? 'text-cyan-600' : 'text-gray-400'}`}>{s}</p>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-1 mx-2 rounded transition-all ${i < step ? 'bg-cyan-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 p-6">

        {/* Step 0: Personal */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-xl font-medium mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={lbl}>Date of Birth *</label>
                <input type="date" required value={form.dateOfBirth} onChange={e => f('dateOfBirth', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Diet Preference *</label>
                <select value={form.dietType} onChange={e => f('dietType', e.target.value)} className={inp}>
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                </select>
              </div>
            </div>
            <div>
              <label className={lbl}>Profile Photo (optional)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-cyan-300 transition-colors">
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">JPEG/PNG, max 5MB</p>
                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'profilePhoto')}
                  className="hidden" id="photo-upload" />
                <label htmlFor="photo-upload" className="cursor-pointer px-4 py-2 bg-cyan-400 text-white rounded-lg text-sm hover:bg-cyan-500">
                  {uploading === 'profilePhoto' ? 'Uploading...' : 'Choose Photo'}
                </label>
                {form.profilePhotoUrl && <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" />Photo uploaded</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Guardian */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-medium mb-4">Guardian Details</h2>
            <div>
              <label className={lbl}>Guardian Name *</label>
              <input type="text" required value={form.guardianName} onChange={e => f('guardianName', e.target.value)} placeholder="Full name" className={inp} />
            </div>
            <div>
              <label className={lbl}>Relation *</label>
              <select required value={form.guardianRelation} onChange={e => f('guardianRelation', e.target.value)} className={inp}>
                <option value="">Select Relation</option>
                {['Father','Mother','Brother','Sister','Guardian','Uncle','Aunt'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Guardian Phone *</label>
              <input type="tel" required value={form.guardianPhone} onChange={e => f('guardianPhone', e.target.value)} placeholder="98XXXXXXXX" className={inp} />
            </div>
          </div>
        )}

        {/* Step 2: Document */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-medium mb-4">Identity Document</h2>
            <div>
              <label className={lbl}>Document Type *</label>
              <select required value={form.documentType} onChange={e => f('documentType', e.target.value)} className={inp}>
                <option value="CITIZENSHIP">Citizenship</option>
                <option value="VOTER_ID">Voter ID</option>
                <option value="NATIONAL_ID">National ID</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Identity Number *</label>
              <input type="text" required value={form.identityNumber} onChange={e => f('identityNumber', e.target.value)} placeholder="Document number" className={inp} />
            </div>
            <div>
              <label className={lbl}>Document Photo *</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-cyan-300 transition-colors">
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'document')}
                  className="hidden" id="doc-upload" />
                <label htmlFor="doc-upload" className="cursor-pointer px-4 py-2 bg-cyan-400 text-white rounded-lg text-sm hover:bg-cyan-500">
                  {uploading === 'document' ? 'Uploading...' : 'Upload Document Photo'}
                </label>
                {form.documentPhotoUrl
                  ? <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" />Document uploaded</p>
                  : <p className="text-xs text-red-500 mt-2 flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" />Required</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Institute & Address */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-medium mb-4">Institute & Permanent Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={lbl}>Institute Name *</label>
                <input type="text" required value={form.instituteName} onChange={e => f('instituteName', e.target.value)} placeholder="College / University name" className={inp} />
              </div>
              <div className="md:col-span-2">
                <label className={lbl}>Institute Address *</label>
                <input type="text" required value={form.instituteAddress} onChange={e => f('instituteAddress', e.target.value)} placeholder="Full address" className={inp} />
              </div>
              <div>
                <label className={lbl}>Level of Study *</label>
                <select required value={form.levelOfStudy} onChange={e => f('levelOfStudy', e.target.value)} className={inp}>
                  <option value="">Select Level</option>
                  {['+2 / Intermediate','Bachelor','Master','Diploma','PhD','Other'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 border-t pt-4 mt-2">Permanent Address</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([['province','Province'],['district','District'],['municipality','Municipality'],['tole','Tole'],['wardNumber','Ward Number']] as [string,string][]).map(([k,label]) => (
                <div key={k}>
                  <label className={lbl}>{label} *</label>
                  <input type="text" required value={(form as any)[k]} onChange={e => f(k, e.target.value)} placeholder={label} className={inp} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="px-6 py-2.5 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium transition-colors">
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="px-8 py-2.5 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60 transition-colors">
              {loading ? 'Submitting...' : 'Submit KYC'}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
