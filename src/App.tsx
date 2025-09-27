import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Dashboard from '@/pages/Dashboard';
import { authHelpers } from '@/lib/supabase';
import type { AuthUser } from '@/types';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user: currentUser, error: userError } = await authHelpers.getCurrentUser();
        
        if (userError) {
          console.error('Error getting current user:', userError);
          setError('Failed to authenticate user');
        } else if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.user_metadata?.name || '',
            avatar_url: currentUser.user_metadata?.avatar_url,
          });
        }
      } catch (err) {
        console.error('Authentication initialization error:', err);
        setError('Authentication system unavailable');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authHelpers.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            avatar_url: session.user.user_metadata?.avatar_url,
          });
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await authHelpers.signOut();
      
      if (signOutError) {
        console.error('Error signing out:', signOutError);
        setError('Failed to sign out');
      } else {
        setUser(null);
        setError(null);
      }
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Sign out failed');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Router>
      <div className="app">
        <Header user={user} onSignOut={handleSignOut} />
        
        <main>
          <Routes>
            {/* Default route - redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard route */}
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            
            {/* Placeholder routes for future implementation */}
            <Route path="/borrowed" element={
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center',
                backgroundColor: 'var(--color-background)',
                minHeight: 'calc(100vh - 80px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div>
                  <h2>Borrowed Items</h2>
                  <p>This page will show your borrowed items.</p>
                </div>
              </div>
            } />
            
            <Route path="/lent" element={
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center',
                backgroundColor: 'var(--color-background)',
                minHeight: 'calc(100vh - 80px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div>
                  <h2>Lent Items</h2>
                  <p>This page will show your lent items.</p>
                </div>
              </div>
            } />
            
            <Route path="/groups" element={
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center',
                backgroundColor: 'var(--color-background)',
                minHeight: 'calc(100vh - 80px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div>
                  <h2>Groups</h2>
                  <p>This page will show your groups.</p>
                </div>
              </div>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
