import { useState, useEffect } from 'react';
import api from '../../../api';
import { Plus, GripVertical, CheckCircle2, Clock, Circle } from 'lucide-react';
import RoadmapModal from './RoadmapModal';

const RoadmapManager = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMilestones = async () => {
    try {
      const res = await api.get('/api/admin/roadmap/');
      setMilestones(res.data);
    } catch (err) {
      console.error('Roadmap sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
    // Poll every 60 seconds for roadmap updates
    const interval = setInterval(fetchMilestones, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const statuses = ['upcoming', 'in_progress', 'done'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    try {
      await api.patch(`/api/admin/roadmap/${id}/`, { status: nextStatus });
      fetchMilestones();
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">Restoration Roadmap</h1>
          <p className="text-gray-500 mt-1 font-medium">Define and track the organization's strategic milestones.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-utonga-green text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all text-sm cursor-pointer"
        >
          <Plus size={18} className="mr-2" /> New Milestone
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading roadmap...</div>
        ) : milestones.length > 0 ? milestones.map((m) => (
          <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-6 group hover:border-utonga-accent transition-all cursor-default">
            <div className="text-gray-700 cursor-grab group-hover:text-gray-500 transition-colors">
              <GripVertical size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Phase {m.phase}</span>
                <h4 className="text-lg font-bold">{m.title}</h4>
              </div>
              <p className="text-sm text-gray-500 mt-1 font-medium">Target Date: {m.target_date || 'Unscheduled'}</p>
            </div>
            <button
              onClick={() => toggleStatus(m.id, m.status)}
              className={`flex items-center px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 cursor-pointer ${
                m.status === 'done' ? 'border-utonga-green bg-utonga-green/10 text-utonga-green' :
                m.status === 'in_progress' ? 'border-utonga-accent bg-utonga-accent/10 text-utonga-accent' :
                'border-gray-800 bg-black text-gray-500'
              }`}
            >
              {m.status === 'done' ? <CheckCircle2 size={16} className="mr-2" /> :
               m.status === 'in_progress' ? <Clock size={16} className="mr-2" /> :
               <Circle size={16} className="mr-2" />}
              {m.status.replace('_', ' ')}
            </button>
          </div>
        )) : (
          <div className="text-center py-20 bg-gray-900 rounded-[2rem] border border-gray-800 border-dashed">
            <p className="text-gray-500 font-bold italic text-sm">No roadmap milestones established.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <RoadmapModal
          onClose={() => setIsModalOpen(false)}
          onUploadSuccess={fetchMilestones}
        />
      )}
    </div>
  );
};

export default RoadmapManager;
