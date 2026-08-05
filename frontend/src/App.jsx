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
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';

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

const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-utonga-dark text-white">
    <Navbar />
    <main>{children}</main>
    <Footer />
    <ScrollToTopButton />
  </div>
);

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
