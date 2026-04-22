import { useEffect, useState } from 'react';
import { User, Upload, CheckCircle, Camera } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const BASE = 'http://localhost:9091';
const inp = 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400';
const lbl = 'block text-sm font-medium mb-1.5 text-gray-700';

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    profilePhotoUrl: '',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    instituteName: '',
    instituteAddress: '',
    levelOfStudy: '',
    dietType: '',
  });
  // Read-only KYC fields
  const [kycInfo, setKycInfo] = useState<any>(null);

  useEffect(() => {
    studentService.getMyKyc()
      .then(res => {
        const k = res.data || res;
        setKycInfo(k);
        setForm({
          fullName: user?.fullName || '',
          profilePhotoUrl: k?.profilePhotoUrl || '',
          guardianName: k?.guardianName || '',
          guardianRelation: k?.guardianRelation || '',
          guardianPhone: k?.guardianPhone || '',
          instituteName: k?.instituteName || '',
          instituteAddress: k?.instituteAddress || '',
          levelOfStudy: k?.levelOfStudy || '',
          dietType: k?.dietType || '',
        });
      })
      .catch(() => setForm(f => ({ ...f, fullName: user?.fullName || '' })))
      .finally(() => setLoading(false));
  }, []);

  const uploadPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }
    setUploading(true);
    try {
      const res = await studentService.uploadFile(file, 'profilePhoto');
      const url = (res.data || res)?.url || res?.url;
      if (url) {
        setForm(f => ({ ...f, profilePhotoUrl: url }));
        toast.success('Profile photo uploaded!');
      } else {
        toast.error('Upload succeeded but no URL returned');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      await studentService.updateProfile({
        fullName: form.fullName.trim(),
        profilePhotoUrl: form.profilePhotoUrl || undefined,
        guardianName: form.guardianName,
        guardianRelation: form.guardianRelation,
        guardianPhone: form.guardianPhone,
        instituteName: form.instituteName,
        instituteAddress: form.instituteAddress,
        levelOfStudy: form.levelOfStudy,
        dietType: form.dietType || undefined,
      });
      updateUser({ fullName: form.fullName.trim() });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed. Please try again.');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <DashboardLayout title="My Profile">
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const photoUrl = form.profilePhotoUrl ? `${BASE}${form.profilePhotoUrl}` : null;

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-2xl space-y-5">

        {/* Profile Photo Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Profile Photo</h3>
          <div className="flex items-center gap-5">
            {/* Photo preview */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-cyan-100 flex items-center justify-center overflow-hidden border-2 border-cyan-200">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    className="w-full h-full object-cover"
                    alt="Profile"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-4xl font-bold text-cyan-600">
                    {form.fullName?.charAt(0)?.toUpperCase() || user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              {/* Upload overlay */}
              <label htmlFor="profile-photo-upload"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-cyan-400 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-500 shadow-md transition-colors border-2 border-white">
                <Camera className="w-4 h-4" />
              </label>
              <input id="profile-photo-upload" type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
            </div>

            <div>
              <p className="font-medium text-gray-800">{form.fullName || user?.fullName}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              {form.profilePhotoUrl && (
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />Photo uploaded
                </p>
              )}
              <div className="mt-2">
                <label htmlFor="profile-photo-upload"
                  className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Change Photo'}
                </label>
                <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG or WebP · Max 5MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold">Basic Information</h3>
          <div>
            <label className={lbl}>Full Name *</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={form.fullName}
                onChange={e => setForm(f => ({...f, fullName: e.target.value}))}
                className={`${inp} pl-10`} placeholder="Your full name" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="text-sm text-gray-600 font-medium">{user?.email}</p>
              <p className="text-xs text-gray-300 mt-0.5">Cannot be changed</p>
            </div>
            {kycInfo?.dateOfBirth && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Date of Birth</p>
                <p className="text-sm text-gray-600 font-medium">{kycInfo.dateOfBirth}</p>
                <p className="text-xs text-gray-300 mt-0.5">Cannot be changed</p>
              </div>
            )}
          </div>
        </div>

        {/* Guardian Details */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold">Guardian Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Guardian Name</label>
              <input type="text" value={form.guardianName}
                onChange={e => setForm(f => ({...f, guardianName: e.target.value}))}
                className={inp} placeholder="Guardian's full name" />
            </div>
            <div>
              <label className={lbl}>Relation</label>
              <select value={form.guardianRelation}
                onChange={e => setForm(f => ({...f, guardianRelation: e.target.value}))}
                className={inp}>
                <option value="">Select relation</option>
                {['Father','Mother','Brother','Sister','Guardian','Uncle','Aunt'].map(r =>
                  <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Guardian Phone</label>
              <input type="tel" value={form.guardianPhone}
                onChange={e => setForm(f => ({...f, guardianPhone: e.target.value}))}
                className={inp} placeholder="98XXXXXXXX" />
            </div>
          </div>
        </div>

        {/* Institute Details */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold">Institute Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={lbl}>Institute Name</label>
              <input type="text" value={form.instituteName}
                onChange={e => setForm(f => ({...f, instituteName: e.target.value}))}
                className={inp} placeholder="College / University name" />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Institute Address</label>
              <input type="text" value={form.instituteAddress}
                onChange={e => setForm(f => ({...f, instituteAddress: e.target.value}))}
                className={inp} placeholder="Full address" />
            </div>
            <div>
              <label className={lbl}>Level of Study</label>
              <select value={form.levelOfStudy}
                onChange={e => setForm(f => ({...f, levelOfStudy: e.target.value}))}
                className={inp}>
                <option value="">Select level</option>
                {['+2 / Intermediate','Bachelor','Master','Diploma','PhD','Other'].map(l =>
                  <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Read-only: Permanent Address & Document */}
        {kycInfo && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-sm font-semibold text-amber-800 mb-3">🔒 Locked Fields (set during KYC)</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['Permanent Address', [kycInfo.tole, kycInfo.municipality, kycInfo.district, kycInfo.province].filter(Boolean).join(', ')],
                ['Ward No.', kycInfo.wardNumber],
                ['Document Type', kycInfo.documentType],
                ['Identity No.', kycInfo.identityNumber],
              ].filter(([,v]) => v).map(([k, v]) => (
                <div key={k} className="bg-white/60 rounded-xl p-2.5">
                  <p className="text-xs text-amber-600 mb-0.5">{k}</p>
                  <p className="font-medium text-gray-700">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="px-8 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-semibold disabled:opacity-60 transition-colors">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </DashboardLayout>
  );
}
