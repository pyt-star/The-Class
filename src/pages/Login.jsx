
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiArrowRight,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    login,
    verifyLoginOtp,
    resendLoginOtp,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const redirectTarget = searchParams.get("redirect") || "/";

  const isFromCheckout =
    redirectTarget.includes("checkout") ||
    searchParams.get("from") === "checkout";

  // If already logged in, redirect automatically to destination
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setForgotSent(false);

    if (!email.trim() || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (result.success && result.needsEmailOtp) {
        setEmail(result.email || email.trim().toLowerCase());
        setOtpSent(true);
        setSuccessMessage("A sign-in code has been sent to your email.");
      } else if (result.success) {
        navigate(redirectTarget);
      } else {
        setErrorMessage(
          result.error ||
            "Unable to sign in. Please verify your credentials."
        );
      }
    } catch (error) {
      setErrorMessage("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!/^\d{6,8}$/.test(otp.trim())) {
      setErrorMessage("Enter the verification code from your email.");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyLoginOtp(email, otp);
      if (!result.success) {
        setErrorMessage(result.error || "That code could not be verified.");
        return;
      }
      navigate(redirectTarget, { replace: true });
    } catch {
      setErrorMessage("Unable to verify the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const result = await resendLoginOtp(email);
      if (!result.success) {
        setErrorMessage(result.error || "Unable to resend the code.");
      } else {
        setSuccessMessage("A new sign-in code has been sent.");
        setOtp("");
      }
    } catch {
      setErrorMessage("Unable to resend the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage("");
    setForgotSent(false);

    if (!email.trim()) {
      setErrorMessage(
        "Enter your email address above to reset your password."
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        setErrorMessage(error.message);
      } else {
        setForgotSent(true);
      }
    } catch (error) {
      setErrorMessage(
        "Unable to send the reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="auth-page auth-loading-center">
        <div className="checkout-spinner"></div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        {/* CHECKOUT NOTICE BANNER */}
        {isFromCheckout && (
          <>
            <Link to="/shop" className="auth-checkout-back">
              <FiArrowLeft /> Return to Fragrances
            </Link>

            <div className="auth-notice-banner">
              <FiCheckCircle className="notice-icon" />
              <div>
                <strong>Almost there!</strong>
                <span>
                  Please log in or create an account to finalize your luxury
                  order.
                </span>
              </div>
            </div>
          </>
        )}

        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-eyebrow">THE CLASS EXCLUSIVE</span>

            <h1 className="auth-title">{otpSent ? "Verify Sign In" : "Welcome Back"}</h1>

            <p className="auth-subtitle">
              {otpSent
                ? `Enter the code sent to ${email}.`
                : "Sign in to manage your fragrance orders, wishlist, and private scent profile."}
            </p>
          </div>

          {errorMessage && (
            <div className="auth-alert error" role="alert">
              {errorMessage}
            </div>
          )}

          {forgotSent && (
            <div className="auth-alert success" role="status">
              If an account exists for {email.trim()}, a password reset link
              has been requested. Please check your inbox and spam folder.
            </div>
          )}

          {location.state?.passwordResetSuccess && (
            <div className="auth-alert success" role="status">
              Your password was updated. Sign in with your new password.
            </div>
          )}

          {successMessage && otpSent && (
            <div className="auth-alert success" role="status">
              {successMessage}
            </div>
          )}

          {otpSent ? (
            <>
              <form onSubmit={handleVerifyCode} className="auth-form" noValidate>
                <div className="form-group">
                  <label htmlFor="login-otp">Email verification code</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      id="login-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter the code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      maxLength={8}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? "VERIFYING..." : <>VERIFY & SIGN IN <FiArrowRight /></>}
                </button>
              </form>
              <button
                type="button"
                className="forgot-link"
                onClick={handleResendCode}
                disabled={loading}
                style={{ display: "block", marginTop: "18px" }}
              >
                Resend sign-in code
              </button>
              <button
                type="button"
                className="forgot-link"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setSuccessMessage("");
                }}
                style={{ display: "block", marginTop: "12px" }}
              >
                Back to sign in
              </button>
            </>
          ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>

              <div className="input-wrapper">
                <FiMail className="input-icon" />

                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setForgotSent(false);
                    setErrorMessage("");
                  }}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="login-password">Password</label>

                <button
                  type="button"
                  className="forgot-link"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              <div className="input-wrapper">
                <FiLock className="input-icon" />

                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner-text">
                  Please wait...
                </span>
              ) : (
                <>
                  SIGN IN <FiArrowRight />
                </>
              )}
            </button>
          </form>
          )}

          {!otpSent && <div className="auth-footer-switch">
            <span>New to The Class?</span>

            <Link
              to={
                redirectTarget !== "/"
                  ? `/register?redirect=${encodeURIComponent(
                      redirectTarget
                    )}`
                  : "/register"
              }
              className="switch-link"
            >
              Create an Account
            </Link>
          </div>}
        </div>
      </div>
    </main>
  );
}
