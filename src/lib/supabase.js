/**
 * Supabase Client Configuration
 *
 * Initializes and exports the Supabase client for use throughout the application.
 * Credentials are loaded from environment variables (see .env.local).
 */

import { createClient } from '@supabase/supabase-js';

// Get configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Auto-refresh session
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session from URL (for magic links, OAuth, etc.)
    detectSessionInUrl: true,
  },
});

/**
 * Get the current session
 * @returns {Promise<{session: Session | null, error: Error | null}>}
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session || null, error };
}

/**
 * Get the current authenticated user
 * Checks for valid session first before fetching user
 * @returns {Promise<{user: User | null, error: Error | null}>}
 */
export async function getCurrentUser() {
  // First check if we have a valid session
  const { session, error: sessionError } = await getSession();

  if (sessionError) {
    return { user: null, error: sessionError };
  }

  if (!session) {
    return { user: null, error: null };
  }

  // If we have a session, get the user
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user || null, error };
}

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: User | null, error: Error | null}>}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data?.user || null, error };
}

/**
 * Sign up with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: User | null, error: Error | null}>}
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { user: data?.user || null, error };
}

/**
 * Sign out the current user
 * @returns {Promise<{error: Error | null}>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Listen for authentication state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Object} Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
