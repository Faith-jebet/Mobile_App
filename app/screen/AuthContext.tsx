// AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session } from '@supabase/supabase-js';

interface AuthData {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthData>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkUser();
    
    // Set up a subscription to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
        
        if (newSession) {
          try {
            await AsyncStorage.setItem('supabase_session', JSON.stringify(newSession));
          } catch (error) {
            console.error('Error storing session:', error);
          }
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  async function checkUser() {
    try {
      // Try to get session from Supabase
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      // If no session in Supabase, try to get from AsyncStorage
      if (!currentSession) {
        const storedSession = await AsyncStorage.getItem('supabase_session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          // Restore the session
          await supabase.auth.setSession(sessionData);
          
          // Get session again after restoration
          const { data: { session: restoredSession } } = await supabase.auth.getSession();
          setSession(restoredSession);
          setUser(restoredSession?.user ?? null);
        }
      } else {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('supabase_session');
      await AsyncStorage.removeItem('user_data');
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  const value: AuthData = {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

