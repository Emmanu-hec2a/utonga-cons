import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  {
    url: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?q=70&w=1800&auto=format&fit=crop',
    alt: 'Scenic view of Brown Deer during the golden hour in the Sitatunga conservation area'
  },
  {
    url: 'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?q=70&w=1800&auto=format&fit=crop',
    alt: 'Solitary camp tent under a sunset sky in the Sitatunga conservation area'
  },
  {
    url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=70&w=1800&auto=format&fit=crop',
    alt: 'Lush indigenous tropical forest at sunrise in Utonga Sanctuary'
  },
  {
    url: 'https://images.unsplash.com/photo-1686109968922-d74e8e03d516?q=70&w=1800&auto=format&fit=crop',
    alt: 'Serene wetland sanctuary on the shores of Lake Victoria'
  },
  {
    url: 'https://images.unsplash.com/photo-1751568928469-4404ca644fa9?q=70&w=1800&auto=format&fit=crop',
    alt: 'Serene wetland sanctuary on the shores of Lake Victoria'
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = 'Sitatunga.';

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  useEffect(() => {
    let i = 0;
    setTypedText('');
    setShowCursor(true);
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(timer);
        setTimeout(() => setShowCursor(false), 1000); // Hide cursor shortly after finishing
      }
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative h-[620px] md:h-screen min-h-[620px] w-full overflow-hidden bg-utonga-dark"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
    >
      {/* Slideshow Background */}
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={img.url}
            alt={img.alt}
            className="h-full w-full object-cover object-center"
            // Priority for first image, lazy for others
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'low'}
          />
        </div>
      ))}

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-hero-gradient z-10 pointer-events-none"></div>

      {/* Fixed Content Overlay */}
      <div className="relative z-20 flex flex-col justify-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4" aria-label={`Restoring the Heart of ${fullText}`}>
            Restoring the Heart&nbsp;of <br className="hidden md:block" />
            <span className="text-utonga-accent text-5xl md:text-8xl inline-flex items-center" aria-hidden="true">
              {typedText}
              {showCursor && (
                <span className="w-[4px] h-[0.8em] bg-utonga-accent ml-2 animate-pulse" />
              )}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
            Indigenous tropical forest, wetland sanctuaries, and the future of Lake Victoria's biodiversity. $1 = 1 tree planted.
          </p>
          <div className="flex flex-row flex-wrap gap-6 items-center">
            <Link to="/give" className="bg-utonga-green hover:bg-opacity-90 text-white px-10 py-4 rounded-full text-lg font-bold shadow-2xl transition-all">
              Give now
            </Link>
            <a href="#roadmap" className="text-white hover:text-utonga-accent font-medium underline underline-offset-8">
              See the roadmap
            </a>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="absolute z-30 bottom-8 right-4 md:right-8 flex items-center space-x-4">
        <div className="flex space-x-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 transition-all rounded-full ${
                i === currentSlide ? 'w-8 bg-utonga-accent' : 'w-2 bg-white/50 hover:bg-white'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <div className="hidden md:flex space-x-2">
          <button onClick={prevSlide} className="p-2 rounded-full border border-white/30 text-white hover:bg-white/10" aria-label="Previous slide">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextSlide} className="p-2 rounded-full border border-white/30 text-white hover:bg-white/10" aria-label="Next slide">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
