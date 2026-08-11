import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Building, QrCode, CheckCircle, ArrowLeft, ArrowRight, Loader2, Download, Share2, Heart, Trees } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import treeAnimation from '../assets/animations/tree-sprout.json';
import PhoneInputPkg from 'react-phone-input-2';
const PhoneInput = PhoneInputPkg.default || PhoneInputPkg;
import LottiePkg from 'lottie-react';
const Lottie = LottiePkg.default || LottiePkg;
import 'react-phone-input-2/lib/style.css';
import api from '../api';

console.log('Lottie resolved as:', typeof Lottie, Lottie);

const DonationFlow = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('25');
  const [method, setMethod] = useState('');
  const [details, setDetails] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donationResult, setDonationResult] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  useEffect(() => {
    const status = searchParams.get('status');
    const id = searchParams.get('id');
    if (status === 'success' && id) {
      // Direct jump to success step without history manipulation
      // to avoid Paystack Cross-Origin Security Errors
      setStep(4);
      fetchLiveDonationStatus(String(id));
    }
  }, [searchParams]);

  const fetchLiveDonationStatus = async (id) => {
    if (!id) return;
    setIsLoadingStatus(true);
    try {
      const res = await api.get(`/api/donations/${id}/status/`);
      if (res.data.status === 'completed') {
        // Data Sanitization: Convert everything to safe primitives
        const safeData = {
          id: String(res.data.id),
          amount: String(res.data.amount),
          donor_name: String(res.data.donor_name || ''),
          donor_email: String(res.data.donor_email || ''),
          status: 'completed'
        };
        setDonationResult(safeData);
        setAmount(safeData.amount);
        setStep(4);
      }
      return res.data.status;
    } catch (err) {
      console.error('Error fetching live status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Auto-Polling Logic for "New Tab" checkout
  useEffect(() => {
    let interval;
    if (step === 4 && donationResult?.is_waiting && donationResult?.id) {
      const pollingId = String(donationResult.id);
      interval = setInterval(async () => {
        const currentStatus = await fetchLiveDonationStatus(pollingId);
        if (currentStatus === 'completed') {
          clearInterval(interval);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [step, donationResult?.is_waiting, donationResult?.id]);

  const presets = [10, 25, 50, 100];

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const initiateDonation = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/donations/initiate/', {
        amount: Number(amount),
        method,
        donor_name: details.name,
        donor_email: details.email,
        phone_number: details.phone
      });

      if (res.data.checkout_url) {
        // High-Fidelity Hybrid Flow:
        // Set the MAIN tab to "Waiting" BEFORE opening the new tab
        const initData = {
          id: String(res.data.donation_id),
          is_waiting: true
        };
        setDonationResult(initData);
        setStep(4);

        // Open the Paystack checkout in a new window/tab
        window.open(res.data.checkout_url, '_blank');
      } else {
        const directData = {
          id: String(res.data.id || res.data.donation_id),
          amount: String(res.data.amount),
          donor_name: String(res.data.donor_name || ''),
          status: String(res.data.status || 'completed')
        };
        setDonationResult(directData);
        handleNext();
      }
    } catch (err) {
      console.error(err);
      alert('Error initiating donation. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await api.get(`/api/donations/${donationResult.id}/certificate/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sanctuary_Steward_${donationResult.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Certification failed:', err);
      alert('Could not generate certificate. Please try again later.');
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold tracking-tight">How much would you like to give?</h2>
            <p className="text-utonga-accent font-black tracking-widest uppercase text-xs">$1 = 1 tree planted</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setAmount(String(p))}
                  className={`py-6 rounded-3xl border-2 font-black transition-all duration-300 ${Number(amount) === p ? 'border-utonga-accent bg-utonga-accent/10 text-utonga-accent shadow-[0_0_20px_rgba(255,215,0,0.1)]' : 'border-white/[0.05] bg-white/[0.02] hover:border-white/20'}`}
                >
                  <span className="text-2xl">${p}</span>
                  <span className="block text-[10px] uppercase tracking-widest font-bold opacity-60 mt-1">{p} trees</span>
                </button>
              ))}
            </div>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
              <input
                type="number"
                placeholder="Custom amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/[0.02] border-2 border-white/[0.05] rounded-[2rem] py-5 pl-12 pr-6 focus:border-utonga-accent outline-none transition-all font-bold text-lg"
              />
            </div>
            <button
              disabled={!amount || Number(amount) <= 0}
              onClick={handleNext}
              className="w-full bg-utonga-green py-5 rounded-[2rem] font-black text-lg flex items-center justify-center hover:bg-opacity-90 transition-all shadow-xl shadow-utonga-green/20 disabled:opacity-30"
            >
              Continue <ArrowRight className="ml-3" size={24} />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={handleBack} className="text-gray-500 flex items-center hover:text-white transition-colors font-bold text-sm">
              <ArrowLeft size={18} className="mr-2" /> Back
            </button>
            <h2 className="text-3xl font-bold tracking-tight">Select payment method</h2>
            <div className="space-y-3">
              {[
                { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard size={24} /> },
                { id: 'mpesa', name: 'Mobile Money (M-Pesa/Airtel/MTN)', icon: <Smartphone size={24} /> },
                { id: 'bank', name: 'Bank Transfer', icon: <Building size={24} /> },
                { id: 'qr', name: 'Scan QR Code', icon: <QrCode size={24} /> },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center w-full p-4 rounded-2xl border transition-all duration-300 ${method === m.id ? 'border-utonga-accent bg-utonga-accent/5' : 'border-white/[0.05] hover:border-white/20 bg-white/[0.02]'}`}
                >
                  <div className={`rounded-xl mr-5 bg-white/[0.05] backdrop-blur-md flex items-center justify-center w-12 h-12 border border-white/[0.05] transition-all duration-300 ${method === m.id ? 'text-utonga-accent border-utonga-accent/30 shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'text-gray-500'}`}>
                    {m.icon}
                  </div>
                  <span className={`font-bold tracking-wide transition-colors text-base ${method === m.id ? 'text-white' : 'text-gray-400'}`}>{m.name}</span>
                </button>
              ))}
            </div>
            <button
              disabled={!method}
              onClick={handleNext}
              className="w-full bg-utonga-green py-5 rounded-[2rem] font-black text-lg disabled:opacity-30 transition-all"
            >
              Continue
            </button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={handleBack} className="text-gray-500 flex items-center hover:text-white transition-colors font-bold text-sm">
              <ArrowLeft size={18} className="mr-2" /> Back
            </button>
            <h2 className="text-3xl font-bold tracking-tight">Donor Details</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 ml-4">Full Name</label>
                <input
                  type="text" placeholder="e.g. John Doe"
                  value={details.name} onChange={e => setDetails({...details, name: e.target.value})}
                  className="w-full bg-white/[0.02] border-2 border-white/[0.05] rounded-[2rem] py-5 px-6 focus:border-utonga-accent outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 ml-4">Email Address</label>
                <input
                  type="email" placeholder="e.g. john@example.com"
                  value={details.email} onChange={e => setDetails({...details, email: e.target.value})}
                  className="w-full bg-white/[0.02] border-2 border-white/[0.05] rounded-[2rem] py-5 px-6 focus:border-utonga-accent outline-none transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 ml-4">Phone Number (Required for Mobile Money)</label>
                <div className="phone-input-container">
                  <PhoneInput
                    country={'ke'}
                    value={details.phone}
                    onChange={phone => setDetails({...details, phone: '+' + phone})}
                    containerClass="!w-full"
                    inputClass="!w-full !h-[64px] !bg-white/[0.02] !border-2 !border-white/[0.05] !rounded-[2rem] !py-5 !pl-16 !pr-6 !focus:border-utonga-accent !outline-none !transition-all !font-bold !text-white !text-lg"
                    buttonClass="!bg-transparent !border-none !rounded-l-[2rem] !pl-4"
                    dropdownClass="!bg-gray-900 !border-gray-800 !text-white !rounded-2xl"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={isSubmitting || !details.name || !details.email}
              onClick={initiateDonation}
              className="w-full bg-utonga-green py-5 rounded-[2rem] font-black text-lg flex items-center justify-center hover:bg-opacity-90 transition-all shadow-xl shadow-utonga-green/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-3" size={24} /> Processing Securely...
                </>
              ) : `Donate $${amount}`}
            </button>
            <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
              Securely processed by Paystack
            </p>
          </div>
        );
      case 4:
        // Deep String Sanitization for React Stability
        const currentAmount = String(amount || '0');
        const treeCount = String(currentAmount);
        const stewardId = donationResult?.id ? String(donationResult.id) : '';
        const isWaiting = Boolean(donationResult?.is_waiting);

        if (isWaiting && !stewardId) {
          // Absolute fallback if ID is missing during polling setup
          return (
            <div className="text-center py-24">
              <Loader2 className="animate-spin mx-auto text-utonga-accent" size={48} />
              <p className="mt-4 text-white">Initializing secure session...</p>
            </div>
          );
        }

        if (isWaiting) {
          return (
            <div className="text-center py-24 space-y-8 animate-in fade-in zoom-in duration-700">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 border-4 border-utonga-accent/20 border-t-utonga-accent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-3xl font-bold text-white">Secure Payment in Progress</h2>
              <p className="text-gray-400 max-w-sm mx-auto">
                Please complete your donation in the secure payment window. This page will update automatically once verified.
              </p>
              <button
                onClick={() => fetchLiveDonationStatus(stewardId)}
                className="text-utonga-accent text-sm font-bold uppercase tracking-widest hover:underline"
              >
                Already paid? Click here to refresh
              </button>
            </div>
          );
        }

        return (
          <div className="text-center py-12 space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="flex justify-center mb-4">
              <div className="w-64 h-64 relative">
                {treeAnimation && (
                  <Lottie animationData={treeAnimation} loop={false} className="w-full h-full" />
                )}
                <div className="absolute inset-0 bg-utonga-accent/10 blur-3xl -z-10 rounded-full"></div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Welcome, <span className="text-utonga-accent italic">Sanctuary Steward.</span>
              </h2>
              <div className="text-gray-400 max-w-md mx-auto text-lg">
                Your contribution has taken root. You just planted
                <span className="text-white font-bold px-2">{treeCount} indigenous {Number(treeCount) === 1 ? 'tree' : 'trees'}</span>
                in the heart of Utonga.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button
                onClick={() => handleDownloadCertificate()}
                disabled={!stewardId || isWaiting}
                className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black hover:bg-gray-100 transition-all group w-full sm:w-auto disabled:opacity-50"
              >
                <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                Download Certificate
              </button>
              <button
                onClick={() => {
                  const text = `I just became a Sanctuary Steward at Utonga Conservation by planting ${treeCount} trees! 🐆🌍 Join the mission:`;
                  const url = window.location.origin;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                }}
                className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black border border-gray-800 hover:border-gray-700 transition-all w-full sm:w-auto"
              >
                <Share2 size={20} />
                Share Impact
              </button>
            </div>

            <div className="pt-12">
              <Link
                to="/explore"
                className="text-utonga-accent font-bold hover:underline flex items-center justify-center gap-2"
              >
                See your impact in the Gallery <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-black selection:bg-utonga-accent selection:text-black">
      <div className="max-w-xl mx-auto px-6">
        {/* Progress Bar */}
        <div className="flex gap-3 mb-16 px-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= i ? 'bg-utonga-accent shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'bg-white/[0.05]'}`}></div>
          ))}
        </div>

        <style>{`
          .phone-input-container .react-tel-input .selected-flag {
            background: transparent !important;
            padding-left: 12px !important;
          }
          .phone-input-container .react-tel-input .country-list {
            background-color: #0F172A !important;
            border: 1px solid rgba(255,255,255,0.05) !important;
            border-radius: 1rem !important;
            margin-top: 10px !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
          }
          .phone-input-container .react-tel-input .country-list .country:hover {
            background-color: rgba(255,255,255,0.02) !important;
          }
          .phone-input-container .react-tel-input .country-list .country.highlight {
            background-color: rgba(135, 166, 110, 0.1) !important;
          }
        `}</style>

        {renderStep()}
      </div>
    </div>
  );
};

export default DonationFlow;