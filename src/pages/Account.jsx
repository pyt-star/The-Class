import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiUser,
  FiPackage,
  FiLogOut,
  FiMail,
  FiShoppingBag,
  FiAward,
} from "react-icons/fi";
import "./Account.css";

export default function Account() {
  const { user, isAuthenticated, loading, logout, userInitial } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeMessage, setEmailChangeMessage] = useState("");
  const [emailChangeError, setEmailChangeError] = useState("");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const navigate = useNavigate();
  const { changeEmail } = useAuth();

  if (loading && !isAuthenticated) {
    return (
      <main className="account-page account-loading-center">
        <div className="checkout-spinner"></div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleChangeEmail = async (event) => {
    event.preventDefault();
    setEmailChangeMessage("");
    setEmailChangeError("");

    if (newEmail.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setEmailChangeError("Enter an email address different from your current one.");
      return;
    }

    setEmailChangeLoading(true);
    try {
      const result = await changeEmail(newEmail);
      if (!result.success) {
        setEmailChangeError(result.error || "Unable to start the email change.");
      } else {
        setEmailChangeMessage(
          `Check ${result.email} for the confirmation email. Your account email changes after you confirm it.`
        );
        setNewEmail("");
      }
    } catch (error) {
      setEmailChangeError(error.message || "Unable to start the email change.");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  return (
    <main className="account-page">
      <div className="account-container">
        {/* PROFILE HEADER BANNER */}
        <div className="profile-banner">
          <div className="profile-banner-left">
            <div className="profile-avatar-circle">{userInitial}</div>
            <div className="profile-meta">
              <span className="profile-tier-badge">
                <FiAward /> The Class Member
              </span>
              <h1>{user?.name || "Distinguished Guest"}</h1>
              <p className="profile-email">
                <FiMail /> {user?.email}
              </p>
            </div>
          </div>

          <button onClick={handleLogout} className="profile-logout-btn">
            <FiLogOut /> Sign Out
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="account-tabs">
          <button
            className={`account-tab-btn ${
              activeTab === "orders" ? "active" : ""
            }`}
            onClick={() => setActiveTab("orders")}
          >
            <FiPackage /> Fragrance Orders
          </button>
          <button
            className={`account-tab-btn ${
              activeTab === "profile" ? "active" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <FiUser /> Profile & Preferences
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="account-tab-content">
          {activeTab === "orders" && (
            <div className="tab-pane orders-pane">
              <div className="orders-header">
                <h2>Your Fragrance Collection & Orders</h2>
                <Link to="/shop" className="shop-more-link">
                  <FiShoppingBag /> Browse New Arrivals
                </Link>
              </div>

              <div className="mock-order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-num">Order #TC-928104</span>
                    <span className="order-date">Recent Activity</span>
                  </div>
                  <span className="order-status-pill in-transit">
                    Order Processing
                  </span>
                </div>

                <div className="order-card-body">
                  <p className="order-note">
                    Your bespoke fragrances are inspected by our master perfumer
                    before dispatch. Standard insured delivery takes 2-4 business
                    days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="tab-pane profile-pane">
              <h2>Account Information</h2>

              <div className="profile-details-grid">
                <div className="profile-field">
                  <span className="field-label">Full Name</span>
                  <span className="field-value">
                    {user?.name || "Not specified"}
                  </span>
                </div>

                <div className="profile-field">
                  <span className="field-label">Email Address</span>
                  <span className="field-value">{user?.email}</span>
                </div>

                <div className="profile-field">
                  <span className="field-label">Membership Status</span>
                  <span className="field-value">Active Collector</span>
                </div>

                <div className="profile-field">
                  <span className="field-label">Complimentary Samples</span>
                  <span className="field-value">
                    Included with every shipment
                  </span>
                </div>
              </div>

              <form className="email-change-form" onSubmit={handleChangeEmail}>
                <h3>Change Email Address</h3>
                <p>We’ll send a confirmation email before updating your account.</p>
                {emailChangeError && <div className="email-change-alert error" role="alert">{emailChangeError}</div>}
                {emailChangeMessage && <div className="email-change-alert success" role="status">{emailChangeMessage}</div>}
                <label htmlFor="new-account-email">New email address</label>
                <input
                  id="new-account-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="name@example.com"
                />
                <button type="submit" disabled={emailChangeLoading}>
                  {emailChangeLoading ? "SENDING..." : "SEND CONFIRMATION"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
