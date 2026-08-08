import { useState, useEffect } from 'react';
import api from '../../../api';
import { Calendar, User, Phone, Check, X, Clock, Globe2, MessageSquare, PhoneCall } from 'lucide-react';
import CallDialer from './CallDialer';
import { detectCountry } from '../../../utils/countryUtils';
import { BookingSkeleton } from './Skeleton';

const BookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState(null);

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
    const interval = setInterval(fetchBookings, 90000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/admin/bookings/${id}/`, { status });
      const res = await api.get('/api/admin/bookings/');
      setBookings(res.data);
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-2xl font-black text-white">Booking Manifest</h1>
          <p className="text-gray-500 text-[10px] mt-1 font-bold uppercase tracking-[0.2em]">Real-time visitor processing terminal</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-1.5 rounded-full font-bold text-gray-500 uppercase tracking-widest text-[9px] shadow-lg">
          <Globe2 size={12} className="text-utonga-accent" />
          {bookings.length} Records
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <BookingSkeleton key={i} />
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((b) => (
            <div key={b.id} className="group bg-gray-900 rounded-[2.5rem] p-6 border border-gray-800 hover:border-utonga-accent/30 transition-all duration-500 shadow-xl flex flex-col relative overflow-hidden">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-black border border-gray-800 flex items-center justify-center text-utonga-accent shadow-inner">
                      <Calendar size={16} />
                    </span>
                    <h3 className="text-base font-black text-white group-hover:text-utonga-accent transition-colors truncate max-w-[140px]">{b.contact_name}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] bg-utonga-accent/10 border border-utonga-accent/30 px-2 py-0.5 rounded-md font-bold text-utonga-accent tracking-widest">
                      {detectCountry(b.contact_phone)}
                    </span>
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest ${
                      b.status === 'confirmed' ? 'bg-utonga-green text-white shadow-[0_0_10px_rgba(135,166,110,0.2)]' :
                      b.status === 'declined' ? 'bg-red-500/10 text-red-500' : 'bg-utonga-accent/10 text-utonga-accent'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </div>

                {/* Visit Type Badge */}
                <div className={`p-1.5 rounded-xl border ${
                  b.visit_type === 'camp' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                  b.visit_type === 'tour' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                  'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                }`} title={b.visit_type}>
                  <Globe2 size={14} />
                </div>
              </div>

              {/* Card Content - Data Cluster */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 rounded-2xl p-3 border border-gray-800/50 flex flex-col items-center">
                    <User size={14} className="text-gray-600 mb-1" />
                    <span className="text-sm font-black text-white">{b.party_size}</span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Guests</span>
                  </div>
                  <div className="bg-black/40 rounded-2xl p-3 border border-gray-800/50 flex flex-col items-center">
                    <Clock size={14} className="text-gray-600 mb-1" />
                    <span className="text-sm font-black text-white">{new Date(b.date).toLocaleDateString(undefined, { month: 'short', day: '2-digit' })}</span>
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Arrival</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-black/40 rounded-2xl p-3 border border-gray-800/50">
                  <span className="text-[10px] font-mono text-gray-500 tracking-tighter">{b.contact_phone}</span>
                  <button
                    onClick={() => setActiveCall({ to: b.contact_phone, name: b.contact_name, id: b.id })}
                    className="p-2 bg-utonga-accent/10 hover:bg-utonga-accent text-utonga-accent hover:text-utonga-dark rounded-xl transition-all cursor-pointer shadow-lg shadow-utonga-accent/5 group/call"
                  >
                    <PhoneCall size={14} className="group-hover/call:animate-bounce" />
                  </button>
                </div>
              </div>

              {/* Card Footer - Actions */}
              {b.status === 'pending' && (
                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => updateStatus(b.id, 'confirmed')}
                    className="flex-1 flex items-center justify-center bg-utonga-green hover:bg-opacity-90 text-white py-3 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-utonga-green/10"
                  >
                    <Check size={14} className="mr-2" /> Confirm
                  </button>
                  <button
                    onClick={() => updateStatus(b.id, 'declined')}
                    className="flex-1 flex items-center justify-center bg-black border border-gray-800 hover:bg-red-500/10 hover:text-red-500 py-3 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <X size={14} className="mr-2" /> Decline
                  </button>
                </div>
              )}

              {/* Note Indicator (Subtle) */}
              {b.internal_notes && (
                <div className="mt-4 flex items-start gap-2 text-[10px] text-gray-600 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.05]">
                  <MessageSquare size={12} className="shrink-0 mt-0.5" />
                  <p className="italic line-clamp-2">{b.internal_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-[3rem] py-32 text-center">
          <Globe2 size={40} className="mx-auto text-gray-800 mb-6 opacity-50" />
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">No Live Manifest Entries</p>
        </div>
      )}

      {activeCall && (
        <CallDialer
          to={activeCall.to}
          name={activeCall.name}
          relatedType="booking"
          relatedId={activeCall.id}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
};

export default BookingManager;
