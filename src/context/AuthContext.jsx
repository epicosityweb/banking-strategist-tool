import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getSession, getCurrentUser, signIn, signUp, signOut } from '../lib/supabase';

/**
 * AuthContext
 *
 * Provides authentication state and methods throughout the application.
 * Manages user session, login/logout, and automatic session persistence.
 *
 * Usage:
 * ```jsx
 * import { useAuth } from '../context/AuthContext';
 *
 * function MyComponent() {
 *   const { user, loading, signIn, signOut } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Please log in</div>;
 *
 *   return <div>Welcome {user.email}!</div>;
 * }
 * ```
 */

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    // Check for existing session
    checkUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Check for existing authenticated user
   * First checks for a valid session, then gets user if session exists
   */
  async function checkUser() {
    try {
      setLoading(true);
      setError(null);

      // First check if we have a valid session
      const { session, error: sessionError } = await getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        setError(sessionError.message);
        setUser(null);
        return;
      }

      // If no session, user is not logged in (this is not an error)
      if (!session) {
        setUser(null);
        return;
      }

      // If we have a session, get the user
      const { user: currentUser, error: userError } = await getCurrentUser();

      if (userError) {
        console.error('Error checking user:', userError);
        setError(userError.message);
        setUser(null);
      } else {
        setUser(currentUser);
        setError(null);
      }
    } catch (err) {
      console.error('Error in checkUser:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Sign in with email and password
   */
  async function handleSignIn(email, password) {
    try {
      setLoading(true);
      setError(null);

      const { user: signedInUser, error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message);
        return { success: false, error: signInError.message };
      }

      setUser(signedInUser);
      return { success: true, user: signedInUser };
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Sign up with email and password
   */
  async function handleSignUp(email, password, metadata = {}) {
    try {
      setLoading(true);
      setError(null);

      const { user: newUser, error: signUpError } = await signUp(email, password);

      if (signUpError) {
        setError(signUpError.message);
        return { success: false, error: signUpError.message };
      }

      // Note: User might need to confirm email depending on Supabase settings
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Sign out the current user
   */
  async function handleSignOut() {
    try {
      setLoading(true);
      setError(null);

      const { error: signOutError } = await signOut();

      if (signOutError) {
        setError(signOutError.message);
        return { success: false, error: signOutError.message };
      }

      setUser(null);
      return { success: true };
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Clear error state
   */
  function clearError() {
    setError(null);
  }

  const value = {
    user,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
