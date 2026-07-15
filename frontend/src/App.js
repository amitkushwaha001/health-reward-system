import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, Footer } from './components/Shared';

// Pages
import { Register, Login } from './pages/AuthPages';
import { Dashboard } from './pages/Dashboard';
import { StepsPage } from './pages/Steps';
import { RewardsPage, RedemptionHistory } from './pages/Rewards';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';
import {
  AdminDashboard,
  AdminUsers,
  AdminRewards,
  AdminReports,
} from './pages/AdminPages';

// Styles
import './styles/index.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Main Layout Component
const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();

  if (!user) {
    return children;
  }

  return (
    <>
      <Header user={user} onLogout={() => {
        logout();
        window.location.href = '/login';
      }} />
      <main>{children}</main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />

        {/* Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/steps"
          element={
            <ProtectedRoute>
              <StepsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rewards"
          element={
            <ProtectedRoute>
              <RewardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/redemption-history"
          element={
            <ProtectedRoute>
              <RedemptionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rewards"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminRewards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminReports />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '100vh' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/dashboard" className="btn btn-primary">
      Go to Dashboard
    </a>
  </div>
);

export default App;
