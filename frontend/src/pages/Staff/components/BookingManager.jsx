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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Booking Requests</h1>
        <p className="text-gray-500 mt-1 font-medium">Manage visitor stays, tours, and camping permits.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading bookings...</div>
        ) : bookings.length > 0 ? bookings.map((b) => (
          <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group hover:border-utonga-green transition-all">
            <div className="flex gap-6">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-utonga-accent border border-gray-800">
                <Calendar size={28} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{b.contact_name}</h3>
                  <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                    b.status === 'confirmed' ? 'bg-utonga-green text-white' :
                    b.status === 'declined' ? 'bg-red-500/20 text-red-500' : 'bg-utonga-accent/20 text-utonga-accent'
                  }`}>
                    {b.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 font-medium">
                  <span className="flex items-center"><User size={14} className="mr-2" /> {b.party_size} guests</span>
                  <span className="flex items-center"><Clock size={14} className="mr-2" /> {new Date(b.date).toLocaleDateString()}</span>
                  <span className="flex items-center"><Phone size={14} className="mr-2" /> {b.contact_phone}</span>
                </div>
                <div className="mt-4">
                  <span className="bg-gray-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest">
                    {b.visit_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {b.status === 'pending' && (
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => updateStatus(b.id, 'confirmed')}
                  className="flex-1 md:flex-none flex items-center justify-center bg-utonga-green hover:bg-opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                  <Check size={18} className="mr-2" /> Confirm
                </button>
                <button
                  onClick={() => updateStatus(b.id, 'declined')}
                  className="flex-1 md:flex-none flex items-center justify-center bg-black border border-gray-800 hover:bg-red-500/10 hover:text-red-500 px-6 py-3 rounded-xl font-bold transition-all"
                >
                  <X size={18} className="mr-2" /> Decline
                </button>
              </div>
            )}
          </div>
        )) : (
          <div className="bg-gray-900 border border-gray-800 border-dashed rounded-[2.5rem] py-20 text-center">
            <Calendar size={48} className="mx-auto text-gray-800 mb-4" />
            <p className="text-gray-500 font-bold">No active booking requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManager;
