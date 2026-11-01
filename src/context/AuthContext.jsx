import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);
const VERIFIED_SESSION_KEY = "the_class_email_otp_verified_user";

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

function getVerifiedUserId() {
  try {
    return localStorage.getItem(VERIFIED_SESSION_KEY);
  } catch {
    return null;
  }
}

function markSessionVerified(user) {
  try {
    if (user?.id) {
      localStorage.setItem(VERIFIED_SESSION_KEY, user.id);
    }
  } catch {
    // Authentication still depends on the Supabase session, not this UI marker.
  }
}

function clearVerifiedSession() {
  try {
    localStorage.removeItem(VERIFIED_SESSION_KEY);
  } catch {
    // Ignore storage errors; the Supabase session remains the source of truth.
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authFlowRef = useRef("idle");
  const recoverySessionRef = useRef(false);

  const saveUser = useCallback((rawUser) => {
    setUser(formatUser(rawUser));
  }, []);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY") {
        recoverySessionRef.current = true;
        saveUser(null);
        setLoading(false);
        return;
      }

      if (event === "SIGNED_OUT") {
        clearVerifiedSession();
        recoverySessionRef.current = false;
        saveUser(null);
      } else if (recoverySessionRef.current) {
        // Recovery tokens grant temporary password-update access, not app login.
        saveUser(null);
      } else if (session?.user) {
        if (authFlowRef.current === "verify") {
          markSessionVerified(session.user);
          saveUser(session.user);
        } else if (
          authFlowRef.current === "password" ||
          authFlowRef.current === "signup"
        ) {
          saveUser(null);
        } else if (getVerifiedUserId() === session.user.id) {
          saveUser(session.user);
        } else {
          saveUser(null);
        }
      } else {
        saveUser(null);
      }

      setLoading(false);
    });

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!mounted) return;

        const sessionUser = data.session?.user;
        // Password recovery also creates a Supabase session. Keep it available
        // on the reset route so updateUser({ password }) can use it, while never
        // exposing it as a normal authenticated app user.
        const isPasswordResetRoute =
          typeof window !== "undefined" &&
          window.location.pathname === "/reset-password";
        if (recoverySessionRef.current) {
          saveUser(null);
        } else if (sessionUser && getVerifiedUserId() === sessionUser.id) {
          saveUser(sessionUser);
        } else {
          saveUser(null);
          if (sessionUser && !isPasswordResetRoute) await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Unable to check login session:", error);
        if (mounted) saveUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [saveUser]);

  const login = useCallback(async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    authFlowRef.current = "password";
    clearVerifiedSession();
    saveUser(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        authFlowRef.current = "idle";
        return { success: false, error: error.message };
      }

      if (!data.user) {
        authFlowRef.current = "idle";
        return { success: false, error: "Unable to verify this account." };
      }

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        authFlowRef.current = "idle";
        return {
          success: false,
          error: "Could not secure the sign-in challenge. Please try again.",
        };
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: false },
      });
      authFlowRef.current = "idle";

      if (otpError) {
        return { success: false, error: otpError.message };
      }

      return { success: true, needsEmailOtp: true, email: normalizedEmail };
    } catch (error) {
      authFlowRef.current = "idle";
      return {
        success: false,
        error: error.message || "Unable to sign in. Please try again.",
      };
    }
  }, [saveUser]);

  const verifyLoginOtp = useCallback(async (email, token) => {
    authFlowRef.current = "verify";
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: "email",
      });

      if (error) return { success: false, error: error.message };
      if (!data.user || !data.session) {
        return { success: false, error: "The code could not sign you in. Request a new code." };
      }

      markSessionVerified(data.user);
      saveUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Unable to verify the code." };
    } finally {
      authFlowRef.current = "idle";
    }
  }, [saveUser]);

  const resendLoginOtp = useCallback(async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    });
    return error ? { success: false, error: error.message } : { success: true };
  }, []);

  const register = useCallback(async (name, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    authFlowRef.current = "signup";
    clearVerifiedSession();
    saveUser(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { full_name: name.trim() },
        },
      });

      if (error) {
        authFlowRef.current = "idle";
        return { success: false, error: error.message };
      }

      if (data.session) {
        await supabase.auth.signOut();
        authFlowRef.current = "idle";
        saveUser(null);
        return {
          success: false,
          error: "Email verification is disabled in Supabase. Enable Confirm email in Authentication settings, then register again.",
        };
      }

      authFlowRef.current = "idle";
      return {
        success: true,
        needsEmailConfirmation: true,
        email: normalizedEmail,
      };
    } catch (error) {
      authFlowRef.current = "idle";
      return {
        success: false,
        error: error.message || "Registration failed. Please try again.",
      };
    }
  }, [saveUser]);

  const verifySignupOtp = useCallback(async (email, token) => {
    authFlowRef.current = "verify";
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: "signup",
      });

      if (error) return { success: false, error: error.message };
      if (!data.user || !data.session) {
        return { success: false, error: "The code could not verify your account. Request a new code." };
      }

      markSessionVerified(data.user);
      saveUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Unable to verify your email. Please try again.",
      };
    } finally {
      authFlowRef.current = "idle";
    }
  }, [saveUser]);

  const resendSignupOtp = useCallback(async (email) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
    });
    return error ? { success: false, error: error.message } : { success: true };
  }, []);

  const changeEmail = useCallback(async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return { success: false, error: "Enter the new email address." };
    }

    const { error } = await supabase.auth.updateUser({
      email: normalizedEmail,
    });
    return error
      ? { success: false, error: error.message }
      : { success: true, email: normalizedEmail };
  }, []);

  const logout = useCallback(async () => {
    clearVerifiedSession();
    const { error } = await supabase.auth.signOut();
    saveUser(null);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }, [saveUser]);

  const userInitial = user
    ? (user.name || user.email || "A").trim()[0].toUpperCase()
    : "";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyLoginOtp,
        resendLoginOtp,
        register,
        verifySignupOtp,
        resendSignupOtp,
        changeEmail,
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
