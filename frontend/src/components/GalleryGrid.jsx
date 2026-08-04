import { useState, useEffect } from 'react';
import FsLightbox from 'fslightbox-react';
import { ArrowRight } from 'lucide-react';
import api from '../api';

const Lightbox = FsLightbox.default || FsLightbox;

const GalleryGrid = () => {
  const [images, setImages] = useState([]);
  const [lightboxController, setLightboxController] = useState({
    toggler: false,
    slide: 1
  });

  const defaultImages = [
    {
      title: "Forest Trail",
      category: "Restoration",
      img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071",
      alt: "A lush indigenous tropical forest trail in Utonga"
    },
    {
      title: "Wetland Sanctuary",
      category: "Biodiversity",
      img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070",
      alt: "Wetland area on the shores of Lake Victoria"
    },
    {
      title: "Hippo Point",
      category: "Wildlife",
      img: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=2070",
      alt: "A view of the lake where hippos frequently gather"
    },
    {
      title: "Botanical Garden",
      category: "Preservation",
      img: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1932",
      alt: "Sitatunga Botanical Garden flowers and flora"
    },
    {
      title: "Camp Site",
      category: "Visitor Experience",
      img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070",
      alt: "Serene camping spot overlooking the forest"
    },
    {
      title: "Lakeside Sunset",
      category: "Environment",
      img: "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=2070",
      alt: "Sunset over Lake Victoria"
    }
  ];

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await api.get('/api/gallery/');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setImages(res.data);
        }
      } catch (err) {
        console.error('Gallery sync error:', err);
      }
    };

    fetchImages();
    const interval = setInterval(fetchImages, 300000);
    return () => clearInterval(interval);
  }, []);

  const displayImages = images.length > 0 ? images : defaultImages;

  const openLightboxOnSlide = (number) => {
    // We use a separate toggle to ensure it always fires
    setLightboxController(prev => ({
      toggler: !prev.toggler,
      slide: number
    }));
  };

  return (
    <section className="py-24 bg-utonga-dark border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Sanctuary in Focus</h2>
            <p className="text-gray-400">
              Explore the diverse ecosystems of Utonga, from indigenous tropical forests to the
              vibrant wetlands of Lake Victoria.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openLightboxOnSlide(1)}
            className="flex items-center text-utonga-accent font-bold hover:underline transition-all cursor-pointer z-20"
          >
            View all photos <ArrowRight size={20} className="ml-2" />
          </button>
        </div>

        {/* Stable Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayImages.map((img, i) => (
            <div
              key={i}
              className="relative group aspect-[4/3] overflow-hidden rounded-[2rem] bg-gray-900 border border-gray-800 hover:border-utonga-accent focus:outline-none focus:ring-2 focus:ring-utonga-accent transition-all cursor-pointer z-10"
              onClick={() => openLightboxOnSlide(i + 1)}
              onKeyDown={(e) => e.key === 'Enter' && openLightboxOnSlide(i + 1)}
              role="button"
              tabIndex="0"
              aria-label={`View full size photo: ${img.title} - ${img.category}`}
            >
              <img
                src={img.img || img.image || `https://r2-placeholder.com/${img.image_key}`}
                alt={img.alt || `${img.title} - ${img.category} in Utonga Sanctuary`}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 pointer-events-none"
                loading="lazy"
              />
              {/* High-Fidelity Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8 pointer-events-none">
                <p className="text-utonga-accent text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                  {img.category || "Sanctuary"}
                </p>
                <h3 className="text-white text-xl font-bold">
                  {img.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        toggler={lightboxController.toggler}
        sources={displayImages.map(d => d.img || d.image || `https://r2-placeholder.com/${d.image_key}`)}
        slide={lightboxController.slide}
      />
    </section>
  );
};

export default GalleryGrid;
