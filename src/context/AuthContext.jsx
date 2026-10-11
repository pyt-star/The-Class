
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

function formatUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Customer",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check the existing Supabase session and listen for auth changes.
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(formatUser(session?.user ?? null));
        setLoading(false);
      }
    });

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          setUser(formatUser(data.session?.user ?? null));
        }
      } catch (error) {
        console.error("Unable to check login session:", error);

        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // LOGIN
  const login = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setUser(formatUser(data.user));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Unable to sign in. Please try again.",
      };
    }
  }, []);

  // REGISTER
  const register = useCallback(async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If email confirmation is enabled, the user may not
      // have a session until they confirm their email.
      if (data.session && data.user) {
        setUser(formatUser(data.user));

        return { success: true, needsEmailConfirmation: false };
      }

      setUser(null);

      return {
        success: true,
        needsEmailConfirmation: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Registration failed. Please try again.",
      };
    }
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    setUser(null);

    return { success: true };
  }, []);

  // USER INITIAL
  const userInitial = user
    ? (user.name || user.email || "A").trim()[0].toUpperCase()
    : "";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        userInitial,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
