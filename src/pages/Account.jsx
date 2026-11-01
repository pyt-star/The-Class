import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
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
  const { user, isAuthenticated, loading, logout, userInitial, changeEmail } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeMessage, setEmailChangeMessage] = useState("");
  const [emailChangeError, setEmailChangeError] = useState("");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      if (!user?.id) {
        setOrders([]);
        setOrdersLoading(false);
        return;
      }

      setOrders([]);
      setOrdersLoading(true);
      setOrdersError("");

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.access_token) throw new Error("Please sign in again to view your orders.");

        const response = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load your orders.");
        if (active) setOrders(Array.isArray(result.orders) ? result.orders : []);
      } catch (error) {
        if (active) setOrdersError(error.message || "Unable to load your orders.");
      } finally {
        if (active) setOrdersLoading(false);
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, [user?.id]);

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

              {ordersLoading ? (
                <p className="orders-feedback">Loading your orders…</p>
              ) : ordersError ? (
                <p className="orders-feedback error" role="alert">{ordersError}</p>
              ) : orders.length === 0 ? (
                <div className="orders-empty-state">
                  <FiPackage />
                  <h3>No orders yet</h3>
                  <p>Your completed purchases will appear here.</p>
                  <Link to="/shop" className="orders-empty-link">Explore fragrances</Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <article className="account-order-card" key={order.id}>
                      <div className="order-card-header">
                        <div>
                          <span className="order-num">
                            Order #TC-{String(order.id).replace(/-/g, "").slice(0, 8).toUpperCase()}
                          </span>
                          <span className="order-date">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            }) : "Date unavailable"}
                          </span>
                        </div>
                        <span className={`order-status-pill status-${String(order.status || "pending").toLowerCase()}`}>
                          {String(order.status || "pending").replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="account-order-items">
                        {(order.items || []).map((item, index) => (
                          <p key={`${order.id}-${index}`}>
                            <span>{item.name} <small>{item.size} · Qty {item.quantity}</small></span>
                            <strong>₹{(Number(item.unit_price_inr || 0) * Number(item.quantity || 0)).toLocaleString("en-IN")}</strong>
                          </p>
                        ))}
                      </div>
                      <div className="account-order-total">
                        <span>Order total</span>
                        <strong>₹{Number(order.total_inr || 0).toLocaleString("en-IN")}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
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
