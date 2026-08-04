import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
      <button
        onClick={scrollToTop}
        className="w-14 h-14 bg-utonga-green/20 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(110,143,78,0.3)] hover:bg-utonga-green/40 hover:scale-110 hover:shadow-[0_0_40px_rgba(110,143,78,0.5)] transition-all duration-300 group cursor-pointer"
        aria-label="Scroll back to top of page"
      >
        <ChevronUp size={28} className="group-hover:-translate-y-1 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default ScrollToTopButton;
