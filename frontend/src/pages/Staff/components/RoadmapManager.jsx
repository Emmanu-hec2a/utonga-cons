import { useState, useEffect } from 'react';
import api from '../../../api';
import { Plus, GripVertical, CheckCircle2, Clock, Circle, Edit2 } from 'lucide-react';
import RoadmapModal from './RoadmapModal';
import { RoadmapSkeleton } from './Skeleton';

const RoadmapManager = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

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
    // Poll every 3 minutes for roadmap updates
    const interval = setInterval(fetchMilestones, 180000);
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

  const handleEdit = (milestone) => {
    setEditingMilestone(milestone);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMilestone(null);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black">Restoration Roadmap</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium uppercase tracking-wider">Strategic milestones and ecosystem progress.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-utonga-green text-white px-5 py-2.5 rounded-lg font-black hover:bg-opacity-90 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-utonga-green/20 cursor-pointer"
        >
          <Plus size={14} className="mr-2" /> New Waypoint
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <>
            <RoadmapSkeleton />
            <RoadmapSkeleton />
            <RoadmapSkeleton />
            <RoadmapSkeleton />
            <RoadmapSkeleton />
          </>
        ) : milestones.length > 0 ? milestones.map((m) => (
          <div key={m.id} className="bg-gray-900 rounded-xl p-4 flex items-center gap-5 group hover:bg-gray-800/50 transition-all cursor-default shadow-lg">
            <div className="text-gray-800 cursor-grab group-hover:text-gray-600 transition-colors shrink-0">
              <GripVertical size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 shrink-0">P{m.phase}</span>
                <h4 className="text-md font-bold text-gray-200">{m.title}</h4>
              </div>
              <p className="text-[10px] text-gray-600 mt-1 font-black uppercase tracking-tighter">Target: {m.target_date || 'Future Phase'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleEdit(m)}
                className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer"
                title="Edit Milestone"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => toggleStatus(m.id, m.status)}
                className={`flex items-center px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all border shrink-0 cursor-pointer ${
                  m.status === 'done' ? 'border-utonga-green/30 bg-utonga-green/5 text-utonga-green' :
                  m.status === 'in_progress' ? 'border-utonga-accent/30 bg-utonga-accent/5 text-utonga-accent' :
                  'border-gray-800 bg-black text-gray-600'
                }`}
              >
                {m.status === 'done' ? <CheckCircle2 size={12} className="mr-2" /> :
                 m.status === 'in_progress' ? <Clock size={12} className="mr-2" /> :
                 <Circle size={12} className="mr-2" />}
                {m.status.replace('_', ' ')}
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800 border-dashed">
            <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">No milestones defined.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <RoadmapModal
          onClose={handleCloseModal}
          onUploadSuccess={fetchMilestones}
          milestone={editingMilestone}
        />
      )}
    </div>
  );
};

export default RoadmapManager;
