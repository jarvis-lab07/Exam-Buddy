'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isConfigured: false,
  signOut: async () => {},
  refreshSession: async () => {},
});

const createDemoUser = (profileData: any): User => {
  const email = profileData?.email || 'student@campus.edu';
  const name = profileData?.name || profileData?.full_name || 'Student User';
  return {
    id: 'demo-user-id',
    app_metadata: { provider: 'demo' },
    user_metadata: {
      full_name: name,
      ...profileData,
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email,
    phone: '',
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  } as User;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  const supabase = createClient();

  const loadDemoUser = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('exambuddy_cohort_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(createDemoUser(parsed));
          return true;
        } catch {}
      }
    }
    return false;
  };

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const configured = Boolean(url && !url.includes('placeholder'));
    setIsConfigured(configured);

    if (!configured) {
      loadDemoUser();
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
      } else {
        loadDemoUser();
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          setUser(session.user);
        } else {
          loadDemoUser();
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('exambuddy_cohort_user');
    }
    setUser(null);
    setSession(null);
  };

  const refreshSession = async () => {
    if (isConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        return;
      }
    }
    loadDemoUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

