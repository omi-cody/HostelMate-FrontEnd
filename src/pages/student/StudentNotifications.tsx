import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { studentService } from '../../services/studentService';
import { toast } from 'react-toastify';

export default function StudentNotifications() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => studentService.getNotifications().then(r => setNotifs(r.data || r || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markAll = async () => {
    try { await studentService.markAllRead(); toast.success('All marked as read'); setNotifs(n => n.map(x => ({...x, read: true}))); }
    catch { toast.error('Failed'); }
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="flex justify-between items-center mb-5">
        <p className="text-gray-500 text-sm">{notifs.filter(n => !n.read).length} unread</p>
        <button onClick={markAll} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 text-sm">
          <CheckCheck className="w-4 h-4" />Mark all read
        </button>
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
      : notifs.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><Bell className="w-14 h-14 mx-auto mb-3 text-gray-200" /><p>No notifications yet.</p></div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n: any) => (
            <div key={n.notificationId} className={`bg-white border rounded-2xl p-4 transition-all ${!n.read ? 'border-cyan-200 bg-cyan-50/30' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-cyan-400' : 'bg-gray-300'}`} />
                <div className="flex-1">
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full flex-shrink-0">{n.notificationType?.replace(/_/g, ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
