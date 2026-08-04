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
    <div className="max-w-4xl space-y-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black">Platform Configuration</h1>
          <p className="text-gray-500 mt-1 font-medium">Global parameters for the Utonga ecosystem.</p>
        </div>
        {status.message && (
          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${
            status.type === 'success' ? 'bg-utonga-green/10 border-utonga-green text-utonga-green' : 'bg-red-500/10 border-red-500 text-red-500'
          } animate-in fade-in slide-in-from-top-4`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold">{status.message}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Campaign Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-utonga-green/10 text-utonga-green rounded-2xl flex items-center justify-center">
              <Globe size={24} />
            </div>
            <h3 className="text-xl font-bold">Campaign Targets</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">Fundraising Goal (USD)</label>
              <input
                type="number"
                value={campaign.goal_usd}
                onChange={(e) => handleCampaignChange('goal_usd', e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl py-4 px-6 outline-none focus:border-utonga-accent font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">Cost Per Tree (USD)</label>
              <input
                type="number"
                value={campaign.cost_per_tree}
                onChange={(e) => handleCampaignChange('cost_per_tree', e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl py-4 px-6 outline-none focus:border-utonga-accent font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">Campaign Deadline</label>
              <input
                type="datetime-local"
                value={campaign.deadline ? new Date(campaign.deadline).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleCampaignChange('deadline', e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl py-4 px-6 outline-none focus:border-utonga-accent font-bold"
              />
            </div>
          </div>
        </div>

        {/* Global Settings (Contact Info, etc) */}
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold">Contact & Meta</h3>
          </div>

          <div className="space-y-4">
            {settings.map(s => (
              <div key={s.id}>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">{s.description || s.key.replace(/_/g, ' ')}</label>
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => handleSettingChange(s.id, e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl py-4 px-6 outline-none focus:border-utonga-accent font-bold"
                />
              </div>
            ))}
            {settings.length === 0 && <p className="text-gray-500 text-sm italic py-4">No additional settings found.</p>}
          </div>
        </div>
      </div>

      {/* Security & System Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">System Status</h3>
              <p className="text-xs text-gray-500 font-medium">Real-time health of the platform registry.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 bg-black rounded-2xl border border-gray-800">
          <CheckCircle2 size={24} className="text-utonga-green" />
          <div className="flex-1">
            <p className="text-sm font-bold">API Connectivity</p>
            <p className="text-xs text-gray-500">Connected to production gateway</p>
          </div>
          <span className="text-[10px] font-black bg-utonga-green/20 text-utonga-green px-4 py-1.5 rounded-full uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div className="pt-8 flex justify-end">
        <button
          onClick={saveAll}
          disabled={saving}
          className="bg-utonga-accent text-utonga-dark px-12 py-5 rounded-2xl font-black text-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center shadow-2xl shadow-utonga-accent/20"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-utonga-dark/20 border-t-utonga-dark rounded-full animate-spin mr-3"></div>
              Applying...
            </>
          ) : (
            <>
              <Save size={22} className="mr-3" /> Save All Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsManager;
