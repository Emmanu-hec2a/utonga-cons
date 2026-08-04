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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Partner Pipeline</h1>
        <p className="text-gray-500 mt-1 font-medium">Inquiries from tour operators, investors, and the diaspora community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-gray-500">Accessing leads...</div>
        ) : leads.length > 0 ? leads.map((l) => (
          <div key={l.id} className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 space-y-6 hover:border-blue-500 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-blue-500 border border-gray-800">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{l.contact_name}</h3>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{l.org_name || 'Individual'}</p>
                </div>
              </div>
              <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest ${
                l.status === 'closed' ? 'bg-gray-800 text-gray-400' : 'bg-blue-500/20 text-blue-500'
              }`}>
                {l.status}
              </span>
            </div>

            <div className="p-6 bg-black rounded-2xl border border-gray-800 italic text-gray-400 text-sm leading-relaxed">
              "{l.message}"
            </div>

            <div className="flex gap-3">
              <a href={`mailto:${l.contact_email}`} className="flex-1 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all">
                <Mail size={16} className="mr-2" /> Email
              </a>
              <button className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all">
                <MessageSquare size={16} className="mr-2" /> Notes
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-24 bg-gray-900 border border-gray-800 border-dashed rounded-[3.5rem] text-center">
            <Users size={64} className="mx-auto text-gray-800 mb-6" />
            <p className="text-gray-500 font-bold">No partner inquiries in the pipeline yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadList;
