import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-black py-16 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-white">
              UTONGA<span className="text-utonga-accent">.</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Restoring Sitatunga Botanical Garden and the indigenous landscapes of Lake Victoria.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Instagram size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Explore</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link to="/explore/visit" className="hover:text-utonga-accent">Visit & Book</Link></li>
              <li><Link to="/explore/partner" className="hover:text-utonga-accent">Partner with Us</Link></li>
              <li><Link to="/explore/get-involved" className="hover:text-utonga-accent">Get Involved</Link></li>
              <li><Link to="/give" className="hover:text-utonga-accent">Donate Now</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-utonga-accent" />
                {settings.contact_phone || '+256 770 000 000'}
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2 text-utonga-accent" />
                {settings.contact_email || 'hello@utonga.org'}
              </li>
              <li className="text-xs leading-relaxed opacity-80">
                Sitatunga Botanical Garden, Entebbe, Uganda
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Transparency</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-utonga-accent">Annual Reports</a></li>
              <li><a href="#" className="hover:text-utonga-accent">Audit Logs</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-900 text-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} Utonga Conservation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
