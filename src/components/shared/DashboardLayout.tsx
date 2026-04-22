import { useState, useEffect, useRef } from 'react';
import logo from '../../assets/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, LayoutDashboard, FileText, Building, Bell, CreditCard,
  Wrench, Calendar, Users, ClipboardList, Settings, LogOut,
  Menu, ChevronRight, Shield, UserCircle, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Chatbot from '../../components/shared/Chatbot';

const BASE = 'http://localhost:9091';

const STUDENT_NAV = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Find Hostels', path: '/hostels', icon: Building },
  { label: 'Applications', path: '/student/applications', icon: FileText },
  { label: 'My Hostel', path: '/student/my-hostel', icon: Home },
  { label: 'Requests', path: '/student/requests', icon: Wrench },
  { label: 'Payments', path: '/student/payments', icon: CreditCard },
  { label: 'Profile', path: '/student/profile', icon: UserCircle },
];

const HOSTEL_NAV = [
  { label: 'Dashboard', path: '/hostel/dashboard', icon: LayoutDashboard },
  { label: 'Rooms', path: '/hostel/rooms', icon: Building },
  { label: 'Applications', path: '/hostel/applications', icon: FileText },
  { label: 'Students', path: '/hostel/students', icon: Users },
  { label: 'Requests', path: '/hostel/requests', icon: Wrench },
  { label: 'Events', path: '/hostel/events', icon: Calendar },
  { label: 'Payments', path: '/hostel/payments', icon: CreditCard },
  { label: 'Profile / KYC', path: '/hostel/profile', icon: Settings },
];

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Student KYC', path: '/admin/kyc/students', icon: ClipboardList },
  { label: 'Hostel KYC', path: '/admin/kyc/hostels', icon: ClipboardList },
  { label: 'All Students', path: '/admin/students', icon: Users },
  { label: 'All Hostels', path: '/admin/hostels', icon: Building },
  { label: 'Payments', path: '/admin/payments', icon: CreditCard },
  { label: 'Homepage Editor', path: '/admin/site-content', icon: Shield },
  { label: 'Profile', path: '/admin/profile', icon: UserCircle },
];

