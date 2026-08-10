import { useState, useEffect } from 'react';
import api from '../api';
import { Sun, Cloud, CloudRain, Wind, Droplets, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WeatherPulse = ({ variant = 'default' }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await api.get('/api/weather/');
        setWeather(res.data);
      } catch (err) {
        console.warn('Weather sync error - falling back to Sanctuary Defaults:', err);
        setWeather({
          temp: 24,
          condition: "Ideal",
          advisory: "Perfect conditions for sanctuary exploration.",
          humidity: 65,
          wind_speed: 12,
          is_fallback: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 900000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !weather) return null;

  const WeatherIcon = ({ size = 16, className = "" }) => {
    if (weather.condition.includes('Rain')) return <CloudRain size={size} className={`text-blue-400 ${className}`} />;
    if (weather.condition.includes('Cloud')) return <Cloud size={size} className={`text-gray-400 ${className}`} />;
    return <Sun size={size} className={`text-yellow-400 ${className}`} />;
  };

  if (variant === 'pill') {
    return (
      <div className="relative">
        {/* The Interactive Pill - Ultra Minimalist Variant */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-full shadow-2xl hover:bg-white/5 hover:border-utonga-accent/50 transition-all group animate-in fade-in slide-in-from-right-4 duration-700 cursor-pointer pointer-events-auto"
        >
          <WeatherIcon size={18} />
          <span className="text-white font-black text-sm tracking-tight">{weather.temp}°C</span>
        </button>

        {/* Cinematic Expansion Card */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10, x: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10, x: 20 }}
              className="absolute bottom-[60px] right-0 w-[280px] bg-utonga-dark/98 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl z-[110] pointer-events-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 text-utonga-accent mb-1">
                    <MapPin size={12} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bondo, Kenya</span>
                  </div>
                  <h3 className="text-xl font-black text-white">Sanctuary Pulse</h3>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-6 mb-8 bg-white/[0.03] border border-white/[0.05] p-4 rounded-2xl">
                <WeatherIcon size={48} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                <div>
                  <div className="text-4xl font-black text-white">{weather.temp}°C</div>
                  <div className="text-sm text-gray-400 font-bold">{weather.condition}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Droplets size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Humidity</span>
                  </div>
                  <div className="text-sm font-bold text-white">{weather.humidity || 65}%</div>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Wind size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Wind</span>
                  </div>
                  <div className="text-sm font-bold text-white">{weather.wind_speed || 12} <span className="text-[10px] opacity-50">km/h</span></div>
                </div>
              </div>

              <div className="bg-utonga-accent/5 border border-utonga-accent/20 p-4 rounded-2xl">
                <div className="text-[9px] text-utonga-accent font-black uppercase tracking-[0.2em] mb-2">Travel Advisory</div>
                <p className="text-xs text-white/80 leading-relaxed italic">
                  "{weather.advisory}"
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 text-center">
                <span className="text-[8px] text-white/20 font-black uppercase tracking-[0.3em]">Live Update • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="w-10 h-10 bg-white/[0.05] rounded-xl flex items-center justify-center">
        <WeatherIcon />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white font-black text-sm">{weather.temp}°C</span>
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{weather.condition}</span>
        </div>
        <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">
          {weather.advisory}
        </p>
      </div>
      <div className="hidden sm:block text-right">
        <span className="block text-[8px] text-gray-600 font-black uppercase tracking-tighter">Sanctuary Pulse</span>
        <span className="block text-[8px] text-utonga-accent font-black uppercase tracking-widest">Live: Bondo, KE</span>
      </div>
    </div>
  );
};

export default WeatherPulse;
