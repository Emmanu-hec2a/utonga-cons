import { useState, useEffect } from 'react';
import api from '../../../api';
import { Search, Filter, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const DonationList = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await api.get('/api/admin/donations/');
        setDonations(res.data);
      } catch (err) {
        console.error('Donation sync error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
    // Real-time sync every 20 seconds for the ledger
    const interval = setInterval(fetchDonations, 20000);
    return () => clearInterval(interval);
  }, []);

  const filteredDonations = donations.filter(d =>
    d.donor_name.toLowerCase().includes(search.toLowerCase()) ||
    d.donor_email.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="text-utonga-green" size={16} />;
      case 'failed': return <XCircle className="text-red-500" size={16} />;
      default: return <AlertCircle className="text-utonga-accent" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black">Donation Ledger</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium uppercase tracking-wider">Reconcile payments and fund tracking.</p>
        </div>
        <button className="flex items-center bg-gray-900 border border-gray-800 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all cursor-pointer">
          <Download size={14} className="mr-2" /> Export CSV
        </button>
      </div>

      <div className="bg-gray-900 rounded-2xl p-2.5 flex gap-3 shadow-lg max-w-xl">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
          <input
            type="text"
            placeholder="Search donors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border-none rounded-xl py-2 pl-11 pr-4 outline-none focus:ring-1 focus:ring-utonga-accent/50 text-xs font-medium placeholder:text-gray-700 transition-all"
          />
        </div>
        <button className="px-4 py-2 bg-black/50 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500 flex items-center hover:text-white transition-colors cursor-pointer">
          <Filter size={14} className="mr-2" /> Filter
        </button>
      </div>

      <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/50 border-b border-gray-800 text-gray-500 text-[9px] uppercase tracking-widest font-black">
              <th className="px-6 py-4">Donor</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-600 uppercase tracking-widest text-[10px] font-black">Syncing ledger...</td></tr>
            ) : filteredDonations.length > 0 ? filteredDonations.map((d) => (
              <tr key={d.id} className="hover:bg-white/[0.01] transition-colors text-xs">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-200">{d.donor_name}</div>
                  <div className="text-[10px] text-gray-600 font-medium">{d.donor_email}</div>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-utonga-accent">
                  ${Number(d.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-[9px] bg-black border border-gray-800 px-2 py-0.5 rounded text-gray-500 uppercase font-black">
                    {d.method}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(d.status)}
                    <span className="text-[10px] font-bold uppercase tracking-tight">{d.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-gray-500 font-bold font-mono">
                  {new Date(d.created_at).toLocaleDateString()}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-600 italic text-xs">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonationList;
