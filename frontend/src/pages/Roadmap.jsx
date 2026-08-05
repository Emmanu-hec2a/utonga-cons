import { useState, useEffect } from 'react';
import api from '../api';
import { CheckCircle2, Clock, Circle, ArrowRight, TreeDeciduous, Tent, Globe, X, Map as MapIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Roadmap = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await api.get('/api/roadmap/');
        setMilestones(res.data);
      } catch (err) {
        console.error('Roadmap fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'done': return 'utonga-green';
      case 'in_progress': return 'utonga-accent';
      default: return 'gray-600';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'trails_garden': return <TreeDeciduous size={20} />;
      case 'camping_experiences': return <Tent size={20} />;
      default: return <Globe size={20} />;
    }
  };

  const MilestoneCard = ({ m, index }) => {
    const isEven = index % 2 === 0;
    const statusColor = getStatusColor(m.status);

    return (
      <div className={`relative flex flex-col md:flex-row items-center w-full mb-8 md:mb-12 ${isEven ? 'md:flex-row-reverse' : ''}`}>
        {/* Connection Line to Center Trail (Desktop) */}
        <div className={`hidden md:block absolute top-1/2 w-1/2 h-px bg-white/10 ${isEven ? 'right-1/2' : 'left-1/2'}`}></div>

        {/* Content Card */}
        <div className="w-full md:w-[47%] z-10">
          <div
            onClick={() => setSelectedMilestone(m)}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedMilestone(m)}
            className={`group bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6 hover:border-${statusColor}/50 focus:outline-none focus:ring-2 focus:ring-${statusColor}/50 transition-all duration-500 cursor-pointer shadow-2xl`}
            role="button"
            tabIndex="0"
            aria-label={`View strategic details for ${m.title}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-${statusColor}/10 text-${statusColor} flex items-center justify-center border border-${statusColor}/20`}>
                {getCategoryIcon(m.category)}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-${statusColor}/20 text-${statusColor} bg-${statusColor}/5`}>
                {m.status.replace('_', ' ')}
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-utonga-accent transition-colors">{m.title}</h3>
            <p className="text-gray-400 text-sm line-clamp-2 mb-4 font-medium leading-relaxed">
              {m.description || "Strategic restoration waypoint focusing on indigenous biodiversity and sanctuary infrastructure."}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Target: {m.target_date || 'Phase 1'}
              </span>
              <div className="flex items-center text-utonga-accent text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Details <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Trail Node (Center Dot) */}
        <div className={`absolute left-6 md:left-1/2 w-4 h-4 rounded-full border-4 border-black bg-${statusColor} -translate-x-1/2 z-20 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
          {m.status === 'in_progress' && (
            <div className={`absolute inset-0 rounded-full bg-${statusColor} animate-ping opacity-40`}></div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-utonga-green border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold tracking-widest text-xs uppercase">Syncing Sanctuary Strategy</p>
    </div>
  );

  const phases = [1, 2];

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 selection:bg-utonga-green/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Cinematic Header */}
        <header className="relative mb-16 md:mb-24">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-utonga-green/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="max-w-4xl relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <MapIcon className="text-utonga-green" size={20} />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-utonga-green">Restoration Blueprint</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
              The Path to <br/>
              <span className="text-utonga-accent">Wilderness.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl leading-relaxed">
              Sitatunga is being returned to its natural state through a phased,
              science-backed strategic roadmap. Every milestone is a waypoint on
              the journey to total restoration.
            </p>
          </div>
        </header>

        {/* The Immersive Trail */}
        <div className="relative">
          {/* The Spine (Vertical Line) */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 z-0">
             {/* Progress Highlight (Approximate based on done items) */}
             <div className="absolute top-0 w-full bg-gradient-to-b from-utonga-green to-utonga-accent h-[40%] shadow-[0_0_20px_rgba(110,143,78,0.3)]"></div>
          </div>

          {phases.map(phase => (
            <div key={phase} className="relative mb-16">
              {/* Phase Gate */}
              <div className="flex justify-center mb-12 md:mb-16 relative z-10">
                <div className="bg-black border border-white/10 px-8 py-2 rounded-full flex items-center gap-4 shadow-2xl">
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Gateway</span>
                   <h2 className="text-lg font-bold tracking-tight">Phase {phase}: {phase === 1 ? 'Foundations' : 'Expansion'}</h2>
                </div>
              </div>

              <div className="space-y-4">
                {milestones.filter(m => m.phase === phase).map((m, i) => (
                  <MilestoneCard key={m.id} m={m} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Strategic CTA */}
        <section className="mt-24 relative">
          <div className="absolute inset-0 bg-utonga-green/5 rounded-[3rem] blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 p-8 md:p-16 rounded-[3rem] text-center overflow-hidden">
            <div className="max-w-3xl mx-auto relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                Accelerate the <br/>Restoration.
              </h2>
              <p className="text-gray-400 text-lg mb-8 font-medium leading-relaxed">
                Our roadmap is ambitious but achievable. Your contribution directly
                unlocks the next strategic waypoint in the Sitatunga Sanctuary.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/give" className="bg-utonga-green text-white px-12 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl shadow-utonga-green/20">
                  Fund a Milestone
                </Link>
                <a href="#top" className="flex items-center justify-center px-12 py-5 rounded-2xl font-black text-lg border border-white/10 hover:bg-white/5 transition-all">
                  Back to Top
                </a>
              </div>
            </div>

            {/* Background Decorative Element */}
            <div className="absolute -bottom-20 -right-20 text-white/5 rotate-12">
              <TreeDeciduous size={400} />
            </div>
          </div>
        </section>
      </div>

      {/* Enhanced Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="bg-gray-950 border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <div className="p-8 md:p-16">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                     <span className={`w-2 h-2 rounded-full bg-${getStatusColor(selectedMilestone.status)}`}></span>
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Project Spec</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tighter">{selectedMilestone.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="p-3 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition-all text-gray-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 mb-10">
                <div className="bg-white/[0.03] rounded-2xl p-6">
                  <p className="text-base md:text-lg text-gray-400 leading-relaxed font-medium">
                    {selectedMilestone.description || "Strategic restoration waypoint focusing on indigenous biodiversity and sanctuary infrastructure. This node is critical for the long-term sustainability of the Sitatunga ecosystem."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.03] rounded-xl p-4">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">Status</span>
                    <span className="text-sm font-bold capitalize text-white">{selectedMilestone.status.replace('_', ' ')}</span>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-4">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">Target</span>
                    <span className="text-sm font-bold text-white">{selectedMilestone.target_date || 'Phase 1'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/[0.05]">
                 <Link
                  to="/give"
                  onClick={() => setSelectedMilestone(null)}
                  className="flex-1 bg-utonga-green text-white py-4 rounded-xl font-black text-sm text-center hover:bg-opacity-90 transition-all shadow-lg shadow-utonga-green/10"
                 >
                   Fund this Project
                 </Link>
                 <button
                  onClick={() => setSelectedMilestone(null)}
                  className="flex-1 bg-white/[0.08] text-white py-4 rounded-xl font-black text-sm hover:bg-white/[0.12] transition-all"
                 >
                   Close Details
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
