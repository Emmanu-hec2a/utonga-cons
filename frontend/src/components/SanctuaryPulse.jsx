import { Trees, Waves, Bird, Wind, CloudSun } from 'lucide-react';

const SanctuaryPulse = () => {
  const ecosystems = [
    {
      title: "Indigenous Forest",
      icon: <Trees className="text-utonga-accent" size={24} />,
      desc: "The 'Lungs of Bondo'—a biological heaven for birds and rare butterflies.",
      tag: "500T Carbon Goal"
    },
    {
      title: "Pristine Wetlands",
      icon: <Waves className="text-utonga-accent" size={24} />,
      desc: "The last stronghold for the rare Sitatunga Antelope, protected by community rangers.",
      tag: "Sitatunga Sanctuary"
    },
    {
      title: "Savannah Bushland",
      icon: <Wind className="text-utonga-accent" size={24} />,
      desc: "A transition zone of indigenous plant species and wild African beauty.",
      tag: "Indigenous Flora"
    },
    {
      title: "Lake Beachfront",
      icon: <Bird className="text-utonga-accent" size={24} />,
      desc: "Cinematic Hippo Point and future site of luxury eco-cottages.",
      tag: "Eco-Tourism Hub"
    },
    {
      title: "Arboretum",
      icon: <CloudSun className="text-utonga-accent" size={24} />,
      desc: "A cellphone-free wellness sanctuary for research and spiritual healing.",
      tag: "Healing Zone"
    }
  ];

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-utonga-accent mb-4">
            The Living Sanctuary
          </h2>
          <h3 className="text-4xl md:text-5xl font-black text-white max-w-2xl leading-tight">
            A Mosaic of <span className="text-utonga-accent italic">Biodiversity.</span>
          </h3>
          <p className="mt-6 text-white/50 max-w-xl text-lg leading-relaxed">
            Utonga is a critical intersection of five distinct African ecosystems,
            co-managed by the community to protect a virgin landscape in West Sakwa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {ecosystems.map((eco, idx) => (
            <div
              key={idx}
              className="group relative p-8 rounded-[2rem] bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-utonga-accent/30 transition-all duration-500 flex flex-col justify-between h-[320px]"
            >
              <div>
                <div className="mb-6 w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  {eco.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-4">{eco.title}</h4>
                <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/70 transition-colors">
                  {eco.desc}
                </p>
              </div>

              <div className="pt-6">
                <span className="text-[9px] font-black uppercase tracking-widest text-utonga-accent/60 group-hover:text-utonga-accent transition-colors">
                  {eco.tag}
                </span>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-1.5 h-1.5 rounded-full bg-utonga-accent animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-utonga-accent/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
};

export default SanctuaryPulse;
