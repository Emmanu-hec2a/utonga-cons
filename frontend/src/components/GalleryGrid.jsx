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

  const getImgUrl = (img, width = 800) => {
    let url = img.img || img.image_url || (img.image_key?.startsWith('http') ? img.image_key : `https://r2-placeholder.com/${img.image_key}`);

    // Apply dynamic width for Unsplash optimization if it's an Unsplash URL
    if (url && url.includes('images.unsplash.com')) {
      // Replace existing width parameter or append it
      if (url.includes('w=')) {
        url = url.replace(/w=\d+/, `w=${width}`);
      } else {
        url += `&w=${width}`;
      }
      // Ensure high-performance quality for thumbnails
      if (width <= 800 && url.includes('q=')) {
        url = url.replace(/q=\d+/, 'q=60');
      }
    }
    return url;
  };

  useEffect(() => {
    const fetchImages = async () => {
      // ONLY the specific Wildlife Collection you requested (All old landscapes purged)
      const wildlifeDefaults = [
        { title: "Butterfly Sanctuary", category: "Biodiversity", img: "https://images.unsplash.com/photo-1598207981454-d849f4ac3a9e?q=70&w=1800" },
        { title: "African Porcupine", category: "Wildlife", img: "https://images.unsplash.com/photo-1776509545709-78aa6c9fa5bc?q=70&w=1200" },
        { title: "Indigenous Hippo", category: "Wetland", img: "https://plus.unsplash.com/premium_photo-1661963467008-cc311b4a98ca?q=70&w=1800" },
        { title: "Black Ants Trail", category: "Restoration", img: "https://plus.unsplash.com/premium_photo-1722811376945-2ee83126ffe6?q=70&w=1800" },
        { title: "Guinea Fowl", category: "Wildlife", img: "https://images.unsplash.com/photo-1705723119182-054121c14b85?q=70&w=1200" },
        { title: "Forest Monkey", category: "Sanctuary", img: "https://images.unsplash.com/photo-1570275887572-34b431333fec?q=70&w=1800" }
      ];

      try {
        const res = await api.get('/api/gallery/');
        // If the backend has images (e.g. from seed or manual upload),
        // we ONLY use those and wildlifeDefaults. We NEVER show the old landscapes.
        if (Array.isArray(res.data) && res.data.length > 0) {
          setImages([...res.data, ...wildlifeDefaults]);
        } else {
          setImages(wildlifeDefaults);
        }
      } catch (err) {
        console.error('Gallery sync error:', err);
        setImages(wildlifeDefaults); // Fallback only to the wildlife collection
      }
    };

    fetchImages();
    const interval = setInterval(fetchImages, 300000);
    return () => clearInterval(interval);
  }, []);

  const openLightboxOnSlide = (number) => {
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
          {images.map((img, i) => (
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
                src={getImgUrl(img, 800)}
                alt={img.alt || `${img.title} - ${img.category} in Utonga Sanctuary`}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 pointer-events-none"
                loading="lazy"
              />
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

      {images.length > 0 && (
        <Lightbox
          toggler={lightboxController.toggler}
          sources={images.map(img => getImgUrl(img, 2000))}
          slide={lightboxController.slide}
        />
      )}
    </section>
  );
};

export default GalleryGrid;
