import { useState } from 'react';
import { ArrowRight, CheckCircle2, HeartHandshake, Mountain, Trees } from 'lucide-react';
import api from '../api';

const initialForm = {
  name: '',
  contact_email: '',
  location: '',
  skills: '',
  interest: 'volunteer',
};

const GetInvolved = () => {
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
      await api.post('/api/volunteer-signups/', {
        name: form.name,
        contact_email: form.contact_email,
        location: form.location,
        skills: form.skills,
        interest: form.interest,
      });

      setMessage({
        type: 'success',
        text: 'Thank you for stepping forward. We will contact you with the next opportunity.',
      });
      setForm(initialForm);
    } catch (error) {
      const detail = error?.response?.data;
      const errorText = detail && typeof detail === 'object'
        ? Object.values(detail).flat().join(' ')
        : 'We could not submit your signup right now. Please try again.';
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
            <div className="inline-flex items-center rounded-full border border-utonga-accent/30 bg-utonga-accent/10 px-3 py-1 text-sm font-semibold text-utonga-accent mb-6 shadow-sm">
              <HeartHandshake size={16} className="mr-2" />
              Join the movement
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
              Help restore and protect Utonga for the next generation.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl font-normal">
              Whether you want to plant, guide, learn, or lend practical skills, there is a place for you in this growing community effort.
            </p>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 shadow-xl mb-8 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4">Ways to participate</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle2 size={18} className="mr-3 mt-1 text-utonga-accent" />
                    <span className="text-base font-normal leading-relaxed">Join hiking and wetland walks that connect visitors with the landscape.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 size={18} className="mr-3 mt-1 text-utonga-accent" />
                    <span className="text-base font-normal leading-relaxed">Support restoration days with tree planting and site care.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 size={18} className="mr-3 mt-1 text-utonga-accent" />
                    <span className="text-base font-normal leading-relaxed">Share skills in education, hospitality, design, or community organizing.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-5 shadow-lg transition-colors hover:border-white/[0.15]">
                <div className="flex items-center text-utonga-accent mb-3">
                  <Mountain size={18} className="mr-2" />
                  <span className="font-semibold text-white">Hiking club</span>
                </div>
                <p className="text-gray-400 text-sm font-normal leading-relaxed">Discover the trails and learn more about the biodiversity around Lake Victoria.</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-5 shadow-lg transition-colors hover:border-white/[0.15]">
                <div className="flex items-center text-utonga-accent mb-3">
                  <Trees size={18} className="mr-2" />
                  <span className="font-semibold text-white">Volunteer crews</span>
                </div>
                <p className="text-gray-400 text-sm font-normal leading-relaxed">Join practical restoration and stewardship events throughout the year.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.1] bg-white/[0.02] backdrop-blur-2xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h2 className="text-3xl font-bold mb-2">Sign up as a volunteer</h2>
            <p className="text-gray-400 mb-6">
              Share a little about yourself and we will match you with the right opportunity.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">Interest</label>
                <select
                  name="interest"
                  value={form.interest}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/[0.1] bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                >
                  <option value="hiking_club">Hiking club</option>
                  <option value="volunteer">General volunteering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">Full name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-white/[0.1] bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                  placeholder="Moses Omondi"
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
                  className="w-full rounded-2xl border border-white/[0.1] bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-white/[0.1] bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                  placeholder="Kampala, Uganda"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2">Skills or availability</label>
                <textarea
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full rounded-2xl border border-white/[0.1] bg-black px-4 py-3 text-white outline-none focus:border-utonga-accent"
                  placeholder="Tell us what you can bring, such as guiding, photography, gardening, or weekend availability."
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
                {isSubmitting ? 'Submitting...' : 'Join the community'}
                <ArrowRight size={18} className="ml-2" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetInvolved;
