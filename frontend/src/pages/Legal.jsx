import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Legal = () => {
  const { pathname } = useLocation();
  const isPrivacy = pathname.includes('privacy');

  return (
    <div className="min-h-screen pt-32 pb-24 bg-black text-white selection:bg-utonga-accent selection:text-black">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-white transition-colors mb-12 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft size={16} className="mr-2" /> Return to Sanctuary
        </Link>

        <h1 className="text-5xl font-black tracking-tighter mb-8 italic uppercase">
          {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
        </h1>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">1. Overview</h2>
            <p>
              Utonga Conservation is committed to protecting the sitatunga botanical garden and the privacy of our global donor community.
              {isPrivacy
                ? "This policy outlines how we handle your personal data when you interact with our platform."
                : "These terms govern your use of the Utonga platform and donation services."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">2. {isPrivacy ? 'Data Collection' : 'Donations'}</h2>
            <p>
              {isPrivacy
                ? "We collect information necessary to process donations and provide updates on conservation progress. This includes your name, email, and transaction references via Paystack."
                : "All donations made to Utonga Conservation are non-refundable and contribute directly to our restoration roadmap in East Africa."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">3. Global Security</h2>
            <p>
              We use industry-standard encryption and secure payment providers (Paystack) to ensure your information is protected. We do not store full card details on our local servers.
            </p>
          </section>

          <div className="pt-12 border-t border-white/10 text-[10px] uppercase tracking-widest font-bold">
            Last Updated: August 2026 • Utonga Conservation HQ
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
