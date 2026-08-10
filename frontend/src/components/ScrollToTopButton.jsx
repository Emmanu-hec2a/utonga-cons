import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton = ({ isVisibleExternally = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

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

  if (!isVisible && !isVisibleExternally) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`w-14 h-14 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-center text-white/40 shadow-2xl hover:bg-white/10 hover:text-white hover:border-utonga-accent/50 hover:scale-110 transition-all duration-500 group cursor-pointer pointer-events-auto ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90'}`}
      aria-label="Scroll back to top of page"
    >
      <ChevronUp size={24} className="group-hover:-translate-y-1 transition-transform duration-300" />
    </button>
  );
};

export default ScrollToTopButton;
