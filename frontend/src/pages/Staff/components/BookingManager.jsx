import { useState, useEffect } from 'react';
import api from '../../../api';
import { Calendar, User, Phone, Check, X, Clock } from 'lucide-react';

const BookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/api/admin/bookings/');
        setBookings(res.data);
      } catch (err) {
        console.error('Booking sync error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
    // Real-time sync every 45 seconds for bookings (less frequent than money)
    const interval = setInterval(fetchBookings, 45000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/admin/bookings/${id}/`, { status });
      // Immediate manual trigger for sync after action
      const res = await api.get('/api/admin/bookings/');
      setBookings(res.data);
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black">Booking Requests</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium uppercase tracking-wider">Visitor stays, tours, and camping permits.</p>
        </div>
        <span className="text-[10px] bg-gray-900 border border-gray-800 px-3 py-1 rounded-full font-bold text-gray-500 uppercase tracking-widest">{bookings.length} Total</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-20 text-gray-500 italic uppercase tracking-widest text-[10px] font-black">Syncing reservations...</div>
        ) : bookings.length > 0 ? bookings.map((b) => (
          <div key={b.id} className="bg-gray-900 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:bg-gray-800/50 transition-all shadow-lg">
            <div className="flex gap-5">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-utonga-accent border border-gray-800 group-hover:border-utonga-accent/30 transition-colors shrink-0">
                <Calendar size={22} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-lg font-bold">{b.contact_name}</h3>
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-[0.1em] ${
                    b.status === 'confirmed' ? 'bg-utonga-green text-white' :
                    b.status === 'declined' ? 'bg-red-500/10 text-red-500' : 'bg-utonga-accent/10 text-utonga-accent'
                  }`}>
                    {b.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-bold uppercase tracking-tight">
                  <span className="flex items-center"><User size={12} className="mr-1.5 text-gray-600" /> {b.party_size} Guests</span>
                  <span className="flex items-center"><Clock size={12} className="mr-1.5 text-gray-600" /> {new Date(b.date).toLocaleDateString()}</span>
                  <span className="flex items-center text-gray-400 font-mono tracking-tighter"><Phone size={12} className="mr-1.5 text-gray-600" /> {b.contact_phone}</span>
                </div>
                <div className="mt-3">
                  <span className="bg-black border border-gray-800 text-gray-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    {b.visit_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {b.status === 'pending' && (
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => updateStatus(b.id, 'confirmed')}
                  className="flex-1 md:flex-none flex items-center justify-center bg-utonga-green hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                >
                  <Check size={14} className="mr-2" /> Confirm
                </button>
                <button
                  onClick={() => updateStatus(b.id, 'declined')}
                  className="flex-1 md:flex-none flex items-center justify-center bg-black border border-gray-800 hover:bg-red-500/10 hover:text-red-500 px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                >
                  <X size={14} className="mr-2" /> Decline
                </button>
              </div>
            )}
          </div>
        )) : (
          <div className="bg-gray-900 border border-gray-800 border-dashed rounded-3xl py-16 text-center">
            <Calendar size={32} className="mx-auto text-gray-800 mb-4" />
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No reservation requests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManager;
