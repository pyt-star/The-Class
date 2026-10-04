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
  const { user, isAuthenticated, logout, userInitial } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
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
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
