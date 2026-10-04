import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

const LOCAL_STORAGE_KEY = "luxury_perfume_auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync Supabase session on mount
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        if (supabase?.auth?.getSession) {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data?.session?.user) {
            const sbUser = {
              id: data.session.user.id,
              email: data.session.user.email,
              name:
                data.session.user.user_metadata?.full_name ||
                data.session.user.user_metadata?.name ||
                data.session.user.email?.split("@")[0] ||
                "Customer",
            };
            if (mounted) {
              setUser(sbUser);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sbUser));
            }
          }
        }
      } catch (err) {
        console.warn("Supabase auth session check notice:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkSession();

    // Listen to Supabase auth changes
    let authListener = null;
    try {
      if (supabase?.auth?.onAuthStateChange) {
        const { data: subData } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              const sbUser = {
                id: session.user.id,
                email: session.user.email,
                name:
                  session.user.user_metadata?.full_name ||
                  session.user.user_metadata?.name ||
                  session.user.email?.split("@")[0] ||
                  "Customer",
              };
              setUser(sbUser);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sbUser));
            } else if (event === "SIGNED_OUT") {
              setUser(null);
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
          }
        );
        authListener = subData;
      }
    } catch (err) {
      console.warn("Supabase onAuthStateChange error:", err);
    }

    return () => {
      mounted = false;
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    let authError = null;

    try {
      if (supabase?.auth?.signInWithPassword) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (!error && data?.user) {
          const activeUser = {
            id: data.user.id,
            email: data.user.email,
            name:
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              data.user.email?.split("@")[0] ||
              "Customer",
          };
          setUser(activeUser);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activeUser));
          setLoading(false);
          return { success: true };
        } else if (error) {
          authError = error.message;
        }
      }
    } catch (err) {
      authError = err.message;
    }

    // Fallback support (useful if Supabase email confirmation is enabled or offline)
    // Check if user was previously registered in local storage demo directory
    try {
      const demoUsers = JSON.parse(
        localStorage.getItem("luxury_perfume_registered_users") || "[]"
      );
      const matched = demoUsers.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password
      );

      if (matched) {
        const activeUser = {
          id: matched.id,
          email: matched.email,
          name: matched.name || matched.email.split("@")[0],
        };
        setUser(activeUser);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activeUser));
        setLoading(false);
        return { success: true };
      }
    } catch {
      // ignore
    }

    setLoading(false);
    return {
      success: false,
      error: authError || "Invalid email or password. Please try again.",
    };
  };

  // Register handler
  const register = async (name, email, password) => {
    setLoading(true);
    let authError = null;

    try {
      if (supabase?.auth?.signUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (!error && data?.user) {
          const activeUser = {
            id: data.user.id,
            email: data.user.email,
            name: name.trim() || data.user.email?.split("@")[0] || "Customer",
          };

          // Save to demo registered users list as well for fallback reliability
          const existingList = JSON.parse(
            localStorage.getItem("luxury_perfume_registered_users") || "[]"
          );
          existingList.push({
            id: activeUser.id,
            name: activeUser.name,
            email: activeUser.email,
            password,
          });
          localStorage.setItem(
            "luxury_perfume_registered_users",
            JSON.stringify(existingList)
          );

          setUser(activeUser);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activeUser));
          setLoading(false);
          return { success: true };
        } else if (error) {
          authError = error.message;
        }
      }
    } catch (err) {
      authError = err.message;
    }

    // Local registration fallback
    try {
      const existingList = JSON.parse(
        localStorage.getItem("luxury_perfume_registered_users") || "[]"
      );
      const duplicate = existingList.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (duplicate && authError) {
        setLoading(false);
        return { success: false, error: authError };
      }

      const newUserId = "local_" + Date.now();
      const activeUser = {
        id: newUserId,
        email: email.trim(),
        name: name.trim() || email.split("@")[0],
      };

      existingList.push({
        id: newUserId,
        name: activeUser.name,
        email: activeUser.email,
        password,
      });
      localStorage.setItem(
        "luxury_perfume_registered_users",
        JSON.stringify(existingList)
      );

      setUser(activeUser);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activeUser));
      setLoading(false);
      return { success: true };
    } catch {
      // fallback
    }

    setLoading(false);
    return {
      success: false,
      error: authError || "Registration failed. Please check your information.",
    };
  };

  // Logout handler
  const logout = async () => {
    try {
      if (supabase?.auth?.signOut) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("Supabase signOut error:", err);
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // User initial helper
  const getUserInitial = () => {
    if (!user) return "";
    if (user.name) return user.name.trim()[0].toUpperCase();
    if (user.email) return user.email.trim()[0].toUpperCase();
    return "A";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        userInitial: getUserInitial(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
