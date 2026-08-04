import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { changePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await changePassword(newPassword, confirmPassword);
      navigate('/staff/dashboard');
    } catch (err) {
      setError('Failed to update password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full bg-gray-900 p-10 rounded-3xl border border-gray-800">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ShieldAlert size={48} className="text-utonga-accent" />
          </div>
          <h2 className="text-2xl font-bold">First-time Login</h2>
          <p className="text-gray-400 mt-2 text-sm">Please update your temporary password to continue.</p>
        </div>

        {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-black border border-gray-800 rounded-xl py-4 px-4 outline-none focus:border-utonga-accent"
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-black border border-gray-800 rounded-xl py-4 px-4 outline-none focus:border-utonga-accent"
            required
          />
          <button className="w-full bg-utonga-green text-white font-bold py-4 rounded-xl">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
