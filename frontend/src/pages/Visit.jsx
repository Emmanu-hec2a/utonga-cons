import { useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, Compass, MapPin, Phone } from 'lucide-react';
import api from '../api';

const initialForm = {
  visit_type: 'day_visit',
  date: '',
  party_size: '2',
  contact_name: '',
  contact_phone: '',
  internal_notes: '',
};

const Visit = () => {
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
      await api.post('/api/bookings/', {
        visit_type: form.visit_type,
        date: form.date,
        party_size: Number(form.party_size),
        contact_name: form.contact_name,
        contact_phone: form.contact_phone,
        internal_notes: form.internal_notes,
      });

      setMessage({
        type: 'success',
        text: 'Your request has been received. We will confirm availability and follow up shortly.',
      });
      setForm(initialForm);
    } catch (error) {
      const detail = error?.response?.data;
      const errorText = detail && typeof detail === 'object'
        ? Object.values(detail).flat().join(' ')
        : 'We could not submit your request right now. Please try again.';

      setMessage({ type: 'error', text: errorText });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <div>
            <div className="inline-flex items-center rounded-full border border-utonga-accent/30 bg-utonga-accent/10 px-3 py-1 text-sm font-semibold text-utonga-accent mb-6 shadow-sm">
              <Compass size={16} className="mr-2" />
              Explore Utonga in person
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
              Visit the wetland sanctuary and book a memorable stay.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl font-normal">
              Step onto the lakeside trails, enjoy guided wildlife viewing, and settle into a calm overnight experience shaped around conservation and community.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5 shadow-lg transition-colors hover:border-white/[0.15]">
                <div className="flex items-center text-utonga-accent mb-3">
                  <MapPin size={18} className="mr-2" />
                  <span className="font-semibold text-white">What to expect</span>
                </div>
                <p className="text-gray-400 text-sm font-normal leading-relaxed">
                  Scenic walks, birding routes, lakeside camping, and flexible day-visit options for families and groups.
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5 shadow-lg transition-colors hover:border-white/[0.15]">
                <div className="flex items-center text-utonga-accent mb-3">
                  <Phone size={18} className="mr-2" />
                  <span className="font-semibold text-white">Booking support</span>
                </div>
                <p className="text-gray-400 text-sm font-normal leading-relaxed">
                  We recommend advance booking for weekends and school holidays so we can prepare your arrival well.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl p-6 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4">Why visitors love Utonga</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle2 size={18} className="mr-3 mt-1 text-utonga-accent" />
                    <span className="text-base font-normal leading-relaxed">Guided wetland and garden experiences that connect guests to local ecology.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 size={18} className="mr-3 mt-1 text-utonga-accent" />
                    <span className="text-base font-normal leading-relaxed">Comfortable, low-impact overnight stays with a strong conservation focus.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 size={18} className="mr-3 mt-1 text-utonga-accent" />
                    <span className="text-base font-normal leading-relaxed">A calm setting for reflection, wildlife watching, and community-led hospitality.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.1] bg-white/[0.02] backdrop-blur-2xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center text-utonga-accent font-semibold uppercase tracking-[0.2em] text-xs mb-3">
              <CalendarDays size={16} className="mr-2" />
              Reserve your visit
            </div>
            <h2 className="text-3xl font-bold mb-2">Start your booking request</h2>
            <p className="text-gray-400 mb-6">
              Share your preferred experience and arrival details. We will confirm availability and reach out to help you plan.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">Visit type</label>
                <select
                  name="visit_type"
                  value={form.visit_type}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/[0.1] bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                >
                  <option value="day_visit">Day visit</option>
                  <option value="camp">Camping</option>
                  <option value="tour">Guided tour</option>
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2">Preferred date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/[0.1] bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2">Party size</label>
                  <input
                    type="number"
                    name="party_size"
                    min="1"
                    value={form.party_size}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/[0.1] bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">Your name</label>
                <input
                  type="text"
                  name="contact_name"
                  value={form.contact_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-white/[0.1] bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                  placeholder="Amina Kato"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">Phone number</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={form.contact_phone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-white/[0.1] bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                  placeholder="+256 700 000000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">Notes</label>
                <textarea
                  name="internal_notes"
                  value={form.internal_notes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-2xl border border-white/[0.1] bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                  placeholder="Tell us about your group, accessibility needs, or arrival time."
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
                {isSubmitting ? 'Submitting request...' : 'Send booking request'}
                <ArrowRight size={18} className="ml-2" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visit;
