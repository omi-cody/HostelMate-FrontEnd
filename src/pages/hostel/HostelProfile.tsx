import { useEffect, useState } from 'react';
import { Upload, CheckCircle, Clock, XCircle, Save, Plus, Trash2, Image } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { hostelService } from '../../services/hostelService';
import { toast } from 'react-toastify';

const DAYS = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
const ROOM_TYPES = ['SINGLE','DOUBLE','TRIPLE','QUAD'];
const inp = 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400';
const lbl = 'block text-sm font-medium mb-1.5 text-gray-700';

const emptyMeal = () => DAYS.map(d => ({ dayOfWeek: d, morningBreakfast: '', lunch: '', eveningSnack: '', dinner: '' }));
const emptyPricings = () => ROOM_TYPES.map(t => ({ roomType: t, monthlyPrice: '' }));

export default function HostelProfile() {
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [tab, setTab] = useState<'kyc' | 'profile'>('kyc');

  // KYC form state
  const [kycForm, setKycForm] = useState({
    logoUrl: '',
    admissionFee: '',
    establishedYear: '',
    province: '',
    district: '',
    municipality: '',
    tole: '',
    wardNumber: '',
    panNumber: '',
    panDocumentUrl: '',
    hostelPhotoUrls: [] as string[],
    amenities: '',
    rulesAndRegulations: '',
    roomPricings: emptyPricings(),
    mealPlans: emptyMeal(),
  });

  // Profile edit state (only mutable fields)
  const [profileForm, setProfileForm] = useState<any>({
    logoUrl: '',
    amenities: '',
    rulesAndRegulations: '',
    mealPlans: emptyMeal(),
    hostelPhotoUrls: [],
  });

  useEffect(() => {
    hostelService.getMyKyc()
      .then(res => {
        const d = res.data || res;
        setKyc(d);
        if (d) {
          setProfileForm({
            logoUrl: d.logoUrl || '',
            amenities: d.amenities || '',
            rulesAndRegulations: d.rulesAndRegulations || '',
            mealPlans: d.mealPlans?.length ? d.mealPlans : emptyMeal(),
            hostelPhotoUrls: (() => {
              if (!d.hostelPhotoUrls) return [];
              try { return JSON.parse(d.hostelPhotoUrls); } catch { return d.hostelPhotoUrls.split(',').map((u: string) => u.trim()).filter(Boolean); }
            })(),
          });
          // Pre-fill KYC form if rejected (so user can edit and resubmit)
          if (d.kycStatus === 'REJECTED') {
            setKycForm({
              logoUrl: d.logoUrl || '',
              admissionFee: d.admissionFee?.toString() || '',
              establishedYear: d.establishedYear?.toString() || '',
              province: d.province || '',
              district: d.district || '',
              municipality: d.municipality || '',
              tole: d.tole || '',
              wardNumber: d.wardNumber || '',
              panNumber: d.panNumber || '',
              panDocumentUrl: d.panDocumentUrl || '',
              hostelPhotoUrls: d.hostelPhotoUrls || [],
              amenities: d.amenities || '',
              rulesAndRegulations: d.rulesAndRegulations || '',
              roomPricings: d.roomPricings?.length ? d.roomPricings.map((r: any) => ({ roomType: r.roomType, monthlyPrice: r.monthlyPrice?.toString() })) : emptyPricings(),
              mealPlans: d.mealPlans?.length ? d.mealPlans : emptyMeal(),
            });
          }
        }
      })
      .catch(() => setKyc(null))
      .finally(() => setLoading(false));
  }, []);

  // Upload helpers
  const uploadFile = async (file: File, type: 'logo' | 'pan' | 'photo') => {
    setUploading(type);
    try {
      const svcType = type === 'pan' ? 'pan' : type === 'logo' ? 'logo' : 'photo';
      const res = await hostelService.uploadFile(file, svcType);
      const url = (res.data || res)?.url;
      if (!url) throw new Error('No URL returned');
      if (type === 'logo') {
        setKycForm(f => ({ ...f, logoUrl: url }));
        setProfileForm(f => ({ ...f, logoUrl: url }));
      } else if (type === 'pan') {
        setKycForm(f => ({ ...f, panDocumentUrl: url }));
      } else {
        setKycForm(f => ({ ...f, hostelPhotoUrls: [...f.hostelPhotoUrls, url].slice(0, 4) }));
      }
      toast.success('File uploaded!');
    } catch { toast.error('Upload failed. Try again.'); }
    finally { setUploading(null); }
  };

  const removePhoto = (idx: number) => setKycForm(f => ({ ...f, hostelPhotoUrls: f.hostelPhotoUrls.filter((_, i) => i !== idx) }));

  const updateKycMeal = (day: string, field: string, value: string) =>
    setKycForm(f => ({ ...f, mealPlans: f.mealPlans.map(p => p.dayOfWeek === day ? { ...p, [field]: value } : p) }));
  const updateProfileMeal = (day: string, field: string, value: string) =>
    setProfileForm(f => ({ ...f, mealPlans: f.mealPlans.map(p => p.dayOfWeek === day ? { ...p, [field]: value } : p) }));

  const updatePricing = (idx: number, value: string) =>
    setKycForm(f => ({ ...f, roomPricings: f.roomPricings.map((r, i) => i === idx ? { ...r, monthlyPrice: value } : r) }));

  const submitKyc = async () => {
    if (!kycForm.panDocumentUrl) { toast.error('PAN document photo is required'); return; }
    if (!kycForm.admissionFee || !kycForm.establishedYear) { toast.error('Admission fee and established year are required'); return; }
    if (!kycForm.province || !kycForm.district || !kycForm.municipality || !kycForm.tole || !kycForm.wardNumber) {
      toast.error('All address fields are required'); return;
    }
    if (!kycForm.panNumber) { toast.error('PAN number is required'); return; }

    const filledPricings = kycForm.roomPricings.filter(r => r.monthlyPrice && parseFloat(r.monthlyPrice) > 0);
    if (filledPricings.length === 0) { toast.error('At least one room type pricing is required'); return; }

    setSaving(true);
    try {
      const payload = {
        ...kycForm,
        admissionFee: parseFloat(kycForm.admissionFee),
        establishedYear: parseInt(kycForm.establishedYear),
        roomPricings: filledPricings.map(r => ({ roomType: r.roomType, monthlyPrice: parseFloat(r.monthlyPrice) })),
        mealPlans: kycForm.mealPlans.filter(m => m.morningBreakfast || m.lunch || m.eveningSnack || m.dinner),
      };
      kyc?.kycStatus === 'REJECTED'
        ? await hostelService.resubmitKyc(payload)
        : await hostelService.submitKyc(payload);
      toast.success('KYC submitted! Admin will review within 24–48 hours.');
      const res = await hostelService.getMyKyc();
      setKyc(res.data || res);
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Submission failed. Check all fields.'); }
    finally { setSaving(false); }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await hostelService.updateProfile({
        logoUrl: profileForm.logoUrl,
        amenities: profileForm.amenities,
        rulesAndRegulations: profileForm.rulesAndRegulations,
        mealPlans: profileForm.mealPlans,
        hostelPhotoUrls: JSON.stringify(profileForm.hostelPhotoUrls || []),
      });
      toast.success('Profile updated successfully!');
      setKyc((k: any) => ({ ...k, ...profileForm }));
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <DashboardLayout title="Profile & KYC">
      <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
    </DashboardLayout>
  );

  const kycPending = !kyc;
  const kycRejected = kyc?.kycStatus === 'REJECTED';
  const kycVerified = kyc?.kycStatus === 'VERIFIED';
  const kycUnderReview = kyc?.kycStatus === 'SUBMITTED' || kyc?.kycStatus === 'PENDING';
  const showKycForm = kycPending || kycRejected;

  return (
    <DashboardLayout title="Hostel Profile & KYC">
      {/* Status Banner */}
      {kyc && (
        <div className={`rounded-xl p-4 mb-5 flex items-start gap-3 border ${
          kycVerified ? 'bg-green-50 border-green-200'
          : kycRejected ? 'bg-red-50 border-red-200'
          : 'bg-yellow-50 border-yellow-200'
        }`}>
          {kycVerified ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
           : kycRejected ? <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
           : <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0" />}
          <div>
            <p className="font-medium">
              {kycVerified ? '✓ KYC Verified — Your hostel is listed publicly'
               : kycRejected ? 'KYC Rejected — Please correct and resubmit'
               : 'KYC Under Review — Admin is reviewing your submission'}
            </p>
            {kyc.rejectionRemark && <p className="text-red-600 text-sm mt-1">Reason: {kyc.rejectionRemark}</p>}
          </div>
        </div>
      )}

      {/* Tabs (only when verified) */}
      {kycVerified && (
        <div className="flex gap-2 mb-5">
          {(['kyc', 'profile'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-cyan-400 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t === 'kyc' ? 'KYC Info (read-only)' : 'Edit Profile'}
            </button>
          ))}
        </div>
      )}

      {/*KYC SUBMIT FORM  */}
      {showKycForm && (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
            <h2 className="text-xl font-medium">{kycRejected ? 'Resubmit KYC' : 'Complete Your KYC'}</h2>

            {/* Logo */}
            <div>
              <label className={lbl}>Hostel Logo (optional)</label>
              <div className="flex items-center gap-4">
                {kycForm.logoUrl && (
                  <img src={`http://localhost:9091${kycForm.logoUrl}`} className="w-14 h-14 rounded-xl object-cover border" alt="logo" />
                )}
                <div>
                  <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'logo')} className="hidden" id="logo-up" />
                  <label htmlFor="logo-up" className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
                    <Upload className="w-4 h-4" />{uploading === 'logo' ? 'Uploading...' : 'Upload Logo'}
                  </label>
                </div>
              </div>
            </div>

            {/* Basic details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Admission Fee (Rs) *</label>
                <input type="number" required value={kycForm.admissionFee} onChange={e => setKycForm(f => ({ ...f, admissionFee: e.target.value }))} placeholder="e.g. 5000" className={inp} />
              </div>
              <div>
                <label className={lbl}>Established Year *</label>
                <input type="number" required value={kycForm.establishedYear} onChange={e => setKycForm(f => ({ ...f, establishedYear: e.target.value }))} placeholder="e.g. 2010" className={inp} />
              </div>
            </div>

            {/* Address */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-3 border-t pt-4">Hostel Address</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([['province','Province *'],['district','District *'],['municipality','Municipality *'],['tole','Tole *'],['wardNumber','Ward Number *']] as [string,string][]).map(([k, label]) => (
                  <div key={k}>
                    <label className={lbl}>{label}</label>
                    <input type="text" required value={(kycForm as any)[k]} onChange={e => setKycForm(f => ({ ...f, [k]: e.target.value }))} placeholder={label.replace(' *', '')} className={inp} />
                  </div>
                ))}
              </div>
            </div>

            {/* PAN */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-3 border-t pt-4">Legal Documents</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={lbl}>PAN Number *</label>
                  <input type="text" required value={kycForm.panNumber} onChange={e => setKycForm(f => ({ ...f, panNumber: e.target.value }))} placeholder="PAN card number" className={inp} />
                </div>
              </div>
              <div>
                <label className={lbl}>PAN Document Photo *</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-cyan-300 transition-colors">
                  <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'pan')} className="hidden" id="pan-up" />
                  <label htmlFor="pan-up" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-7 h-7 text-gray-300" />
                    <span className="text-sm px-4 py-1.5 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500">
                      {uploading === 'pan' ? 'Uploading...' : 'Upload PAN Photo'}
                    </span>
                  </label>
                  {kycForm.panDocumentUrl
                    ? <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1"><CheckCircle className="w-3.5 h-3.5" />PAN document uploaded</p>
                    : <p className="text-xs text-red-500 mt-2">Required — upload a clear photo of PAN card</p>}
                </div>
              </div>
            </div>

            {/* Hostel Photos (up to 4) */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-3 border-t pt-4">Hostel Photos (up to 4)</p>
              <div className="flex flex-wrap gap-3 mb-3">
                {kycForm.hostelPhotoUrls.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={`http://localhost:9091${url}`} className="w-24 h-24 rounded-xl object-cover border" alt={`Photo ${i+1}`} />
                    <button onClick={() => removePhoto(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
                  </div>
                ))}
                {kycForm.hostelPhotoUrls.length < 4 && (
                  <div>
                    <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'photo')} className="hidden" id="photo-up" />
                    <label htmlFor="photo-up" className="cursor-pointer w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-cyan-300 text-gray-400 hover:text-cyan-400 transition-colors">
                      <Image className="w-6 h-6" />
                      <span className="text-xs">{uploading === 'photo' ? '...' : 'Add Photo'}</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Room Pricing */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-3 border-t pt-4">Room Pricing <span className="text-gray-400 font-normal">(leave blank to skip a type)</span></p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {kycForm.roomPricings.map((rp, i) => (
                  <div key={rp.roomType}>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">{rp.roomType}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs</span>
                      <input type="number" min="0" value={rp.monthlyPrice} onChange={e => updatePricing(i, e.target.value)}
                        placeholder="0" className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities & Rules */}
            <div className="border-t pt-4 space-y-4">
              <div>
                <label className={lbl}>Amenities <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                <input type="text" value={kycForm.amenities} onChange={e => setKycForm(f => ({ ...f, amenities: e.target.value }))}
                  placeholder="WiFi, Hot Water, Laundry, Parking, CCTV" className={inp} />
              </div>
              <div>
                <label className={lbl}>Rules & Regulations</label>
                <textarea value={kycForm.rulesAndRegulations} onChange={e => setKycForm(f => ({ ...f, rulesAndRegulations: e.target.value }))}
                  rows={3} placeholder="Gate closes at 10pm. No alcohol. Visitors allowed 8am-8pm..." className={`${inp} resize-none`} />
              </div>
            </div>

            {/* Meal Plan */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-600 mb-3">Weekly Meal Plan <span className="text-gray-400 font-normal">(optional)</span></p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Day','Breakfast','Lunch','Evening Snack','Dinner'].map(h => (
                        <th key={h} className="px-2 py-2 text-left text-xs text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => (
                      <tr key={day} className="border-b border-gray-50">
                        <td className="px-2 py-1.5 font-medium text-xs text-gray-600 w-16">{day.slice(0,3)}</td>
                        {(['morningBreakfast','lunch','eveningSnack','dinner'] as const).map(field => (
                          <td key={field} className="px-1 py-1">
                            <input type="text"
                              value={kycForm.mealPlans.find(p => p.dayOfWeek === day)?.[field] || ''}
                              onChange={e => updateKycMeal(day, field, e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-cyan-400 min-w-[100px]" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <button onClick={submitKyc} disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60 transition-colors">
            {saving ? 'Submitting...' : kycRejected ? 'Resubmit KYC' : 'Submit KYC'}
          </button>
        </div>
      )}

      {/* KYC UNDER REVIEW*/}
      {kycUnderReview && (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-lg mx-auto mt-6">
          <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">KYC Under Review</h2>
          <p className="text-gray-500">Admin is reviewing your KYC submission. You'll receive an email and notification once it's processed.</p>
          <p className="text-sm text-gray-400 mt-3">Usually within 24–48 hours.</p>
        </div>
      )}

      {/* KYC INFO VIEW (verified, kyc tab)  */}
      {kycVerified && tab === 'kyc' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-medium mb-4">KYC Information <span className="text-gray-400 text-sm font-normal">(PAN and document details are locked)</span></h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              ['Admission Fee', `Rs ${kyc.admissionFee}`],
              ['Established', kyc.establishedYear],
              ['PAN Number', kyc.panNumber],
              ['Province', kyc.province],
              ['District', kyc.district],
              ['Municipality', kyc.municipality],
              ['Tole', kyc.tole],
              ['Ward No.', kyc.wardNumber],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-0.5">{k}</p>
                <p className="font-medium">{v || '—'}</p>
              </div>
            ))}
          </div>
          {kyc.roomPricings?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Room Pricing</p>
              <div className="flex flex-wrap gap-2">
                {kyc.roomPricings.map((r: any) => (
                  <span key={r.roomType} className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-xl text-sm font-medium">
                    {r.roomType}: Rs {r.monthlyPrice}/mo
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PROFILE EDIT (verified, profile tab) ────────────────────────── */}
      {kycVerified && tab === 'profile' && (
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="font-medium">Hostel Logo</h3>
            <div className="flex items-center gap-4">
              {profileForm.logoUrl && (
                <img src={`http://localhost:9091${profileForm.logoUrl}`} className="w-16 h-16 rounded-xl object-cover border" alt="logo" />
              )}
              <div>
                <input type="file" accept="image/*" onChange={e => {
                  if (!e.target.files?.[0]) return;
                  setUploading('logo');
                  hostelService.uploadFile(e.target.files[0], 'logo')
                    .then(res => { const url = (res.data || res)?.url; if (url) setProfileForm(f => ({ ...f, logoUrl: url })); toast.success('Logo uploaded'); })
                    .catch(() => toast.error('Upload failed'))
                    .finally(() => setUploading(null));
                }} className="hidden" id="logo-edit" />
                <label htmlFor="logo-edit" className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
                  <Upload className="w-4 h-4" />{uploading === 'logo' ? 'Uploading...' : 'Change Logo'}
                </label>
              </div>
            </div>
          </div>


          {/* Hostel Photos (up to 4) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-medium mb-4">Hostel Photos (up to 4)</h3>
            <div className="flex flex-wrap gap-3 mb-3">
              {(profileForm.hostelPhotoUrls || []).map((url: string, i: number) => (
                <div key={i} className="relative group">
                  <img src={`http://localhost:9091${url}`} className="w-24 h-24 rounded-xl object-cover border border-gray-200" alt={`Photo ${i+1}`}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <button onClick={() => setProfileForm((f: any) => ({ ...f, hostelPhotoUrls: f.hostelPhotoUrls.filter((_: any, j: number) => j !== i) }))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                </div>
              ))}
              {((profileForm as any).hostelPhotoUrls || []).length < 4 && (
                <div>
                  <input type="file" accept="image/*" id="prof-photo-up"
                    onChange={async e => {
                      if (!e.target.files?.[0]) return;
                      setUploading('photo');
                      try {
                        const res = await hostelService.uploadFile(e.target.files[0], 'photo');
                        const url = (res.data || res)?.url;
                        if (url) setProfileForm((f: any) => ({ ...f, hostelPhotoUrls: [...(f.hostelPhotoUrls || []), url] }));
                        toast.success('Photo uploaded');
                      } catch { toast.error('Upload failed'); }
                      finally { setUploading(null); }
                    }}
                    className="hidden" />
                  <label htmlFor="prof-photo-up"
                    className="cursor-pointer w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-cyan-300 hover:text-cyan-400 transition-colors">
                    <Image className="w-6 h-6 mb-1" />
                    <span className="text-xs">{uploading === 'photo' ? '...' : 'Add Photo'}</span>
                  </label>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">Upload photos of your hostel — rooms, common areas, dining, etc.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <h3 className="font-medium">Amenities & Rules</h3>
            <div>
              <label className={lbl}>Amenities <span className="text-gray-400 font-normal">(comma-separated)</span></label>
              <input type="text" value={profileForm.amenities} onChange={e => setProfileForm(f => ({ ...f, amenities: e.target.value }))}
                placeholder="WiFi, Hot Water, Laundry" className={inp} />
            </div>
            <div>
              <label className={lbl}>Rules & Regulations</label>
              <textarea value={profileForm.rulesAndRegulations} onChange={e => setProfileForm(f => ({ ...f, rulesAndRegulations: e.target.value }))}
                rows={4} className={`${inp} resize-none`} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-medium mb-4">Weekly Meal Plan</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Day','Breakfast','Lunch','Evening Snack','Dinner'].map(h => (
                      <th key={h} className="px-2 py-2 text-left text-xs text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map(day => (
                    <tr key={day} className="border-b border-gray-50">
                      <td className="px-2 py-1.5 font-medium text-xs text-gray-600 w-16">{day.slice(0,3)}</td>
                      {(['morningBreakfast','lunch','eveningSnack','dinner'] as const).map(field => (
                        <td key={field} className="px-1 py-1">
                          <input type="text"
                            value={profileForm.mealPlans.find(p => p.dayOfWeek === day)?.[field] || ''}
                            onChange={e => updateProfileMeal(day, field, e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-cyan-400 min-w-[100px]" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button onClick={saveProfile} disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60 transition-colors">
            <Save className="w-5 h-5" />{saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
