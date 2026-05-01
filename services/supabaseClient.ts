
import { createClient } from '@supabase/supabase-js';

// Configuration for Supabase
// The URL and Key are embedded directly as requested.
const supabaseUrl = 'https://gzsgxutwrvqsaefbwlda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6c2d4dXR3cnZxc2FlZmJ3bGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDQ2NDIsImV4cCI6MjA4NTYyMDY0Mn0.IG6evi2-ECMoaaXVFzdZsDsSshCwpEhLfzJaEPzdPSM';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
    return !!supabase;
};
