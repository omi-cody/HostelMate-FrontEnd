import { useEffect, useState } from 'react';
import { Bell, Users, FileText, CreditCard, Calendar, Wrench, LogOut } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { hostelService } from '../../services/hostelService';

const TYPE_ICONS: Record<string, any> = {
  APPLICATION_RECEIVED: FileText,
  PAYMENT_RECEIVED: CreditCard,
  LEAVE_REQUESTED: LogOut,
  COMPLAINT_SUBMITTED: Wrench,
  STUDENT_ADMITTED: Users,
  DEFAULT: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  APPLICATION_RECEIVED: 'bg-blue-100 text-blue-600',
  PAYMENT_RECEIVED: 'bg-green-100 text-green-600',
  LEAVE_REQUESTED: 'bg-yellow-100 text-yellow-600',
  COMPLAINT_SUBMITTED: 'bg-red-100 text-red-600',
  STUDENT_ADMITTED: 'bg-purple-100 text-purple-600',
  DEFAULT: 'bg-gray-100 text-gray-500',
};

export default function HostelNotifications() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hostelService.getNotifications()
      .then(r => setNotifs(r.data || r || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Notifications">
      <div className="flex items-center justify-between mb-5">
        <p className="text-gray-500 text-sm">{notifs.length} notification{notifs.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bell className="w-14 h-14 mx-auto mb-3 text-gray-200" />
          <p>No notifications yet.</p>
          <p className="text-sm mt-1">Notifications appear here when students apply, pay fees, or submit requests.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n: any) => {
            const iconKey = n.notificationType || 'DEFAULT';
            const Icon = TYPE_ICONS[iconKey] || Bell;
            const colorClass = TYPE_COLORS[iconKey] || TYPE_COLORS.DEFAULT;
            return (
              <div key={n.notificationId}
                className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {n.notificationType && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full flex-shrink-0 hidden sm:block">
                      {n.notificationType.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
