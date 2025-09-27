import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { authHelpers, supabase } from '@/lib/supabase';
import type { AuthUser, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Supabase User to AuthUser
  const convertUser = (supabaseUser: User | null): AuthUser | null => {
    if (!supabaseUser) return null;
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || '',
      avatar_url: supabaseUser.user_metadata?.avatar_url,
    };
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user: currentUser, error: userError } = await authHelpers.getCurrentUser();
        
        if (userError) {
          console.error('Error getting current user:', userError);
          // Don't set error for session missing - this is normal for logged out users
          const errorMessage = userError && typeof userError === 'object' && 'message' in userError ? String(userError.message) : String(userError);
          if (!errorMessage.includes('session missing') && !errorMessage.includes('Auth session missing')) {
            setError('Failed to authenticate user');
          }
        } else {
          setUser(convertUser(currentUser));
        }
      } catch (err) {
        console.error('Authentication initialization error:', err);
        // Only set error for actual system failures, not missing sessions
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (!errorMessage.includes('session missing') && !errorMessage.includes('Auth session missing')) {
          setError('Authentication system unavailable');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(convertUser(session.user));
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(convertUser(session.user));
        } else if (event === 'USER_UPDATED' && session?.user) {
          setUser(convertUser(session.user));
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Google OAuth is handled by Supabase UI component
  // No need for manual sign in/up methods

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await authHelpers.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setError('Failed to sign out');
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  // Password reset not needed with Google-only auth

  const refreshUser = async () => {
    try {
      const { user: currentUser, error } = await authHelpers.getCurrentUser();
      
      if (error) {
        console.error('Error refreshing user:', error);
        setError('Failed to refresh user data');
      } else {
        setUser(convertUser(currentUser));
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      setError('Failed to refresh user data');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
