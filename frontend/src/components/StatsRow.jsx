const StatsRow = ({ raised, goal, trees, days }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((raised / goal) * 100) || 0));

  return (
    <div className="bg-black py-12 md:py-20 border-b border-white/5 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-utonga-green/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Progress Tracker Block */}
        <div className="mb-16 md:mb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
             <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                   <div className="w-2 h-2 rounded-full bg-utonga-accent animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-utonga-accent">Tree Planting Campaign</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white flex flex-wrap items-baseline gap-x-3">
                  ${Number(raised).toLocaleString()}
                  <span className="text-gray-500 font-bold text-lg md:text-2xl uppercase tracking-tighter italic">raised of ${Number(goal).toLocaleString()} goal</span>
                </h2>
             </div>
             <div className="text-right">
                <span className="text-5xl md:text-7xl font-black text-white tracking-tighter">{percentage}%</span>
             </div>
          </div>

          <div
            className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Fundraising campaign progress"
          >
             <div
               className="h-full bg-gradient-to-r from-utonga-green via-utonga-accent to-white rounded-full transition-all duration-[2000ms] ease-out shadow-[0_0_25px_rgba(110,143,78,0.4)]"
               style={{ width: `${percentage}%` }}
             ></div>
          </div>
        </div>

        {/* Triple Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-left">
          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl group hover:bg-white/[0.04] transition-all">
            <p className="text-3xl md:text-4xl font-black text-white mb-2">{Number(trees).toLocaleString()}</p>
            <p className="text-gray-500 uppercase tracking-[0.2em] text-[10px] font-black group-hover:text-utonga-green transition-colors">Trees Pledged</p>
            <div className="mt-4 w-12 h-0.5 bg-utonga-green opacity-30"></div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl group hover:bg-white/[0.04] transition-all">
            <p className="text-3xl md:text-4xl font-black text-white mb-2">{days}</p>
            <p className="text-gray-500 uppercase tracking-[0.2em] text-[10px] font-black group-hover:text-utonga-accent transition-colors">Days Remaining</p>
            <div className="mt-4 w-12 h-0.5 bg-utonga-accent opacity-30"></div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl group hover:bg-white/[0.04] transition-all">
            <p className="text-3xl md:text-4xl font-black text-white mb-2">1,240</p>
            <p className="text-gray-500 uppercase tracking-[0.2em] text-[10px] font-black group-hover:text-white transition-colors">Active Donors</p>
            <div className="mt-4 w-12 h-0.5 bg-white opacity-30"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsRow;
