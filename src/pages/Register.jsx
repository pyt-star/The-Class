
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiArrowRight,
  FiCheckCircle,
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

  return (
    <main className="auth-page">
      <div className="auth-container">
        {isFromCheckout && (
          <div className="auth-notice-banner">
            <FiCheckCircle className="notice-icon" />
            <div>
              <strong>Complete Your Order</strong>
              <span>
                Create your account to continue with your order.
              </span>
            </div>
          </div>
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
                Thank you for joining THE CLASS. We've requested an
                email confirmation for:
              </p>

              <p>
                <strong>{email.trim()}</strong>
              </p>

              <div className="auth-alert success">
                Please check your inbox and click the confirmation
                link to activate your account. Also check your spam
                or junk folder.
              </div>

              <p className="auth-subtitle">
                Once your email is verified, return here and sign in.
              </p>

              <Link
                to={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
                className="auth-submit-btn"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                GO TO SIGN IN <FiArrowRight />
              </Link>
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
