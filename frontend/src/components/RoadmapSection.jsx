import { useState } from 'react';
import { CheckCircle2, Circle, Clock, ArrowRight, X, Footprints, Tent, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const RoadmapSection = ({ milestones }) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Take top 3 for the homepage trail
  const items = milestones.length > 0 ? milestones.slice(0, 3) : [
    { id: 1, title: 'Hiking trails', status: 'done', category: 'trails_garden', distance: '5.0 km' },
    { id: 2, title: 'Camp accommodation', status: 'in_progress', category: 'camping_experiences' },
    { id: 3, title: 'Wellness zone', status: 'upcoming', category: 'infrastructure' }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'done': return <span className="flex items-center text-fern text-[10px] font-black uppercase tracking-widest bg-fern/10 px-3 py-1 rounded-full"><CheckCircle2 size={12} className="mr-1" /> Done</span>;
      case 'in_progress': return <span className="flex items-center text-utonga-accent text-[10px] font-black uppercase tracking-widest bg-utonga-accent/10 px-3 py-1 rounded-full"><Clock size={12} className="mr-1" /> In Progress</span>;
      default: return <span className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest bg-bark px-3 py-1 rounded-full"><Circle size={12} className="mr-1" /> Upcoming</span>;
    }
  };

  const getIcon = (category) => {
    switch(category) {
      case 'trails_garden': return <Footprints size={18} />;
      case 'camping_experiences': return <Tent size={18} />;
      default: return <Leaf size={18} />;
    }
  };

  return (
    <section id="roadmap" className="py-24 md:py-16 bg-canopy relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-8 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Restoration Roadmap</h2>
            <p className="text-gray-400 font-medium max-w-xl text-base md:text-lg">
              Physical progress you can walk. From blazed trails to sustainable sanctuary stays.
            </p>
          </div>
          <Link to="/roadmap" className="text-utonga-accent font-bold flex items-center hover:underline group text-sm md:text-base">
            View full roadmap <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* The Blazed Trail Visualization */}
        <div className="relative min-h-[500px] md:h-[280px] flex items-center">

          {/* SVG Trail Line - DESKTOP ONLY */}
          <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 400">
            <path d="M 0 200 Q 150 150 333 180" className={`trail-line ${items[0]?.status}`} />
            <path d="M 333 180 Q 500 250 666 200" className={`trail-line ${items[1]?.status}`} />
            <path d="M 666 200 Q 850 150 1000 200" className={`trail-line ${items[2]?.status}`} />
          </svg>

          {/* Vertical Trail Line - MOBILE ONLY */}
          <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5 pointer-events-none overflow-hidden">
             <div className={`w-full h-1/3 bg-fern`}></div>
             <div className={`w-full h-1/3 bg-blaze-yellow`}></div>
             <div className={`w-full h-1/3 border-l-2 border-dashed border-bark`}></div>
          </div>

          {/* Waypoints */}
          <div className="w-full flex flex-col md:grid md:grid-cols-3 gap-16 md:gap-4 relative">
            {items.map((m, i) => {
              const desktopOffsets = ["md:-mt-10", "md:mt-16", "md:-mt-4"];
              const colors = {
                done: 'bg-fern',
                in_progress: 'bg-utonga-accent',
                upcoming: 'bg-bark'
              };

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMilestone(m)}
                  className={`flex flex-row md:flex-col items-center md:text-center transition-all cursor-pointer group ${desktopOffsets[i]}`}
                >
                  {/* Waypoint Marker */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mb-0 md:mb-6 mr-6 md:mr-0 relative z-20 transition-transform duration-500 group-hover:scale-110 shadow-2xl ${colors[m.status] || colors.upcoming} ${m.status === 'upcoming' ? 'border-2 border-dashed border-mist/30' : ''}`}>
                    <div className="text-paper">
                      {getIcon(m.category)}
                    </div>
                    {m.status === 'in_progress' && (
                      <div className="absolute inset-0 rounded-full bg-utonga-accent animate-ping opacity-20"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 md:flex-none">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2 transition-colors group-hover:text-utonga-accent">
                      {m.title}
                    </h3>
                    <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-tight font-bold flex items-center gap-2 md:justify-center">
                      {m.distance && <span>{m.distance} •</span>}
                      <span className={m.status === 'in_progress' ? 'text-utonga-accent' : ''}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-canopy/95 backdrop-blur-md">
          <div className="bg-bark border border-mist/10 rounded-[2.5rem] md:rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 md:p-12">
              <div className="flex justify-between items-start mb-6 md:mb-8">
                <div>
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-utonga-accent mb-2 block">Waypoint Detail</span>
                  <h2 className="text-2xl md:text-4xl font-bold text-white">{selectedMilestone.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="p-2 md:p-3 bg-canopy hover:bg-canopy/50 rounded-xl md:rounded-2xl transition-colors cursor-pointer text-white"
                >
                  <X size={20} md:size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 md:mb-8">
                {getStatusBadge(selectedMilestone.status)}
                {selectedMilestone.target_date && (
                  <span className="text-[10px] md:text-xs font-bold text-gray-400">Target: {selectedMilestone.target_date}</span>
                )}
              </div>

              <div className="max-w-none">
                <p className="text-base md:text-xl text-white/80 leading-relaxed">
                  {selectedMilestone.description || "Field notes for this strategic waypoint are being finalized. This project is a critical part of the restoration path for Sitatunga's indigenous biodiversity."}
                </p>
              </div>

              <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest order-2 sm:order-1">Waypoint {selectedMilestone.id}</p>
                 <Link
                  to="/give"
                  className="w-full sm:w-auto bg-fern text-white px-8 py-3 md:py-4 rounded-2xl font-black text-xs md:text-sm hover:scale-105 transition-all shadow-lg shadow-fern/20 cursor-pointer text-center order-1 sm:order-2"
                 >
                   Fund this milestone
                 </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RoadmapSection;
