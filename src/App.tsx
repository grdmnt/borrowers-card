import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Layout/Header';
import Dashboard from '@/pages/Dashboard';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import BorrowedItemsPage from '@/pages/BorrowedItemsPage';
import LentItemsPage from '@/pages/LentItemsPage';
import GroupsPage from '@/pages/GroupsPage';
import JoinGroupPage from '@/pages/JoinGroupPage';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

const AppContent: React.FC = () => {
  const { user, signOut, loading, error } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
          <div>Loading Borrower's Card...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-error)',
        fontFamily: 'var(--font-primary)'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <div style={{ marginBottom: '1rem' }}>{error}</div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-surface)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/auth';
  const isInvitePage = location.pathname.startsWith('/join-group/');
  
  // For invite pages, show navigation only if user is authenticated
  const shouldShowNavigation = isInvitePage ? !!user : !isAuthPage;

  return (
    <div className="app">
      <Header user={user} onSignOut={signOut} showNavigation={shouldShowNavigation} />
      
      <main>
        <Routes>
          {/* Public routes (redirect to dashboard if authenticated) */}
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          } />
          
          <Route path="/register" element={
            <ProtectedRoute requireAuth={false}>
              <RegisterPage />
            </ProtectedRoute>
          } />
          
          {/* Alias for auth - both routes show the same unified form */}
          <Route path="/auth" element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          } />
          
          {/* Protected routes (require authentication) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="/borrowed" element={
            <ProtectedRoute>
              <div style={{ padding: '2rem' }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  minHeight: '60vh',
                  textAlign: 'center',
                  gap: '1rem'
                }}>
                  <BorrowedItemsPage />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/lent" element={
            <ProtectedRoute>
              <LentItemsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/groups" element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          } />

          {/* Join Group via invite link - accessible to everyone */}
          <Route path="/join-group/:groupId" element={<JoinGroupPage />} />
          
          {/* Default route - redirect based on auth status */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
          
          {/* Catch all route */}
          <Route path="*" element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
