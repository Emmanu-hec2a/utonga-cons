import { useState } from 'react';
import api from '../../../api';
import { X, Map, CheckCircle2, AlertCircle } from 'lucide-react';

const RoadmapModal = ({ onClose, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [category, setCategory] = useState('trails_garden');
  const [phase, setPhase] = useState(1);
  const [targetDate, setTargetDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.post('/api/admin/roadmap/', {
        title,
        description,
        status,
        category,
        phase,
        target_date: targetDate || null,
        order: 0
      });
      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error('Milestone creation error:', err);
      setError('Failed to create milestone. Ensure you have admin permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-8 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-utonga-green/20 text-utonga-green rounded-xl flex items-center justify-center">
              <Map size={20} />
            </div>
            <h2 className="text-2xl font-black italic">Strategic Milestone</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">Milestone Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wildlife Observation Deck"
                className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 outline-none focus:border-utonga-green text-sm font-bold"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">Detail & Impact</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the purpose and expected impact of this milestone..."
                className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 outline-none focus:border-utonga-green text-sm font-medium h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">Phase</label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(Number(e.target.value))}
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 outline-none focus:border-utonga-green text-sm font-bold appearance-none"
                >
                  <option value={1}>Phase 1 (Foundations)</option>
                  <option value={2}>Phase 2 (Scaling)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 outline-none focus:border-utonga-green text-sm font-bold appearance-none"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 outline-none focus:border-utonga-green text-sm font-bold appearance-none"
                >
                  <option value="trails_garden">Trails & Garden</option>
                  <option value="camping_experiences">Camping & Exp.</option>
                  <option value="visibility_bookings">Visibility & Book.</option>
                  <option value="infrastructure">Infrastructure</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2 ml-2">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 outline-none focus:border-utonga-green text-sm font-bold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-utonga-green text-white py-5 rounded-[1.5rem] font-black text-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-utonga-green/20 flex items-center justify-center gap-3"
          >
            {saving ? 'Synchronizing Strategy...' : (
              <><CheckCircle2 size={20} /> Establish Milestone</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoadmapModal;
