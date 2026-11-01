
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiArrowRight,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    register,
    verifySignupOtp,
    resendSignupOtp,
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

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      const result = await register(name, email, password);

      if (!result.success) {
        setErrorMessage(
          result.error ||
            "Unable to complete registration. Please try again."
        );
        return;
      }

      if (result.needsEmailConfirmation) {
        setEmail(result.email || email.trim().toLowerCase());
        setConfirmationSent(true);
        return;
      }

      // Registration succeeded and a Supabase session exists.
      navigate(redirectTarget);
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!/^\d{6,8}$/.test(otp.trim())) {
      setErrorMessage("Enter the verification code from your email.");
      return;
    }

    setLoading(true);
    try {
      const result = await verifySignupOtp(email, otp);
      if (!result.success) {
        setErrorMessage(result.error || "That code could not be verified.");
        return;
      }
      navigate(redirectTarget, { replace: true });
    } catch {
      setErrorMessage("Unable to verify your email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const result = await resendSignupOtp(email);
      if (!result.success) {
        setErrorMessage(result.error || "Unable to resend the code.");
      } else {
        setSuccessMessage("A new verification code has been sent.");
        setOtp("");
      }
    } catch {
      setErrorMessage("Unable to resend the code. Please try again.");
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
        {isFromCheckout && (
          <>
            <Link to="/shop" className="auth-checkout-back">
              <FiArrowLeft /> Return to Fragrances
            </Link>

            <div className="auth-notice-banner">
              <FiCheckCircle className="notice-icon" />
              <div>
                <strong>Complete Your Order</strong>
                <span>
                  Create your account to continue with your order.
                </span>
              </div>
            </div>
          </>
        )}

        <div className="auth-card">
          {confirmationSent ? (
            <div className="auth-header">
              <FiMail
                size={42}
                style={{ marginBottom: "18px" }}
              />

              <span className="auth-eyebrow">
                ONE LAST STEP
              </span>

              <h1 className="auth-title">
                Verify Your Email
              </h1>

              <p className="auth-subtitle">
                Enter the verification code sent to:
              </p>

              <p>
                <strong>{email.trim()}</strong>
              </p>

              <div className="auth-alert success">
                Check your inbox and spam folder for the code.
              </div>

              {errorMessage && (
                <div className="auth-alert error" role="alert">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="auth-alert success" role="status">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="auth-form" noValidate>
                <div className="form-group">
                  <label htmlFor="signup-otp">Email verification code</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      id="signup-otp"
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
                  {loading ? "VERIFYING..." : <>VERIFY EMAIL <FiArrowRight /></>}
                </button>
              </form>

              <button
                type="button"
                className="forgot-link"
                onClick={handleResendCode}
                disabled={loading}
                style={{ marginTop: "18px" }}
              >
                Resend verification code
              </button>
            </div>
          ) : (
            <>
              <div className="auth-header">
                <span className="auth-eyebrow">
                  MEMBERSHIP PRIVILEGES
                </span>

                <h1 className="auth-title">
                  Create Account
                </h1>

                <p className="auth-subtitle">
                  Join The Class to receive complimentary bespoke
                  samples, private releases, and seamless checkout.
                </p>
              </div>

              {errorMessage && (
                <div className="auth-alert error" role="alert">
                  {errorMessage}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="auth-form"
                noValidate
              >
                <div className="form-group">
                  <label htmlFor="reg-name">Full Name</label>

                  <div className="input-wrapper">
                    <FiUser className="input-icon" />

                    <input
                      id="reg-name"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email">Email Address</label>

                  <div className="input-wrapper">
                    <FiMail className="input-icon" />

                    <input
                      id="reg-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-password">
                    Password (min. 6 characters)
                  </label>

                  <div className="input-wrapper">
                    <FiLock className="input-icon" />

                    <input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-confirm">
                    Confirm Password
                  </label>

                  <div className="input-wrapper">
                    <FiLock className="input-icon" />

                    <input
                      id="reg-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      required
                      autoComplete="new-password"
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
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      CREATE ACCOUNT <FiArrowRight />
                    </>
                  )}
                </button>
              </form>

              <div className="auth-footer-switch">
                <span>Already have an account?</span>

                <Link
                  to={
                    redirectTarget !== "/"
                      ? `/login?redirect=${encodeURIComponent(
                          redirectTarget
                        )}`
                      : "/login"
                  }
                  className="switch-link"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
