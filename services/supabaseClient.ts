
import { createClient } from '@supabase/supabase-js';

// Configuration for Supabase
// Use environment variables for security and flexiblity
const getValidUrl = (url?: string) => {
    try {
        if (url && url.trim() !== '') {
            let u = url.trim();
            if (!u.startsWith('http://') && !u.startsWith('https://')) {
                u = 'https://' + u;
            }
            new URL(u);
            return u;
        }
    } catch(e) {
        // Invalid URL
    }
    return 'https://gzsgxutwrvqsaefbwlda.supabase.co';
};

const supabaseUrl = getValidUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.trim() !== '' 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY.trim() 
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6c2d4dXR3cnZxc2FlZmJ3bGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDQ2NDIsImV4cCI6MjA4NTYyMDY0Mn0.IG6evi2-ECMoaaXVFzdZsDsSshCwpEhLfzJaEPzdPSM';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
    return !!supabase;
};
