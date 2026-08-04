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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">Donation Ledger</h1>
          <p className="text-gray-500 mt-1 font-medium">Reconcile payments and track fundraising progress.</p>
        </div>
        <button className="flex items-center bg-gray-900 border border-gray-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all text-sm">
          <Download size={18} className="mr-2" /> Export CSV
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-4 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by donor name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-gray-800 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-utonga-accent"
          />
        </div>
        <button className="px-6 py-3 bg-black border border-gray-800 rounded-2xl font-bold text-gray-400 flex items-center hover:text-white">
          <Filter size={18} className="mr-2" /> Filter
        </button>
      </div>

      <div className="bg-gray-900 rounded-[2rem] border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/50 border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-widest font-black">
              <th className="px-8 py-6">Donor</th>
              <th className="px-8 py-6">Amount</th>
              <th className="px-8 py-6">Method</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan="5" className="px-8 py-12 text-center text-gray-500">Loading donations...</td></tr>
            ) : filteredDonations.length > 0 ? filteredDonations.map((d) => (
              <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-6">
                  <div className="font-bold">{d.donor_name}</div>
                  <div className="text-xs text-gray-500">{d.donor_email}</div>
                </td>
                <td className="px-8 py-6 font-mono font-bold text-white">
                  ${Number(d.amount).toFixed(2)}
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400 uppercase font-black">
                    {d.method}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(d.status)}
                    <span className="text-sm font-bold capitalize">{d.status}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right text-sm text-gray-500 font-medium">
                  {new Date(d.created_at).toLocaleDateString()}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="px-8 py-12 text-center text-gray-500 italic">No donations found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonationList;
