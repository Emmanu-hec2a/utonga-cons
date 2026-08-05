import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/[0.05] h-16' : 'bg-transparent h-20'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold tracking-tighter text-white">
                UTONGA<span className="text-utonga-accent">.</span>
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <Link to="/explore/visit" className="text-white hover:text-utonga-accent px-3 py-2 text-lg font-bold transition-colors">Visit</Link>
                <Link to="/explore/partner" className="text-white hover:text-utonga-accent px-3 py-2 text-lg font-bold transition-colors">Partner</Link>
                <Link to="/explore/get-involved" className="text-white hover:text-utonga-accent px-3 py-2 text-lg font-bold transition-colors">Get Involved</Link>
                <Link to="/give" className="bg-utonga-green hover:bg-opacity-90 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg transition-all">
                  Give now
                </Link>
              </div>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(true)}
                className="text-white focus:outline-none focus:ring-1 focus:ring-utonga-accent/30 rounded-lg p-2 transition-colors hover:bg-white/5"
                aria-label="Open navigation menu"
              >
                <Menu size={28} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Side Drawer */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-[75%] sm:w-[60%] bg-black/95 backdrop-blur-2xl border-l border-white/10 transition-transform duration-500 ease-out shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex justify-between items-center mb-12">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-xl font-bold tracking-tighter text-white">
              UTONGA<span className="text-utonga-accent">.</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white p-2 hover:bg-white/5 rounded-full transition-colors"
              aria-label="Close navigation menu"
            >
              <X size={28} />
            </button>
          </div>

          <div className="flex flex-col space-y-6">
            <Link to="/explore/visit" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white hover:text-utonga-accent transition-colors">Visit</Link>
            <Link to="/explore/partner" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white hover:text-utonga-accent transition-colors">Partner</Link>
            <Link to="/explore/get-involved" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-white hover:text-utonga-accent transition-colors">Get Involved</Link>
            <div className="pt-8 mt-8 border-t border-white/10">
              <Link to="/give" onClick={() => setIsOpen(false)} className="block w-full bg-utonga-green hover:bg-opacity-90 text-white py-5 rounded-2xl text-center text-xl font-bold shadow-2xl transition-all">
                Give now
              </Link>
            </div>
          </div>

          <div className="mt-auto pb-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Conservation Tourism</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
