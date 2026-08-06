import { useState, useEffect } from 'react';
import api from '../../api';
import { LayoutDashboard, CircleDollarSign, CalendarDays, Map, Users, Image, Settings, LogOut } from 'lucide-react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Production Components
import DonationList from './components/DonationList';
import BookingManager from './components/BookingManager';
import RoadmapManager from './components/RoadmapManager';
import LeadList from './components/LeadList';
import GalleryManager from './components/GalleryManager';
import SettingsManager from './components/SettingsManager';
import { StatsSkeleton, TableRowSkeleton } from './components/Skeleton';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/dashboard/');
        setStats(res.data);
      } catch (err) {
        console.error('Dashboard sync error:', err);
      }
    };

    fetchStats();
    // Poll every 30 seconds for real-time feeling without excessive server load
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/staff/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/staff/dashboard' },
    { name: 'Donations', icon: <CircleDollarSign size={20} />, path: '/staff/dashboard/donations' },
    { name: 'Bookings', icon: <CalendarDays size={20} />, path: '/staff/dashboard/bookings' },
    { name: 'Roadmap', icon: <Map size={20} />, path: '/staff/dashboard/roadmap' },
    { name: 'Leads', icon: <Users size={20} />, path: '/staff/dashboard/leads' },
    { name: 'Gallery', icon: <Image size={20} />, path: '/staff/dashboard/gallery' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/staff/dashboard/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-950 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold tracking-tighter">
            UTONGA<span className="text-utonga-accent">.</span> STAFF
          </Link>
          <div className="mt-3 flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-black">Admin: {user?.username}</span>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${location.pathname === item.path ? 'bg-utonga-green text-white shadow-lg shadow-utonga-green/20' : 'text-gray-500 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-bold text-xs">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-500 hover:text-red-400 w-full px-4 py-3 rounded-xl hover:bg-red-500/5 transition-all"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-60 p-6 overflow-y-auto min-h-screen">
        <Routes>
          <Route path="/" element={
            <div className="space-y-6">
              <header className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-2xl font-black">Control Center</h1>
                  <p className="text-gray-500 text-xs mt-1 font-medium">Real-time status of Utonga Conservation efforts.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-[10px] bg-gray-900 border border-gray-800 px-4 py-1.5 rounded-full font-bold text-gray-500 uppercase tracking-widest">Production</span>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {!stats ? (
                  <>
                    <StatsSkeleton />
                    <StatsSkeleton />
                    <StatsSkeleton />
                    <StatsSkeleton />
                  </>
                ) : (
                  <>
                    <div className="bg-gray-900 p-5 rounded-2xl relative overflow-hidden group hover:bg-gray-800/50 transition-all shadow-lg border border-gray-800">
                      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CircleDollarSign size={40} />
                      </div>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Raised</p>
                      <p className="text-2xl font-black text-utonga-accent">${stats?.total_raised?.toLocaleString() || '0'}</p>
                      <div className="mt-3 flex items-center text-gray-600 text-[9px] font-bold uppercase tracking-tighter">
                        <span>Verified Ledger</span>
                      </div>
                    </div>

                    <div className="bg-gray-900 p-5 rounded-2xl relative overflow-hidden group hover:bg-gray-800/50 transition-all shadow-lg border border-gray-800">
                      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CalendarDays size={40} />
                      </div>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Pending Bookings</p>
                      <p className="text-2xl font-black">{stats?.pending_bookings || '0'}</p>
                      <Link to="/staff/dashboard/bookings" className="mt-3 block text-[10px] font-black uppercase tracking-widest text-utonga-accent hover:underline">Manage →</Link>
                    </div>

                    <div className="bg-gray-900 p-5 rounded-2xl relative overflow-hidden group hover:bg-gray-800/50 transition-all shadow-lg border border-gray-800">
                      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={40} />
                      </div>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">New Pipeline Leads</p>
                      <p className="text-2xl font-black">{stats?.new_leads || '0'}</p>
                      <Link to="/staff/dashboard/leads" className="mt-3 block text-[10px] font-black uppercase tracking-widest text-utonga-accent hover:underline">View CRM →</Link>
                    </div>

                    <div className="bg-gray-900 p-5 rounded-2xl relative overflow-hidden group hover:bg-gray-800/50 transition-all shadow-lg border border-gray-800">
                      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Settings size={40} />
                      </div>
                      <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">System Status</p>
                      <p className="text-2xl font-black text-utonga-green">ONLINE</p>
                      <p className="mt-3 text-[10px] font-black text-gray-600 uppercase tracking-widest">v1.2.4</p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black">Transaction Activity</h3>
                  <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white border border-gray-800 px-4 py-2 rounded-xl transition-all">Export Report</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 text-[9px] uppercase tracking-widest font-black">
                        <th className="pb-4">Donor Identity</th>
                        <th className="pb-4">Amount</th>
                        <th className="pb-4">Gateway</th>
                        <th className="pb-4">Verification</th>
                        <th className="pb-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {!stats ? (
                        <>
                          <TableRowSkeleton cols={5} />
                          <TableRowSkeleton cols={5} />
                          <TableRowSkeleton cols={5} />
                        </>
                      ) : (
                        <tr className="text-xs">
                          <td className="py-12 text-gray-600 text-center uppercase tracking-widest font-black" colSpan="5">
                            No recent transactions detected
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          } />
          {/* Detailed views */}
          <Route path="/donations" element={<DonationList />} />
          <Route path="/bookings" element={<BookingManager />} />
          <Route path="/roadmap" element={<RoadmapManager />} />
          <Route path="/leads" element={<LeadList />} />
          <Route path="/gallery" element={<GalleryManager />} />
          <Route path="/settings" element={<SettingsManager />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
