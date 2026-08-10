import { Link } from 'react-router-dom';
import { ArrowRight, Trees, Binoculars, Users, MapPin } from 'lucide-react';
import GalleryGrid from '../components/GalleryGrid';
import WeatherPulse from '../components/WeatherPulse';

const ExploreCard = ({ title, description, icon: Icon, link, category }) => (
  <Link to={link} className="group relative bg-white/[0.02] border border-white/[0.05] p-8 rounded-[2.5rem] hover:border-utonga-accent transition-all duration-500 overflow-hidden flex flex-col h-full">
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={120} className="text-white" />
    </div>
    <span className="text-utonga-accent text-[10px] font-black uppercase tracking-widest mb-4 block italic">{category}</span>
    <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-utonga-accent transition-colors">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">{description}</p>
    <div className="flex items-center text-white text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
      Learn More <ArrowRight size={16} className="ml-2 text-utonga-accent" />
    </div>
  </Link>
);

const ExploreHub = () => {
  return (
    <div className="min-h-screen bg-black selection:bg-utonga-accent selection:text-black">
      {/* Hero Section for Hub */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#6E8F4E33,transparent)] opacity-50" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 italic uppercase leading-[0.85]">
              Discover <br />
              <span className="text-utonga-accent">Utonga</span>
            </h1>
            <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-2xl">
              Journey through the restored Sitatunga Botanical Garden and explore the
              intricate tapestry of East African biodiversity.
            </p>
          </div>
          <div className="mt-12 md:mt-0 w-full md:w-80">
            <WeatherPulse />
          </div>
        </div>
      </section>

      {/* Main Navigation Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <ExploreCard
              category="Adventure"
              title="Visit & Book"
              description="Schedule a private tour or a camping experience in the heart of the sanctuary."
              icon={Binoculars}
              link="/explore/visit"
            />
            <ExploreCard
              category="Collaboration"
              title="Partner with Us"
              description="For tour operators and conservation organizations looking to expand their impact."
              icon={Trees}
              link="/explore/partner"
            />
            <ExploreCard
              category="Community"
              title="Get Involved"
              description="Join our volunteer network or become a sanctuary member to support restoration."
              icon={Users}
              link="/explore/get-involved"
            />
          </div>

          <div className="pt-24 border-t border-white/10">
             <GalleryGrid />
          </div>
        </div>
      </section>

      {/* Location Bar */}
      <section className="py-12 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-gray-500 uppercase font-black text-[10px] tracking-widest">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-utonga-accent" />
            <span>Sitatunga Botanical Garden, Siaya, Kenya</span>
          </div>
          <div className="flex gap-8">
            <span>Latitude: 0.0617° N</span>
            <span>Longitude: 34.2882° E</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExploreHub;
