import { useEffect, useState } from 'react';
import { Calendar, Plus, Pencil, Trash2, Waypoints } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { hostelService } from '../../services/hostelService';
import { toast } from 'react-toastify';

const inp = 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400';

export default function HostelEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [showDeleteModel, setShowDeleteModel] = useState<{id:string}|null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ eventName: '', detail: '', location: '', eventDate: '' });

  const load = () => hostelService.getEvents().then(r => setEvents(r.data || r || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const open = (ev?: any) => {
    setEditing(ev || null);
    setForm(ev ? { eventName: ev.eventName, detail: ev.detail || '', location: ev.location, eventDate: ev.eventDate?.slice(0,16) } : { eventName: '', detail: '', location: '', eventDate: '' });
    setShow(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      editing ? await hostelService.updateEvent(editing.eventId, form) : await hostelService.createEvent(form);
      toast.success(editing ? 'Event updated!' : 'Event created! Students will be notified.');
      setShow(false); load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    try { await hostelService.deleteEvent(id); toast.success('Event deleted'); setEvents(e => e.filter(x => x.eventId !== id)); 
      setShowDeleteModel(null);
    }
    catch { toast.error('Delete failed'); }
  };

  return (
    <DashboardLayout title="Events">
      <div className="flex justify-between items-center mb-5">
        <p className="text-gray-500 text-sm">{events.length} events</p>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 text-sm font-medium">
          <Plus className="w-4 h-4" />Add Event
        </button>
      </div>
      {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
      : events.length === 0 ? (<div className="text-center py-20 text-gray-400"><Calendar className="w-14 h-14 mx-auto mb-3 text-gray-200" /><p>No events yet.</p></div>)
      : (
        <div className="space-y-4">
          {events.map((ev: any) => (
            <div key={ev.eventId} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{ev.eventName}</h3>
                  <p className="text-sm text-gray-500 mt-1"><Waypoints className="w-4 h-4 inline"/> {ev.location} · <Calendar className="w-4 h-4 inline"/> {new Date(ev.eventDate).toLocaleString()}</p>
                  {ev.detail && <p className="text-sm text-gray-600 mt-2">{ev.detail}</p>}
                </div>
                <div className="flex gap-1 ml-4">
                  <button onClick={() => open(ev)} className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setShowDeleteModel({id: ev.eventId})} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteModel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-medium mb-4">Delete Event</h2>    
            <p>Are you sure you want to delete this event?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDeleteModel(null)} className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={() => del(showDeleteModel.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-medium mb-4">{editing ? 'Edit Event' : 'New Event'}</h2>
            <form onSubmit={save} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1.5">Event Name *</label><input type="text" required value={form.eventName} onChange={e => setForm(f => ({...f, eventName: e.target.value}))} className={inp} /></div>
              <div><label className="block text-sm font-medium mb-1.5">Location *</label><input type="text" required value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} className={inp} /></div>
              <div><label className="block text-sm font-medium mb-1.5">Date & Time *</label><input type="datetime-local" required value={form.eventDate} onChange={e => setForm(f => ({...f, eventDate: e.target.value}))} className={inp} /></div>
              <div><label className="block text-sm font-medium mb-1.5">Details</label><textarea value={form.detail} onChange={e => setForm(f => ({...f, detail: e.target.value}))} rows={3} className={`${inp} resize-none`} /></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShow(false)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
