import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectTarget = searchParams.get("redirect") || "/";
  const isFromCheckout =
    redirectTarget.includes("checkout") ||
    searchParams.get("from") === "checkout";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Redirect back to intended target (e.g., checkout) or home
      navigate(redirectTarget);
    } else {
      setErrorMessage(
        result.error || "Unable to sign in. Please verify your credentials."
      );
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setErrorMessage("Enter your email address above to reset your password.");
      return;
    }
    setForgotSent(true);
    setErrorMessage("");
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        {/* CHECKOUT NOTICE BANNER */}
        {isFromCheckout && (
          <div className="auth-notice-banner">
            <FiCheckCircle className="notice-icon" />
            <div>
              <strong>Almost there!</strong>
              <span>
                Please log in or create an account to finalize your luxury order.
              </span>
            </div>
          </div>
        )}

        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-eyebrow">THE CLASS EXCLUSIVE</span>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to manage your fragrance orders, wishlist, and private
              scent profile.
            </p>
          </div>

          {errorMessage && (
            <div className="auth-alert error">{errorMessage}</div>
          )}

          {forgotSent && (
            <div className="auth-alert success">
              Password reset link has been dispatched to {email}. Please check
              your inbox.
            </div>
          )}

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
                  onChange={(e) => setEmail(e.target.value)}
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
                <span className="auth-spinner-text">Authenticating...</span>
              ) : (
                <>
                  SIGN IN <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-switch">
            <span>New to The Class?</span>
            <Link
              to={
                redirectTarget !== "/"
                  ? `/register?redirect=${encodeURIComponent(redirectTarget)}`
                  : "/register"
              }
              className="switch-link"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
