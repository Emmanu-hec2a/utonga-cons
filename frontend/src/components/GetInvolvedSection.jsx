import { Link } from 'react-router-dom';

const GetInvolvedSection = () => {
  return (
    <section className="py-24 bg-utonga-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-utonga-accent mb-4 block">Take Action</span>
          <h2 className="text-4xl md:text-6xl font-black mb-6 italic">Get <span className="text-utonga-green">Involved.</span></h2>
          <p className="text-gray-400 text-lg font-medium">
            Conservation isn't a spectator sport. Whether you're halfway across the world or right here in Homa Bay, there's a place for you in the Utonga story.
          </p>
        </div>

        {/* Support Banner - Now the main focus */}
        <div className="bg-gradient-to-r from-utonga-green to-emerald-800 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-utonga-green/20">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-4xl font-black text-white mb-4 italic">Are you a Diaspora Investor?</h3>
            <p className="text-white/90 text-lg font-medium max-w-2xl">
              Join our strategic capital round for Phase 2 infrastructure and luxury eco-lodges.
              Help us scale the vision for sustainable conservation tourism on Lake Victoria.
            </p>
          </div>
          <Link to="/explore/partner" className="bg-white text-utonga-green px-12 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-xl cursor-pointer whitespace-nowrap">
            Inquiry for 2026
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GetInvolvedSection;
