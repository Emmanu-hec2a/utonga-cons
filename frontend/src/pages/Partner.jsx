import { useState } from 'react';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Handshake, Mail } from 'lucide-react';
import api from '../api';

const initialForm = {
  org_name: '',
  contact_name: '',
  contact_email: '',
  type: 'tour_operator',
  message: '',
  notes: '',
};

const Partner = () => {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/api/partner-leads/', {
        org_name: form.org_name,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        type: form.type,
        message: form.message,
        notes: form.notes,
      });

      setMessage({
        type: 'success',
        text: 'Thank you. We will review your inquiry and follow up with the right next step.',
      });
      setForm(initialForm);
    } catch (error) {
      const detail = error?.response?.data;
      const errorText = detail && typeof detail === 'object'
        ? Object.values(detail).flat().join(' ')
        : 'We could not submit your inquiry right now. Please try again.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
          <div>
            <div className="inline-flex items-center rounded-full border border-utonga-accent/30 bg-utonga-accent/10 px-3 py-1 text-sm font-semibold text-utonga-accent mb-6">
              <Handshake size={16} className="mr-2" />
              Shape the next chapter of Utonga
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Partner with us to grow conservation tourism responsibly.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl">
              We collaborate with tour operators, diaspora networks, and impact-minded investors to build a place that is welcoming, measurable, and community-led.
            </p>

            <div className="rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-950 via-gray-900 to-black p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">What partnership looks like</h2>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <CheckCircle2 size={18} className="mr-3 mt-1 text-utonga-accent" />
                  Strategic support for visitor experiences, hospitality, and conservation programming.
                </li>
                <li className="flex items-start">
                  <CheckCircle2 size={18} className="mr-3 mt-1 text-utonga-accent" />
                  Shared planning for tours, community engagement, and responsible growth.
                </li>
                <li className="flex items-start">
                  <CheckCircle2 size={18} className="mr-3 mt-1 text-utonga-accent" />
                  Long-term collaboration with transparency and measurable impact.
                </li>
              </ul>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-5">
                <div className="flex items-center text-utonga-accent mb-3">
                  <BriefcaseBusiness size={18} className="mr-2" />
                  <span className="font-semibold">For operators</span>
                </div>
                <p className="text-gray-400 text-sm">Design immersive visitor routes and cultural experiences with local guidance.</p>
              </div>
              <div className="rounded-2xl border border-gray-800 bg-gray-950/70 p-5">
                <div className="flex items-center text-utonga-accent mb-3">
                  <Mail size={18} className="mr-2" />
                  <span className="font-semibold">For supporters</span>
                </div>
                <p className="text-gray-400 text-sm">Discuss funding, community programs, or future development opportunities.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-950/90 p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-2">Start a partnership inquiry</h2>
            <p className="text-gray-400 mb-6">
              Tell us what kind of collaboration you are exploring and we will connect you with the right team.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">I am reaching as a</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-800 bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                >
                  <option value="tour_operator">Tour operator</option>
                  <option value="investor">Investor</option>
                  <option value="diaspora">Diaspora community</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">Organization name</label>
                <input
                  type="text"
                  name="org_name"
                  value={form.org_name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-800 bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                  placeholder="Your organization"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2">Contact name</label>
                  <input
                    type="text"
                    name="contact_name"
                    value={form.contact_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-gray-800 bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                    placeholder="Amina Kato"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2">Email address</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={form.contact_email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-gray-800 bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">How would you like to collaborate?</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full rounded-2xl border border-gray-800 bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                  placeholder="Share your idea, goals, or the kind of partnership you are exploring."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">Additional notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-2xl border border-gray-800 bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                  placeholder="Optional context such as timelines or audience details."
                />
              </div>

              {message.text ? (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${message.type === 'success' ? 'border-emerald-700 bg-emerald-950/60 text-emerald-300' : 'border-red-800 bg-red-950/60 text-red-300'}`}>
                  {message.text}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-2xl bg-utonga-accent px-4 py-3 font-semibold text-utonga-dark transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Sending inquiry...' : 'Send partnership inquiry'}
                <ArrowRight size={18} className="ml-2" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partner;
