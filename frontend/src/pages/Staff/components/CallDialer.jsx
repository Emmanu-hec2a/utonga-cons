import { useState, useEffect } from 'react';
import { Phone, X, PhoneOff, Clock, User, MessageSquare } from 'lucide-react';
import api from '../../../api';

const CallDialer = ({ to, name, relatedType, relatedId, onClose }) => {
  const [status, setStatus] = useState('connecting'); // connecting, ringing, active, summary
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callLogId, setCallLogId] = useState(null);

  useEffect(() => {
    const initiateCall = async () => {
      try {
        // In production, staff_number should come from the logged-in user's profile
        // For MVP, we can prompt or use a setting. Let's assume user profile has it.
        const res = await api.post('/api/admin/calls/initiate/', {
          to_number: to,
          staff_number: '+256700000000', // This should be dynamic
          related_type: relatedType,
          related_id: relatedId
        });
        setCallLogId(res.data.id);
        setStatus('ringing');
      } catch (err) {
        console.error('Call failed:', err);
        setStatus('summary');
        setNotes('Failed to initiate call. Check configuration.');
      }
    };

    initiateCall();
  }, [to, relatedType, relatedId]);

  useEffect(() => {
    let timer;
    if (status === 'active') {
      timer = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  const formatDuration = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => status === 'summary' && onClose()} />

      <div className="relative w-full max-w-md bg-gray-950 border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center text-utonga-accent font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                <div className="w-2 h-2 bg-utonga-accent rounded-full mr-2 animate-ping" />
                {status === 'connecting' ? 'Initializing PSTN' :
                 status === 'ringing' ? 'Ringing Staff' :
                 status === 'active' ? 'Live Call' : 'Call Summary'}
              </div>
              <h2 className="text-3xl font-black tracking-tighter">{name}</h2>
              <p className="text-gray-500 font-mono text-sm mt-1">{to}</p>
            </div>
            {status === 'summary' && (
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={24} className="text-gray-500" />
              </button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center py-10 space-y-6">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
              status === 'active' ? 'border-utonga-green bg-utonga-green/10 scale-110' :
              status === 'summary' ? 'border-gray-800 bg-gray-900' : 'border-utonga-accent/20 bg-utonga-accent/5'
            }`}>
              {status === 'active' ? (
                <Phone size={48} className="text-utonga-green animate-pulse" />
              ) : status === 'summary' ? (
                <Clock size={48} className="text-gray-500" />
              ) : (
                <Phone size={48} className="text-utonga-accent animate-bounce" />
              )}
            </div>

            {status === 'active' && (
              <div className="text-4xl font-black font-mono tracking-tighter text-white">
                {formatDuration(duration)}
              </div>
            )}

            {status !== 'summary' && (
              <p className="text-gray-400 text-sm font-medium animate-pulse text-center max-w-[250px]">
                {status === 'connecting' ? 'Setting up secure bridge...' :
                 status === 'ringing' ? 'Answer your physical phone to connect with the visitor.' :
                 'Audio routed via Utonga Gateway'}
              </p>
            )}
          </div>

          {status === 'summary' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
                <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  <MessageSquare size={12} className="mr-2" /> Call Notes
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What was discussed? e.g. Confirmed arrival time."
                  className="w-full bg-transparent border-none outline-none text-white placeholder:text-gray-700 resize-none h-24 text-sm leading-relaxed"
                />
              </div>
              <button
                onClick={onClose}
                className="w-full bg-utonga-accent text-utonga-dark py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-utonga-accent/10 transition-all hover:scale-[1.02] active:scale-95"
              >
                Save Log & Close
              </button>
            </div>
          )}

          {status !== 'summary' && (
            <div className="mt-8">
              <button
                onClick={() => setStatus('summary')}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] border border-red-500/20 transition-all flex items-center justify-center"
              >
                <PhoneOff size={16} className="mr-2" /> End Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallDialer;
