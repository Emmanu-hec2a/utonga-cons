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
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full">
        <div className="p-8">
          <Link to="/" className="text-xl font-bold tracking-tighter">
            UTONGA<span className="text-utonga-accent">.</span> STAFF
          </Link>
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Logged in as {user?.username}</span>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname === item.path ? 'bg-utonga-green text-white shadow-lg shadow-utonga-green/20' : 'text-gray-500 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-bold text-sm">{item.name}</span>
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
      <main className="flex-1 ml-64 p-10 overflow-y-auto min-h-screen">
        <Routes>
          <Route path="/" element={
            <div className="space-y-12">
              <header className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-black">Control Center</h1>
                  <p className="text-gray-500 mt-2 font-medium">Real-time status of Utonga Conservation efforts.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs bg-gray-800 px-4 py-2 rounded-full font-bold text-gray-400">Environment: Production</span>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CircleDollarSign size={80} />
                  </div>
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4">Total Raised (USD)</p>
                  <p className="text-5xl font-black text-utonga-accent">${stats?.total_raised?.toLocaleString() || '0'}</p>
                  <div className="mt-4 flex items-center text-utonga-green text-xs font-bold">
                    <span>Live from blockchain + bank</span>
                  </div>
                </div>

                <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CalendarDays size={80} />
                  </div>
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4">Pending Bookings</p>
                  <p className="text-5xl font-black">{stats?.pending_bookings || '0'}</p>
                  <Link to="/staff/dashboard/bookings" className="mt-4 block text-xs font-bold hover:underline text-utonga-accent">View Calendar →</Link>
                </div>

                <div className="bg-gray-900 p-8 rounded-[2rem] border border-gray-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Users size={80} />
                  </div>
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4">Pipeline Leads</p>
                  <p className="text-5xl font-black">{stats?.new_leads || '0'}</p>
                  <p className="mt-4 text-xs font-bold text-gray-500">Contact new partners</p>
                </div>
              </div>

              <div className="bg-gray-900 rounded-[2.5rem] border border-gray-800 p-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black">Transaction Activity</h3>
                  <button className="text-xs font-bold text-gray-500 hover:text-white border border-gray-800 px-6 py-2 rounded-full">Export CSV</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-widest font-black">
                        <th className="pb-6">Donor Identity</th>
                        <th className="pb-6">Amount</th>
                        <th className="pb-6">Gateway</th>
                        <th className="pb-6">Verification</th>
                        <th className="pb-6 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      <tr className="text-sm">
                        <td className="py-8 text-gray-500 italic" colSpan="5">
                          <div className="flex flex-col items-center justify-center py-12">
                            <CircleDollarSign size={40} className="text-gray-800 mb-4" />
                            <p>No transactions detected in current session.</p>
                          </div>
                        </td>
                      </tr>
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
