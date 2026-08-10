import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api';

const Typewriter = ({ text, onComplete, onNavigate }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, 15); // Fast cinematic typing
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, onComplete]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
        li: ({children}) => <li className="text-white/80">{children}</li>,
        hr: () => <hr className="border-white/10 my-3" />,
        strong: ({children}) => <strong className="text-utonga-accent font-bold">{children}</strong>,
        a: ({href, children}) => (
          <button
            onClick={() => onNavigate(href)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-utonga-accent/10 border border-utonga-accent/30 text-utonga-accent rounded-lg text-[11px] font-black uppercase tracking-tight hover:bg-utonga-accent hover:text-black transition-all mx-1 my-1 cursor-pointer group"
          >
            {children}
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        )
      }}
    >
      {displayedText}
    </ReactMarkdown>
  );
};

const UtongaAssistant = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm the Utonga Assistant. How can I help you explore our conservation mission today?",
      isTyped: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    // Show welcome toast after 2 seconds if not closed before and not already open
    const hasClosed = localStorage.getItem('utonga_ai_welcome_closed');
    if (!hasClosed) {
      const timer = setTimeout(() => {
        if (!isOpen) setShowWelcome(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const closeWelcome = (e) => {
    e.stopPropagation();
    setShowWelcome(false);
    localStorage.setItem('utonga_ai_welcome_closed', 'true');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false); // Close chat after navigation
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: input, timestamp: now };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/api/ai/chat/', {
        message: input,
        history: messages.slice(-5) // Send last 5 messages for context
      });
      setIsTyping(true);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response,
        isTyped: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting. Feel free to explore our Roadmap in the meantime!",
        isTyped: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const markMessageAsTyped = (index) => {
    setMessages(prev => prev.map((msg, i) =>
      i === index ? { ...msg, isTyped: true } : msg
    ));
    setIsTyping(false);
  };

  return (
    <div ref={containerRef}>
      {/* Welcome Tooltip */}
      <AnimatePresence>
        {showWelcome && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.8 }}
            className="absolute bottom-[70px] right-0 z-[60] group"
          >
            <div className="relative bg-utonga-dark/95 backdrop-blur-xl border border-utonga-accent/30 p-4 pr-10 rounded-2xl shadow-2xl w-[260px]">
              <p className="text-xs text-white/90 leading-relaxed font-medium">
                Want to know how your <span className="text-utonga-accent font-bold">contribution</span> impacts the mission? Ask me! 🌍
              </p>
              <button
                onClick={closeWelcome}
                className="absolute top-2 right-2 p-1 text-white/30 hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
              {/* Tooltip Arrow */}
              <div className="absolute -bottom-2 right-[22px] w-4 h-4 bg-utonga-dark border-r border-b border-utonga-accent/30 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-utonga-accent rounded-full flex items-center justify-center shadow-2xl shadow-utonga-accent/20 hover:scale-110 transition-transform cursor-pointer group pointer-events-auto relative"
      >
        {isOpen ? <X className="text-black" /> : <MessageCircle className="text-black" size={24} />}
        {!isOpen && (
           <span className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-100 group-hover:scale-110 transition-transform duration-300">
             <Sparkles size={12} className="text-utonga-accent animate-pulse" />
           </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-[70px] right-0 sm:w-[380px] h-[520px] max-h-[70vh] sm:max-h-none bg-utonga-dark/95 backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
          >
           {/* Header */}
            <div className="p-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-utonga-accent/10 rounded-xl flex items-center justify-center border border-utonga-accent/20">
                  <Bot className="text-utonga-accent" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight uppercase">Utonga Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white/40 font-medium">Online & Knowledgeable</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom"
            >
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-utonga-accent text-black font-medium'
                      : 'bg-white/[0.05] border border-white/[0.08] text-white/90 leading-relaxed'
                  }`}>
                    {msg.role === 'assistant' && !msg.isTyped ? (
                      <Typewriter
                        text={msg.content}
                        onComplete={() => markMessageAsTyped(idx)}
                        onNavigate={handleNavigate}
                      />
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({children}) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                          li: ({children}) => <li className="text-white/80">{children}</li>,
                          hr: () => <hr className="border-white/10 my-3" />,
                          strong: ({children}) => <strong className="text-utonga-accent font-bold">{children}</strong>,
                          a: ({href, children}) => (
                            <button
                              onClick={() => handleNavigate(href)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-utonga-accent/10 border border-utonga-accent/30 text-utonga-accent rounded-lg text-[11px] font-black uppercase tracking-tight hover:bg-utonga-accent hover:text-black transition-all mx-1 my-1 cursor-pointer group"
                            >
                              {children}
                              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          )
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                  {msg.timestamp && (
                    <span className="text-[9px] text-white/20 mt-1 px-1 uppercase font-bold tracking-tighter">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.05] border border-white/[0.08] p-3 rounded-2xl flex gap-1">
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/[0.08] bg-white/[0.02]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about our mission..."
                  className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-utonga-accent/50 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-8 h-8 bg-utonga-accent rounded-xl flex items-center justify-center text-black hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-center text-[9px] text-white/20 mt-3 uppercase tracking-widest font-bold">
                Powered by Utonga Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UtongaAssistant;
