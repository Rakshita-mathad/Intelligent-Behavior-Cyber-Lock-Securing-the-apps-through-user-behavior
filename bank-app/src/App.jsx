import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BehaviorProvider } from './context/BehaviorContext';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import DemoMode from './components/auth/DemoMode';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/user/Dashboard';
import Balance from './components/user/Balance';
import Transaction from './components/user/Transaction';
import TransactionHistory from './components/user/TransactionHistory';
import Profile from './components/user/Profile';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SystemOverview from './components/admin/SystemOverview';

import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!adminOnly && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!adminOnly && !user.completedDemo && window.location.pathname !== '/demo') {
    return <Navigate to="/demo" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Demo Route */}
      <Route
        path="/demo"
        element={
          <ProtectedRoute>
            <DemoMode />
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/balance"
        element={
          <ProtectedRoute>
            <Layout>
              <Balance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transaction"
        element={
          <ProtectedRoute>
            <Layout>
              <Transaction />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <Layout>
              <TransactionHistory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/overview"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <SystemOverview />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BehaviorProvider>
          <AppRoutes />
        </BehaviorProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;