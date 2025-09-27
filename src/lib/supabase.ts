import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Create Supabase client with TypeScript support
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper functions for common operations
export const auth = supabase.auth;

// Database table helpers
export const tables = {
  users: () => supabase.from('users'),
  borrowedItems: () => supabase.from('borrowed_items'),
  lentItems: () => supabase.from('lent_items'),
  groups: () => supabase.from('groups'),
  groupMembers: () => supabase.from('group_members'),
};

// Storage helpers
export const storage = {
  itemImages: supabase.storage.from('item-images'),
  avatars: supabase.storage.from('avatars'),
};

// Real-time subscription helpers
export const subscriptions = {
  borrowedItems: (userId: string, callback: (payload: any) => void) =>
    supabase
      .channel('borrowed_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'borrowed_items',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe(),

  lentItems: (userId: string, callback: (payload: any) => void) =>
    supabase
      .channel('lent_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lent_items',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe(),

  groups: (userId: string, callback: (payload: any) => void) =>
    supabase
      .channel('groups_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups',
        },
        callback
      )
      .subscribe(),
};

// Error handling helper
export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred. Please try again.';
};

// Authentication helpers
export const authHelpers = {
  signUp: async (email: string, password: string, name?: string) => {
    const { data, error } = await auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signInWithGoogle: async () => {
    const { data, error } = await auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await auth.signOut();
    return { error };
  },

  resetPassword: async (email: string) => {
    const { data, error } = await auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  },

  updatePassword: async (password: string) => {
    const { data, error } = await auth.updateUser({
      password,
    });
    return { data, error };
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await auth.getUser();
      // Handle session missing as normal (not an error for logged out users)
      if (error && (error.message?.includes('session missing') || error.message?.includes('Auth session missing'))) {
        return { user: null, error: null };
      }
      return { user, error };
    } catch (err) {
      // Handle any other errors
      return { user: null, error: err };
    }
  },

  getCurrentSession: async () => {
    const { data: { session }, error } = await auth.getSession();
    return { session, error };
  },
};

export default supabase;
