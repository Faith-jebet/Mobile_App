// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://zrurqlijkaldodxnpwrp.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydXJxbGlqa2FsZG9keG5wd3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3OTA3NjEsImV4cCI6MjA1NzM2Njc2MX0.62zpldw_W6WDPi8qQAjDK_Yq2d6F3BP85U00Gm7ubQM";

// Add this check to prevent server-side initialization with AsyncStorage
const initSupabase = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Client-side initialization
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } else {
    // Server-side initialization without AsyncStorage
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
};

export const supabase = initSupabase();