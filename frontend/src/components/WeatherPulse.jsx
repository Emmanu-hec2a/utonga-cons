import { useState, useEffect } from 'react';
import api from '../api';
import { Sun, Cloud, CloudRain, Thermometer } from 'lucide-react';

const WeatherPulse = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await api.get('/api/weather/');
        setWeather(res.data);
      } catch (err) {
        console.error('Weather sync error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 15 minutes
    const interval = setInterval(fetchWeather, 900000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !weather) return null;

  const WeatherIcon = () => {
    if (weather.condition.includes('Rain')) return <CloudRain size={16} className="text-blue-400" />;
    if (weather.condition.includes('Cloud')) return <Cloud size={16} className="text-gray-400" />;
    return <Sun size={16} className="text-yellow-400" />;
  };

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
