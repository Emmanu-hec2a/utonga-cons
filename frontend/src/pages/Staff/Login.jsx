import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const StaffLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(username, password);
      if (data.needs_password_change) {
        navigate('/staff/change-password');
      } else {
        navigate('/staff/dashboard');
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full bg-gray-900 p-10 rounded-3xl border border-gray-800 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-tighter text-white">
            UTONGA<span className="text-utonga-accent">.</span> STAFF
          </h1>
          <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest font-bold">Secure Access</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-utonga-accent transition-colors"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-utonga-accent transition-colors"
              required
            />
          </div>
          <button className="w-full bg-utonga-accent text-utonga-dark font-black py-4 rounded-xl hover:opacity-90 transition-opacity">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffLogin;
