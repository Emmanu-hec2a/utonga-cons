import { useState, useEffect } from 'react';
import api from '../../../api';
import { Mail, Briefcase, Phone, MessageSquare, Users } from 'lucide-react';

const LeadList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await api.get('/api/admin/leads/');
        setLeads(res.data);
      } catch (err) {
        console.error('Lead sync error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
    // Poll every 60 seconds for new partner inquiries
    const interval = setInterval(fetchLeads, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black">Partner Pipeline</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium uppercase tracking-wider">Strategic inquiries from the global community.</p>
        </div>
        <span className="text-[10px] bg-gray-900 border border-gray-800 px-3 py-1 rounded-full font-bold text-gray-500 uppercase tracking-widest">{leads.length} Leads</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-20 text-gray-500 italic uppercase tracking-widest text-[10px] font-black">Accessing pipeline data...</div>
        ) : leads.length > 0 ? leads.map((l) => (
          <div key={l.id} className="bg-gray-900 rounded-2xl p-5 space-y-4 hover:bg-gray-800/50 transition-all group shadow-lg">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-blue-500 border border-gray-800 group-hover:border-blue-500/30 transition-colors">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-tight">{l.contact_name}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{l.org_name || 'Individual Prospect'}</p>
                </div>
              </div>
              <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-[0.1em] ${
                l.status === 'closed' ? 'bg-gray-800 text-gray-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                {l.status}
              </span>
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-gray-800/50 italic text-gray-400 text-xs leading-relaxed border-l-2 border-l-blue-500/30">
              "{l.message}"
            </div>

            <div className="flex gap-2">
              <a href={`mailto:${l.contact_email}`} className="flex-1 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all">
                <Mail size={14} className="mr-2" /> Send Email
              </a>
              <button className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer">
                <MessageSquare size={14} className="mr-2" /> Log Note
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-16 bg-gray-900 border border-gray-800 border-dashed rounded-3xl text-center">
            <Users size={40} className="mx-auto text-gray-800 mb-4" />
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No active partner inquiries.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadList;
