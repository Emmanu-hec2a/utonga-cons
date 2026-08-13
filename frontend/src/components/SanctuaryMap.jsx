import { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Trees, Info } from 'lucide-react';

const SanctuaryMap = () => {
  const [infowindowOpen, setInfowindowOpen] = useState(false);

  // Precision Coordinates for Utonga, West Sakwa (Bondo), Kenya
  const position = { lat: -0.079206, lng: 34.175679 };

  // High-Fidelity Night Mode Style ID (Optional: You can also use a raw JSON style array)
  // For now, we use the "SATELLITE" map type for that lush cinematic feel
  const mapId = 'UTONGA_MAP_ID'; // You can create a custom style in Google Cloud Console

  return (
    <section className="relative w-full py-24 bg-black overflow-hidden border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-utonga-accent">
              <MapPin size={20} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Interactive Impact Zone</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              West Sakwa, <span className="text-utonga-accent italic">Bondo.</span>
            </h2>
          </div>
          <div className="text-right">
             <p className="text-white/40 font-mono text-sm mb-2 uppercase tracking-widest">0°04'45.1"S 34°10'32.4"E</p>
             <a
               href={`https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 text-utonga-accent hover:underline font-bold text-sm uppercase tracking-widest"
             >
               Navigate to Sanctuary <Navigation size={14} />
             </a>
          </div>
        </div>


        {/* The API-Driven Map Hub */}
        <div className="relative w-full h-[500px] rounded-[3rem] overflow-hidden border border-white/[0.05] group shadow-2xl shadow-utonga-accent/5">
          <APIProvider apiKey="AIzaSyChc8grsBxxWDqpvWXVwW3uuqOy7edCaxM">
            <Map
              defaultCenter={position}
              defaultZoom={17}
              mapId={mapId}
              mapTypeId={'hybrid'}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
              className="w-full h-full"
              onClick={() => setInfowindowOpen(false)}
            >
              {/* The Advanced Interactive Marker */}
              <AdvancedMarker
                position={position}
                onClick={() => setInfowindowOpen(true)}
              >
                <div className="relative group">
                    <div className="w-6 h-6 bg-utonga-accent rounded-full shadow-[0_0_25px_#FFD700] border-2 border-black flex items-center justify-center cursor-pointer transform group-hover:scale-125 transition-transform duration-300">
                        <Trees size={14} className="text-black" />
                    </div>
                    <div className="absolute inset-0 w-6 h-6 bg-utonga-accent rounded-full animate-ping opacity-75 pointer-events-none" />
                </div>
              </AdvancedMarker>

              {/* High-Fidelity Info Window */}
              {infowindowOpen && (
                <InfoWindow
                  position={position}
                  onCloseClick={() => setInfowindowOpen(false)}
                  headerDisabled={true}
                  className="custom-infowindow"
                >
                  <div className="p-4 bg-gray-900 text-white rounded-xl min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-utonga-accent/10 rounded-lg flex items-center justify-center">
                            <Trees className="text-utonga-accent" size={16} />
                        </div>
                        <h4 className="font-black text-xs uppercase tracking-widest">Utonga Conservation</h4>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                        Primary reforestation site in West Sakwa. This is where your trees are taking root.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-utonga-accent">
                        <Info size={12} />
                        <span>SATELLITE VERIFIED</span>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>

          {/* Map Controls Tip */}
          <div className="absolute top-8 left-8 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-white/60 uppercase tracking-widest flex items-center gap-3 pointer-events-none">
            <Navigation size={12} className="text-utonga-accent" />
            Drag to explore • Scroll to zoom
          </div>
        </div>
      </div>

      <style>{`
        /* Clean up Google's default InfoWindow styling to match Utonga */
        .gm-style-iw {
            background-color: transparent !important;
            padding: 0 !important;
            border-radius: 1rem !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
        }
        .gm-style-iw-d {
            overflow: hidden !important;
        }
        .gm-style-iw-tc::after {
            background-color: #111827 !important;
        }
        .gm-ui-hover-text { display: none !important; }
      `}</style>

      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
};

export default SanctuaryMap;
