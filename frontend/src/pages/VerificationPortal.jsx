import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Trees, Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api';

const VerificationPortal = () => {
  const { donationId } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await api.get(`/api/donations/${donationId}/status/`);
        if (res.data.status === 'completed') {
          setDonation(res.data);
        } else {
          setError('This donation record is pending or incomplete.');
        }
      } catch (err) {
        setError('Official record not found. Please verify the Sanctuary ID.');
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [donationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-utonga-accent mb-4" size={48} />
        <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-black animate-pulse">Consulting Sanctuary Ledger...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="text-red-500 opacity-50" size={40} />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Verification Failed</h1>
        <p className="text-gray-500 max-w-sm mb-8">{error}</p>
        <Link to="/" className="text-utonga-accent font-bold hover:underline flex items-center gap-2">
          Return to Sanctuary <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Verification Badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 bg-utonga-accent/10 border border-utonga-accent/30 px-6 py-3 rounded-full shadow-[0_0_30px_rgba(255,215,0,0.1)]">
            <ShieldCheck className="text-utonga-accent" size={24} />
            <span className="text-utonga-accent font-black uppercase tracking-[0.2em] text-xs">Official Utonga Record</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-utonga-accent/5 blur-[100px] -z-10 rounded-full" />

          <div className="space-y-12">
            <header className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Sanctuary <span className="text-utonga-accent italic">Steward.</span>
              </h2>
              <p className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Record ID: UTG-{donation.id}-{new Date(donation.created_at).getTime()}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Donor Info */}
              <div className="bg-white/[0.03] border border-white/[0.05] p-6 rounded-3xl group hover:border-utonga-accent/30 transition-all">
                <div className="flex items-center gap-4 mb-4 text-gray-500">
                  <User size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Authenticated Donor</span>
                </div>
                <p className="text-2xl font-bold text-white">{donation.donor_name}</p>
              </div>

              {/* Impact Info */}
              <div className="bg-white/[0.03] border border-white/[0.05] p-6 rounded-3xl group hover:border-utonga-accent/30 transition-all">
                <div className="flex items-center gap-4 mb-4 text-gray-500">
                  <Trees size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Conservation Impact</span>
                </div>
                <p className="text-2xl font-bold text-white">{donation.amount} Indigenous Trees</p>
              </div>

              {/* Date Info */}
              <div className="bg-white/[0.03] border border-white/[0.05] p-6 rounded-3xl group hover:border-utonga-accent/30 transition-all">
                <div className="flex items-center gap-4 mb-4 text-gray-500">
                  <Calendar size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Entry Date</span>
                </div>
                <p className="text-2xl font-bold text-white">{new Date(donation.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>

              {/* Status Info */}
              <div className="bg-white/[0.03] border border-white/[0.05] p-6 rounded-3xl">
                <div className="flex items-center gap-4 mb-4 text-gray-500">
                  <ShieldCheck size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Record Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-2xl font-bold text-green-500 uppercase tracking-tighter">Verified</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <p className="text-gray-400 text-center leading-relaxed">
                This donor is an official custodian of the Utonga Sanctuary. Their contribution has been directly applied to reforestation and biodiversity protection in Bondo, Kenya.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/explore" className="text-utonga-accent font-black uppercase tracking-widest text-xs hover:underline flex items-center justify-center gap-3 group">
            See the impact in the hub <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationPortal;
