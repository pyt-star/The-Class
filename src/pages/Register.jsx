import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();

  const redirectTarget = searchParams.get("redirect") || "/";
  const isFromCheckout =
    redirectTarget.includes("checkout") ||
    searchParams.get("from") === "checkout";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address.");
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
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate(redirectTarget);
    } else {
      setErrorMessage(
        result.error || "Unable to complete registration. Please try again."
      );
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        {/* CHECKOUT NOTICE BANNER */}
        {isFromCheckout && (
          <div className="auth-notice-banner">
            <FiCheckCircle className="notice-icon" />
            <div>
              <strong>Complete Your Order</strong>
              <span>
                Create your account in seconds to secure your fragrance order and track delivery.
              </span>
            </div>
          </div>
        )}

        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-eyebrow">MEMBERSHIP PRIVILEGES</span>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Join The Class to receive complimentary bespoke samples, private releases, and seamless checkout.
            </p>
          </div>

          {errorMessage && (
            <div className="auth-alert error">{errorMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
              <label htmlFor="reg-password">Password (min. 6 characters)</label>
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
              <label htmlFor="reg-confirm">Confirm Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  id="reg-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span className="auth-spinner-text">Creating Account...</span>
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
                  ? `/login?redirect=${encodeURIComponent(redirectTarget)}`
                  : "/login"
              }
              className="switch-link"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
