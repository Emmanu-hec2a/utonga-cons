import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ExploreSection = () => {
  const cards = [
    { title: "Visit & Book", desc: "Reserve a day visit, guided tour, or overnight stay with our lakeside team.", link: "/explore/visit", img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070" },
    { title: "Partner with Us", desc: "Tour operators, diaspora community, and capital investors for Phase 2.", link: "/explore/partner", img: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070" },
    { title: "Get Involved", desc: "Join our hiking clubs or volunteer for reforestation efforts.", link: "/explore/get-involved", img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013" }
  ];

  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Explore Utonga</h2>
            <p className="text-gray-400 max-w-xl">From quiet wetland sanctuaries to the future of conservation tourism.</p>
          </div>
          <Link to="/explore" className="hidden md:flex items-center text-utonga-accent font-bold hover:underline">
            View all <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <Link key={i} to={card.link} className="group relative h-[450px] overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                   style={{ backgroundImage: `url(${card.img})` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 md:opacity-80 md:group-hover:opacity-90 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-gray-300 text-sm mb-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">{card.desc}</p>
                <div className="w-10 h-10 rounded-full bg-utonga-accent flex items-center justify-center text-black">
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreSection;
