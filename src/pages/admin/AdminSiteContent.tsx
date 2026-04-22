import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, Home } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { adminService } from '../../services/adminService';
import { toast } from 'react-toastify';

const inp = 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400';
const ICON_OPTIONS = ['Home','Building','Users','Shield','Star','Heart','Zap','Award','CheckCircle','Clock'];

export default function AdminSiteContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    heroTitle: '', heroSubtitle: '', heroButtonText: '', aboutTitle: '', aboutDescription: '',
    featuresJson: JSON.stringify([{ title: '', description: '', icon: 'Star' }]),
    contactEmail: '', contactPhone: '', contactAddress: '',
    footerTagline: '', footerCopyright: '',
  });

  const [features, setFeatures] = useState([{ title: '', description: '', icon: 'Star' }]);

  useEffect(() => {
    adminService.getSiteContent()
      .then(res => {
        const d = res.data || res;
        if (d) {
          setForm(d);
          try { setFeatures(JSON.parse(d.featuresJson || '[]')); } catch { setFeatures([]); }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const f = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));
  const addFeature = () => setFeatures(f => [...f, { title: '', description: '', icon: 'Star' }]);
  const removeFeature = (i: number) => setFeatures(f => f.filter((_, j) => j !== i));
  const updateFeature = (i: number, k: string, v: string) => setFeatures(f => f.map((x, j) => j === i ? { ...x, [k]: v } : x));

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, featuresJson: JSON.stringify(features) };
      await adminService.updateSiteContent(payload);
      toast.success('Homepage content updated! Changes are live immediately.');
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout title="Homepage Editor"><div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Homepage Editor">
      <div className="space-y-5 max-w-3xl">

        {/* Hero Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2"><Home /> Hero Section</h2>
          <div><label className="block text-sm font-medium mb-1.5">Main Heading</label><input type="text" value={form.heroTitle} onChange={e => f('heroTitle', e.target.value)} placeholder="Find Your Perfect Hostel" className={inp} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Subtitle</label><textarea value={form.heroSubtitle} onChange={e => f('heroSubtitle', e.target.value)} rows={2} className={`${inp} resize-none`} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Button Text</label><input type="text" value={form.heroButtonText} onChange={e => f('heroButtonText', e.target.value)} placeholder="Browse Hostels" className={inp} /></div>
        </div>

        {/* About Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg"> About Section</h2>
          <div><label className="block text-sm font-medium mb-1.5">Title</label><input type="text" value={form.aboutTitle} onChange={e => f('aboutTitle', e.target.value)} className={inp} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Description</label><textarea value={form.aboutDescription} onChange={e => f('aboutDescription', e.target.value)} rows={4} className={`${inp} resize-none`} /></div>
        </div>

        {/* Features */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Features / Why Choose Us</h2>
            <button onClick={addFeature} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-xl text-sm hover:bg-cyan-100">
              <Plus className="w-4 h-4" />Add Feature
            </button>
          </div>
          {features.map((ft, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-500">Feature {i + 1}</span>
                <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-500 mb-1">Title</label>
                  <input type="text" value={ft.title} onChange={e => updateFeature(i, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-cyan-400" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Icon</label>
                  <select value={ft.icon} onChange={e => updateFeature(i, 'icon', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-cyan-400 bg-white">
                    {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select></div>
              </div>
              <div><label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea value={ft.description} onChange={e => updateFeature(i, 'description', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-cyan-400 resize-none" /></div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Email</label><input type="email" value={form.contactEmail} onChange={e => f('contactEmail', e.target.value)} className={inp} /></div>
            <div><label className="block text-sm font-medium mb-1.5">Phone</label><input type="text" value={form.contactPhone} onChange={e => f('contactPhone', e.target.value)} className={inp} /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1.5">Address</label><input type="text" value={form.contactAddress} onChange={e => f('contactAddress', e.target.value)} className={inp} /></div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Footer</h2>
          <div><label className="block text-sm font-medium mb-1.5">Tagline</label><input type="text" value={form.footerTagline} onChange={e => f('footerTagline', e.target.value)} className={inp} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Copyright Text</label><input type="text" value={form.footerCopyright} onChange={e => f('footerCopyright', e.target.value)} className={inp} /></div>
        </div>

        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60 transition-colors">
          <Save className="w-5 h-5" />{saving ? 'Saving...' : 'Save & Publish'}
        </button>
      </div>
    </DashboardLayout>
  );
}
