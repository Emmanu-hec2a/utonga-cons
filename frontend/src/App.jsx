import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DonationFlow from './pages/DonationFlow';
import ExploreHub from './pages/ExploreHub';
import Roadmap from './pages/Roadmap';
import Visit from './pages/Visit';
import Partner from './pages/Partner';
import GetInvolved from './pages/GetInvolved';
import Legal from './pages/Legal';
import VerificationPortal from './pages/VerificationPortal';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import UtongaAssistant from './components/UtongaAssistant';
import WeatherPulse from './components/WeatherPulse';
import { useState } from 'react';

// Staff Pages
import StaffLogin from './pages/Staff/Login';
import StaffDashboard from './pages/Staff/Dashboard';
import ChangePassword from './pages/Staff/ChangePassword';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/staff/login" />;
  if (user.needsPasswordChange) return <Navigate to="/staff/change-password" />;
  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

const MainLayout = ({ children }) => {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-utonga-dark text-white">
      <Navbar />
      <main>{children}</main>
      <Footer />

      {/* Cinematic Sanctuary Hub (Stacked Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-center gap-4 pointer-events-none">
        <div className="pointer-events-auto">
          <WeatherPulse variant="pill" />
        </div>
        <div className="relative pointer-events-auto">
          <UtongaAssistant isOpen={isAiOpen} setIsOpen={setIsAiOpen} />
        </div>
        <div className="pointer-events-auto">
          <ScrollToTopButton />
        </div>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Visitor Routes */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/give" element={<MainLayout><DonationFlow /></MainLayout>} />
      <Route path="/roadmap" element={<MainLayout><Roadmap /></MainLayout>} />
      <Route path="/explore" element={<MainLayout><ExploreHub /></MainLayout>} />
      <Route path="/explore/visit" element={<MainLayout><Visit /></MainLayout>} />
      <Route path="/explore/partner" element={<MainLayout><Partner /></MainLayout>} />
      <Route path="/explore/get-involved" element={<MainLayout><GetInvolved /></MainLayout>} />
      <Route path="/verify/:donationId" element={<MainLayout><VerificationPortal /></MainLayout>} />

      {/* Staff Routes - Completely Separate */}
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/staff/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/staff/dashboard/*" element={
        <ProtectedRoute>
          <StaffDashboard />
        </ProtectedRoute>
      } />

      {/* Redirect old admin paths */}
      <Route path="/admin/*" element={<Navigate to="/staff/login" />} />

      {/* Legal Routes */}
      <Route path="/privacy" element={<Legal />} />
      <Route path="/terms" element={<Legal />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
