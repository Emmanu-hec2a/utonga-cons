import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 w-full z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-white">
              UTONGA<span className="text-utonga-accent">.</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link to="/explore/visit" className="text-white hover:text-utonga-accent px-3 py-2 text-lg font-bold">Visit</Link>
              <Link to="/explore/partner" className="text-white hover:text-utonga-accent px-3 py-2 text-lg font-bold">Partner</Link>
              <Link to="/explore/get-involved" className="text-white hover:text-utonga-accent px-3 py-2 text-lg font-bold">Get Involved</Link>
              <Link to="/give" className="bg-utonga-green hover:bg-opacity-90 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg transition-all">
                Give now
              </Link>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none focus:ring-2 focus:ring-utonga-accent rounded-lg p-1"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-utonga-dark bg-opacity-95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
            <Link to="/explore/visit" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-xl font-bold border-b border-gray-800 text-white">Visit</Link>
            <Link to="/explore/partner" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-xl font-bold border-b border-gray-800 text-white">Partner</Link>
            <Link to="/explore/get-involved" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-xl font-bold border-b border-gray-800 text-white">Get Involved</Link>
            <Link to="/give" onClick={() => setIsOpen(false)} className="block px-3 py-6 text-2xl font-bold text-utonga-accent">Give now</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