export default function DashboardLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [hostelInfo, setHostelInfo] = useState<{ name?: string; logoUrl?: string } | null>(null);
  const [studentPhotoUrl, setStudentPhotoUrl] = useState<string | null>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const role = user?.role || 'STUDENT';
  const nav = role === 'ADMIN' ? ADMIN_NAV : role === 'HOSTEL' ? HOSTEL_NAV : STUDENT_NAV;

  // Load profile photo / hostel logo
  useEffect(() => {
    if (role === 'HOSTEL') {
      import('../../services/hostelService').then(({ hostelService }) => {
        hostelService.getMyKyc()
          .then((res: any) => { const d = res.data || res; setHostelInfo({ name: d.hostel?.hostelName, logoUrl: d.logoUrl }); })
          .catch(() => {});
      });
    } else if (role === 'STUDENT') {
      import('../../services/studentService').then(({ studentService }) => {
        studentService.getMyKyc()
          .then((res: any) => { const d = res.data || res; if (d?.profilePhotoUrl) setStudentPhotoUrl(d.profilePhotoUrl); })
          .catch(() => {});
      });
    }
  }, [role]);

  // Load notification count
  useEffect(() => {
    const loadCount = async () => {
      try {
        if (role === 'STUDENT') {
          const { studentService } = await import('../../services/studentService');
          const r = await studentService.getUnreadCount();
          setNotifCount((r.data || r)?.count || 0);
        } else if (role === 'HOSTEL') {
          // Count unread from hostel notifications
          const { hostelService } = await import('../../services/hostelService');
          const r = await hostelService.getNotifications();
          const list = r.data || r || [];
          setNotifCount(list.filter((n: any) => !n.read).length);
        } else if (role === 'ADMIN') {
          const { adminService } = await import('../../services/adminService');
          const r = await adminService.getNotificationCount();
          setNotifCount((r.data || r)?.count || 0);
        }
      } catch {}
    };
    loadCount();
    const interval = setInterval(loadCount, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [role]);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openNotifications = async () => {
    setNotifOpen(o => !o);
    if (!notifOpen) {
      setNotifLoading(true);
      try {
        let list: any[] = [];
        if (role === 'STUDENT') {
          const { studentService } = await import('../../services/studentService');
          const r = await studentService.getNotifications();
          list = (r.data || r || []).slice(0, 8);
          await studentService.markAllRead();
          setNotifCount(0);
        } else if (role === 'HOSTEL') {
          const { hostelService } = await import('../../services/hostelService');
          const r = await hostelService.getNotifications();
          list = (r.data || r || []).slice(0, 8);
          setNotifCount(0);
        } else if (role === 'ADMIN') {
          const { adminService } = await import('../../services/adminService');
          const r = await adminService.getNotifications();
          list = (r.data || r || []).slice(0, 8);
        }
        setNotifList(list);
      } catch {}
      finally { setNotifLoading(false); }
    }
  };

  const notifPath = role === 'STUDENT' ? '/student/notifications' : role === 'HOSTEL' ? '/hostel/notifications' : '/admin/dashboard';

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };
  const displayName = role === 'HOSTEL' ? (hostelInfo?.name || user?.fullName) : user?.fullName;
  const initials = (displayName || 'U').charAt(0).toUpperCase();

  const AvatarEl = ({ size = 'md' }: { size?: 'sm' | 'md' }) => {
    const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
    if (role === 'HOSTEL' && hostelInfo?.logoUrl) {
      return <img src={`${BASE}${hostelInfo.logoUrl}`} alt="logo" className={`${sz} rounded-xl object-cover border-2 border-white shadow-sm`} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
    }
    if (role === 'STUDENT' && studentPhotoUrl) {
      return <img src={studentPhotoUrl.startsWith('http') ? studentPhotoUrl : `${BASE}${studentPhotoUrl}`} alt="profile" className={`${sz} rounded-full object-cover border-2 border-white shadow-sm`} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
    }
    const bg = role === 'ADMIN' ? 'bg-purple-100' : role === 'HOSTEL' ? 'bg-orange-100' : 'bg-cyan-100';
    const tc = role === 'ADMIN' ? 'text-purple-700' : role === 'HOSTEL' ? 'text-orange-700' : 'text-cyan-700';
    return <div className={`${sz} ${bg} rounded-full flex items-center justify-center flex-shrink-0`}><span className={`${tc} font-bold`}>{initials}</span></div>;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
        <div className="w-60 h-10 rounded flex items-center justify-center">
          <img
            src={logo}
            alt="HostelMate Logo"
            className="h-auto w-40 object-contain"
          />
        </div>
      </div>
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2"><AvatarEl />
          <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{displayName}</p><p className="text-xs text-gray-400 truncate">{user?.email}</p></div>
        </div>
        <span className={`inline-block px-2.5 py-0.5 text-xs rounded-full font-semibold ${role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : role === 'HOSTEL' ? 'bg-orange-100 text-orange-700' : 'bg-cyan-100 text-cyan-700'}`}>{role}</span>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = location.pathname === item.path || (item.path.length > 10 && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? 'bg-cyan-400 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full transition-colors font-medium"><LogOut className="w-4 h-4" />Log Out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
          <Chatbot/>

      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 fixed h-full z-30 shadow-sm"><SidebarContent /></aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60 bg-white z-50 shadow-xl"><SidebarContent /></aside>
        </div>
      )}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="md:hidden text-gray-500 p-1 hover:bg-gray-100 rounded-lg"><Menu className="w-6 h-6" /></button>
            {title && <h1 className="text-base font-semibold text-gray-800">{title}</h1>}
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button onClick={openNotifications}
                className="relative p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-sm">Notifications</p>
                    <div className="flex gap-2">
                      {role !== 'ADMIN' && (
                        <Link to={notifPath} onClick={() => setNotifOpen(false)}
                          className="text-xs text-cyan-500 hover:text-cyan-600 font-medium">See all</Link>
                      )}
                      <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifLoading ? (
                      <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
                    ) : notifList.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifList.map((n: any, i: number) => (
                        <div key={n.notificationId || n.id || i}
                          className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 last:border-0 ${!n.read && !n.isRead ? 'bg-cyan-50/40' : ''}`}>
                          <div className="flex items-start gap-2.5">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read && !n.isRead ? 'bg-cyan-400' : 'bg-gray-200'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(n.createdAt || n.submittedAt || Date.now()).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {role !== 'ADMIN' && notifList.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-100">
                      <Link to={notifPath} onClick={() => setNotifOpen(false)}
                        className="block text-center text-sm text-cyan-500 hover:text-cyan-600 font-medium py-1">
                        View all notifications →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="text-sm text-gray-500 hidden sm:block font-medium">{displayName}</span>
            <AvatarEl />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
