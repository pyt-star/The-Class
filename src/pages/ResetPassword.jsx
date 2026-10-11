
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { supabase } from "../supabaseClient";
import "./ResetPassword.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setVerified(true);
        setError("");
      }
    });

    const checkRecoverySession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        setError("Unable to verify your recovery link. Please request a new one.");
        return;
      }

      if (data.session) {
        // The recovery link may have established a session before this page loaded.
        setVerified(true);
      } else {
        setError(
          "Your recovery link is invalid or has expired. Please request a new password reset email."
        );
      }
    };

    checkRecoverySession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Your password has been changed successfully!");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch {
      setError("Unable to update your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-password-page">
      <div className="reset-password-card">
        <span className="reset-eyebrow">THE CLASS EXCLUSIVE</span>

        <h1>Reset Password</h1>

        <p className="reset-description">
          Create a new password for your account.
        </p>

        {error && (
          <div className="reset-alert error" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="reset-alert success" role="status">
            <FiCheckCircle />
            {message}
          </div>
        )}

        {!verified && !error && (
          <p className="reset-description">
            Verifying your recovery link...
          </p>
        )}

        {verified && !message && (
          <form onSubmit={handleSubmit} className="reset-form">
            <div className="reset-form-group">
              <label htmlFor="new-password">New Password</label>

              <div className="reset-input-wrapper">
                <FiLock />

                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="reset-form-group">
              <label htmlFor="confirm-password">
                Confirm New Password
              </label>

              <div className="reset-input-wrapper">
                <FiLock />

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="reset-submit-btn"
              disabled={loading}
            >
              {loading ? (
                "UPDATING..."
              ) : (
                <>
                  UPDATE PASSWORD <FiArrowRight />
                </>
              )}
            </button>
          </form>
        )}

        {error && (
          <button
            type="button"
            className="reset-back-btn"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        )}
      </div>
    </main>
  );
}
