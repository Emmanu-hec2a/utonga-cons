import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Building, QrCode, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

import cardLogo from '../assets/payment-methods/card-logo.png';
import mpesaLogo from '../assets/payment-methods/M-PESA-logo-2.png';
import transferLogo from '../assets/payment-methods/tranfer-logo.jpg';
import qrLogo from '../assets/payment-methods/qr-logo.png';

const DonationFlow = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(25);
  const [method, setMethod] = useState('');
  const [details, setDetails] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donationResult, setDonationResult] = useState(null);

  useEffect(() => {
    const status = searchParams.get('status');
    const id = searchParams.get('id');
    if (status === 'success' && id) {
      setStep(4);
      setDonationResult({ donation_id: id });
    }
  }, [searchParams]);

  const presets = [10, 25, 50, 100];

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const initiateDonation = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/donations/initiate/', {
        amount,
        method,
        donor_name: details.name,
        donor_email: details.email,
        phone_number: details.phone
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
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">How much would you like to give?</h2>
            <p className="text-utonga-accent font-bold">$1 = 1 tree planted</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`py-4 rounded-xl border-2 font-bold transition-all ${amount === p ? 'border-utonga-accent bg-utonga-accent text-utonga-dark' : 'border-gray-800 hover:border-gray-600'}`}
                >
                  ${p}
                  <span className="block text-xs font-normal opacity-70">{p} trees</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                placeholder="Custom amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-gray-900 border-2 border-gray-800 rounded-xl py-4 pl-8 pr-4 focus:border-utonga-green outline-none"
              />
            </div>
            <button onClick={handleNext} className="w-full bg-utonga-green py-4 rounded-xl font-bold text-lg flex items-center justify-center">
              Continue <ArrowRight className="ml-2" size={20} />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <button onClick={handleBack} className="text-gray-500 flex items-center hover:text-white mb-4">
              <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-3xl font-bold">Select payment method</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'card', name: 'Credit / Debit Card', img: cardLogo },
                { id: 'mpesa', name: 'M-Pesa / Mobile Money', img: mpesaLogo },
                { id: 'bank', name: 'Bank Transfer', img: transferLogo },
                { id: 'qr', name: 'Scan QR Code', img: qrLogo },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center p-5 rounded-2xl border transition-all duration-300 ${method === m.id ? 'border-utonga-accent bg-utonga-accent/5' : 'border-white/[0.08] hover:border-white/20 bg-white/[0.02]'}`}
                >
                  <div className={`rounded-xl mr-5 bg-white/[0.05] backdrop-blur-md flex items-center justify-center overflow-hidden w-20 h-12 border border-white/[0.05] transition-transform duration-300 ${method === m.id ? 'scale-105 border-utonga-accent/30' : ''}`}>
                    <img src={m.img} alt={m.name} className="w-full h-full object-contain p-1.5" />
                  </div>
                  <span className={`font-bold transition-colors ${method === m.id ? 'text-white' : 'text-gray-400'}`}>{m.name}</span>
                </button>
              ))}
            </div>
            <button
              disabled={!method}
              onClick={handleNext}
              className="w-full bg-utonga-green py-4 rounded-xl font-bold text-lg disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <button onClick={handleBack} className="text-gray-500 flex items-center hover:text-white mb-4">
              <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-3xl font-bold">Your Details</h2>
            <div className="space-y-4">
              <input
                type="text" placeholder="Full Name"
                value={details.name} onChange={e => setDetails({...details, name: e.target.value})}
                className="w-full bg-gray-900 border-2 border-gray-800 rounded-xl py-4 px-4 focus:border-utonga-green outline-none"
              />
              <input
                type="email" placeholder="Email Address"
                value={details.email} onChange={e => setDetails({...details, email: e.target.value})}
                className="w-full bg-gray-900 border-2 border-gray-800 rounded-xl py-4 px-4 focus:border-utonga-green outline-none"
              />
              {method === 'mpesa' && (
                <input
                  type="tel" placeholder="Phone Number (254... or 256...)"
                  value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})}
                  className="w-full bg-gray-900 border-2 border-gray-800 rounded-xl py-4 px-4 focus:border-utonga-green outline-none"
                />
              )}
            </div>
            <button
              disabled={isSubmitting || !details.name || !details.email}
              onClick={initiateDonation}
              className="w-full bg-utonga-green py-4 rounded-xl font-bold text-lg flex items-center justify-center"
            >
              {isSubmitting ? 'Processing...' : `Donate $${amount}`}
            </button>
          </div>
        );
      case 4:
        return (
          <div className="text-center space-y-8 py-12">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-utonga-green bg-opacity-20 rounded-full flex items-center justify-center">
                <CheckCircle size={48} className="text-utonga-green" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-4">Thank you, {details.name}!</h2>
              <p className="text-xl text-gray-400">You just planted <span className="text-white font-bold">{amount} trees</span> in Utonga.</p>
            </div>

            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 text-left space-y-4">
              <div className="flex justify-between border-b border-gray-800 pb-4">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold">${amount}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-4">
                <span className="text-gray-500">Method</span>
                <span className="font-bold uppercase">{method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono text-sm">{donationResult?.donation_id || searchParams.get('id') || 'UTG-123456'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button className="w-full bg-blue-600 py-4 rounded-xl font-bold">Share on Social Media</button>
              <button onClick={() => window.location.href = '/'} className="w-full py-4 rounded-xl font-bold border border-gray-800">Return Home</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-black">
      <div className="max-w-xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${step >= i ? 'bg-utonga-green' : 'bg-gray-800'}`}></div>
          ))}
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default DonationFlow;
