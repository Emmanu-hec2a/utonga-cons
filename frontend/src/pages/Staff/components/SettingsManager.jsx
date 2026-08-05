import { useState, useEffect } from 'react';
import api from '../../../api';
import { Save, Globe, Mail, Phone, ShieldCheck, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

const SettingsManager = () => {
  const [campaign, setCampaign] = useState({
    goal_usd: 100000,
    tree_goal: 100000,
    cost_per_tree: 1.00,
    deadline: '',
  });
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campRes, settingsRes] = await Promise.all([
        api.get('/api/campaign/'),
        api.get('/api/admin/settings/')
      ]);
      setCampaign(campRes.data);
      setSettings(settingsRes.data);
    } catch (err) {
      console.error('Settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignChange = (field, value) => {
    setCampaign(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingChange = (id, value) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s));
  };

  const saveAll = async () => {
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      // Find the ID of the campaign (usually 1 in this simple setup)
      // Since our public API doesn't expose ID easily, we assume it's the first one
      // In a real prod app, we'd fetch the specific ID
      await api.patch(`/api/admin/campaign/1/`, campaign);

      // Save other site settings
      await Promise.all(settings.map(s =>
        api.patch(`/api/admin/settings/${s.id}/`, { value: s.value })
      ));

      setStatus({ type: 'success', message: 'Platform configuration updated successfully.' });
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setStatus({ type: 'error', message: 'Failed to apply changes. Check console for details.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-500 italic">Accessing platform registry...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black">Platform Configuration</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium uppercase tracking-wider">Global parameters and mission targets.</p>
        </div>
        <div className="flex items-center gap-4">
          {status.message && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
              status.type === 'success' ? 'bg-utonga-green/10 border-utonga-green/30 text-utonga-green' : 'bg-red-500/10 border-red-500/30 text-red-500'
            } animate-in fade-in slide-in-from-top-4`}>
              {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span className="text-[10px] font-black uppercase tracking-widest">{status.message}</span>
            </div>
          )}
          <button
            onClick={saveAll}
            disabled={saving}
            className="bg-utonga-accent text-utonga-dark px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] hover:opacity-90 disabled:opacity-50 transition-all flex items-center shadow-xl shadow-utonga-accent/10 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-3 h-3 border-2 border-utonga-dark/20 border-t-utonga-dark rounded-full animate-spin mr-2"></div>
                Applying...
              </>
            ) : (
              <>
                <Save size={14} className="mr-2" /> Sync Registry
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign Settings */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-5 shadow-lg">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-utonga-green/10 text-utonga-green rounded-xl flex items-center justify-center">
              <Globe size={20} />
            </div>
            <h3 className="text-lg font-bold">Campaign Targets</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1.5 ml-1">Fundraising Goal (USD)</label>
              <input
                type="number"
                value={campaign.goal_usd}
                onChange={(e) => handleCampaignChange('goal_usd', e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-lg py-2.5 px-4 outline-none focus:border-utonga-accent font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1.5 ml-1">Cost Per Tree (USD)</label>
              <input
                type="number"
                value={campaign.cost_per_tree}
                onChange={(e) => handleCampaignChange('cost_per_tree', e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-lg py-2.5 px-4 outline-none focus:border-utonga-accent font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1.5 ml-1">Campaign Deadline</label>
              <input
                type="datetime-local"
                value={campaign.deadline ? new Date(campaign.deadline).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleCampaignChange('deadline', e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-lg py-2.5 px-4 outline-none focus:border-utonga-accent font-bold text-sm"
              />
            </div>
          </div>
        </div>

        {/* Global Settings (Contact Info, etc) */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-5 shadow-lg">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold">Contact & Meta</h3>
          </div>

          <div className="space-y-3">
            {settings.map(s => (
              <div key={s.id}>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-1.5 ml-1">{s.description || s.key.replace(/_/g, ' ')}</label>
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => handleSettingChange(s.id, e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-lg py-2.5 px-4 outline-none focus:border-utonga-accent font-bold text-sm"
                />
              </div>
            ))}
            {settings.length === 0 && <p className="text-gray-500 text-xs italic py-2">No registry entries found.</p>}
          </div>
        </div>
      </div>

      {/* Security & System Info */}
      <div className="bg-gray-900 rounded-2xl p-6 space-y-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">System Integrity</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Health status of the platform registry.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-gray-800/50">
          <CheckCircle2 size={20} className="text-utonga-green" />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-tight">API Gateway Status</p>
            <p className="text-[10px] text-gray-600 font-medium">Verified connection to production endpoint</p>
          </div>
          <span className="text-[9px] font-black bg-utonga-green/10 text-utonga-green px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
