import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Building, QrCode, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import PhoneInputPkg from 'react-phone-input-2';
const PhoneInput = PhoneInputPkg.default || PhoneInputPkg;
import 'react-phone-input-2/lib/style.css';
import api from '../api';

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
      setStep(4);
      fetchLiveDonationStatus(id);
    }
  }, [searchParams]);

  const fetchLiveDonationStatus = async (id) => {
    setIsLoadingStatus(true);
    try {
      const res = await api.get(`/api/donations/${id}/status/`);
      setDonationResult(res.data);
      setAmount(String(res.data.amount));
      setMethod(res.data.method);
      setDetails({
        name: res.data.donor_name,
        email: res.data.donor_email,
        phone: ''
      });
    } catch (err) {
      console.error('Error fetching live status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const presets = [10, 25, 50, 100];

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const initiateDonation = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/donations/initiate/', {
        amount: Number(amount),
        method,
        donor_name: details.name,
        donor_email: details.email,
        phone_number: details.phone // This is the full +prefix number
      });

      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        setDonationResult(res.data);
        handleNext();
      }
    } catch (err) {
      console.error(err);
      alert('Error initiating donation. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        return (
          <div className="text-center space-y-10 py-12 animate-in zoom-in duration-500">
            <div className="flex justify-center">
              <div className="w-28 h-28 bg-utonga-green/10 rounded-full flex items-center justify-center relative border border-utonga-green/20">
                <CheckCircle size={56} className="text-utonga-green" />
                {isLoadingStatus && (
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Loader2 size={72} className="text-utonga-green animate-spin opacity-50" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-5xl font-black tracking-tight mb-4">Thank you{donationResult?.donor_name ? `, ${donationResult.donor_name.split(' ')[0]}` : ''}!</h2>
              <p className="text-xl text-gray-400 font-medium">You just planted <span className="text-white font-black">{donationResult?.amount || amount} trees</span> in Utonga.</p>
            </div>

            <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/[0.05] text-left space-y-6 backdrop-blur-3xl shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/[0.05] pb-6">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Amount</span>
                <span className="text-2xl font-black text-utonga-accent">${donationResult?.amount || amount}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/[0.05] pb-6">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Method</span>
                <span className="font-black uppercase tracking-wider bg-white/[0.05] px-3 py-1 rounded-lg text-xs">{donationResult?.method || method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Transaction ID</span>
                <span className="font-mono text-sm text-gray-400">UTG-{donationResult?.id || searchParams.get('id')}</span>
              </div>
            </div>

            <div className="flex flex-col gap-5 pt-4">
              <button className="w-full bg-[#1DA1F2] hover:bg-opacity-90 py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-[#1DA1F2]/20">Share on Social Media</button>
              <Link to="/" className="w-full py-5 rounded-[2rem] font-black text-lg border-2 border-white/[0.05] hover:bg-white/5 transition-all">Return to Sanctuary</Link>
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
