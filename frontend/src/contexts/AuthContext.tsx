'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { syncGoogleUserToDatabase } from '@/lib/db-service';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isDailyUnlocked: boolean;
  isSecurityModalOpen: boolean;
  unlockDailySecurity: () => void;
  relockDailySecurity: () => void;
  setIsSecurityModalOpen: (open: boolean) => void;
  loginWithGoogleDemo: (email?: string, name?: string) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isConfigured: false,
  isDailyUnlocked: false,
  isSecurityModalOpen: false,
  unlockDailySecurity: () => {},
  relockDailySecurity: () => {},
  setIsSecurityModalOpen: () => {},
  loginWithGoogleDemo: () => {},
  signOut: async () => {},
  refreshSession: async () => {},
});

const getTodayKey = (userId?: string) => {
  const today = new Date().toISOString().split('T')[0];
  return `exambuddy_daily_unlocked_${userId || 'demo'}_${today}`;
};

const createDemoUser = (profileData: any): User => {
  const email = profileData?.email || 'student@campus.edu';
  const name = profileData?.name || profileData?.full_name || 'Student User';
  const provider = profileData?.provider || 'demo';
  const avatar = profileData?.avatar || null;
  
  return {
    id: profileData?.id || 'demo-user-id',
    app_metadata: { provider },
    user_metadata: {
      full_name: name,
      avatar_url: avatar,
      provider_type: provider,
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

  // Daily Security State (Unlocked by default)
  const [isDailyUnlocked, setIsDailyUnlocked] = useState<boolean>(true);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);

  const supabase = createClient();

  const checkDailyUnlockedState = (_currentUser: User | null) => {
    setIsDailyUnlocked(true);
    setIsSecurityModalOpen(false);
  };

  const unlockDailySecurity = () => {
    setIsDailyUnlocked(true);
    setIsSecurityModalOpen(false);
  };

  const relockDailySecurity = () => {
    setIsDailyUnlocked(true);
    setIsSecurityModalOpen(false);
  };

  const loadDemoUser = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('exambuddy_cohort_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const demoUser = createDemoUser(parsed);
          setUser(demoUser);
          checkDailyUnlockedState(demoUser);
          return true;
        } catch {}
      }
    }
    return false;
  };

  const loginWithGoogleDemo = (emailInput?: string, nameInput?: string) => {
    const demoGoogleProfile = {
      email: emailInput || 'durgesh.patil@gmail.com',
      full_name: nameInput || 'Durgesh Patil (Google Verified)',
      name: nameInput || 'Durgesh Patil (Google Verified)',
      provider: 'google',
      avatar: 'https://lh3.googleusercontent.com/a/default-user',
      college: 'R. C. Patel Institute of Technology, Shirpur (RCPIT)',
      department: 'Computer Engineering',
      division: 'Div A',
      currentYear: '3rd Year',
      semester: 'Semester 5 (3rd Year)',
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('exambuddy_cohort_user', JSON.stringify(demoGoogleProfile));
    }
    const demoUser = createDemoUser(demoGoogleProfile);
    setUser(demoUser);
    checkDailyUnlockedState(demoUser);
    setIsSecurityModalOpen(true);
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
        checkDailyUnlockedState(session.user);
        syncGoogleUserToDatabase(session.user);
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
          checkDailyUnlockedState(session.user);
          syncGoogleUserToDatabase(session.user);
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
    setIsDailyUnlocked(false);
    setIsSecurityModalOpen(false);
  };

  const refreshSession = async () => {
    if (isConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        checkDailyUnlockedState(session.user);
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
        isDailyUnlocked,
        isSecurityModalOpen,
        unlockDailySecurity,
        relockDailySecurity,
        setIsSecurityModalOpen,
        loginWithGoogleDemo,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

