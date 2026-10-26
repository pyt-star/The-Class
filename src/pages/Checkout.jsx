
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabaseClient";
import {
  FiCheckCircle,
  FiShield,
  FiTruck,
  FiShoppingBag,
  FiArrowLeft,
} from "react-icons/fi";
import "./Checkout.css";

let razorpayScriptPromise;

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => {
      razorpayScriptPromise = null;
      reject(new Error("Razorpay Checkout could not be loaded. Please try again."));
    };
    document.head.appendChild(script);
  });

  return razorpayScriptPromise;
}

export default function Checkout() {
  const { user, isAuthenticated, loading } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "upi",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (user?.name && !formData.fullName) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name,
      }));
    }
  }, [user, formData.fullName]);

  if (loading && !isAuthenticated) {
    return (
      <main className="checkout-page checkout-loading-center">
        <div className="checkout-spinner"></div>
        <p className="checkout-loading-text">
          Verifying secure luxury session...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/checkout" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (placingOrder) return;

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      setErrorMsg("Please fill in all required shipping address fields.");
      return;
    }

    if (!cartItems.length) {
      setErrorMsg("Your shopping bag is empty.");
      return;
    }

    setPlacingOrder(true);

    try {
      if (!user?.email) {
        throw new Error("Please log in again to verify your account.");
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.access_token) {
        throw new Error("Please log in again to verify your account.");
      }

      const createResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            product_id: Number(item.id),
            variant_id: Number(item.variantId ?? item.variant_id),
            quantity: Number(item.quantity),
          })),
          shipping: {
            full_name: formData.fullName.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            postal_code: formData.pincode.trim(),
          },
        }),
      });
      const createResult = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createResult.error || "We couldn't start your payment.");
      }

      await loadRazorpayCheckout();

      let paymentHandlerStarted = false;
      const checkout = new window.Razorpay({
        key: createResult.key_id,
        order_id: createResult.order_id,
        amount: createResult.amount,
        currency: createResult.currency,
        name: "The Class",
        description: "Order payment",
        prefill: {
          name: formData.fullName.trim(),
          email: user.email,
          contact: formData.phone.trim(),
        },
        notes: { order_id: createResult.internal_order_id },
        theme: { color: "#201712" },
        handler: async (payment) => {
          paymentHandlerStarted = true;
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: payment.razorpay_payment_id,
                razorpay_order_id: payment.razorpay_order_id,
                razorpay_signature: payment.razorpay_signature,
              }),
            });
            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult.verified) {
              throw new Error(
                verifyResult.error || "We couldn't verify your payment. Please contact support."
              );
            }

            const reference = /^\d+$/.test(String(createResult.internal_order_id))
              ? String(createResult.internal_order_id).padStart(6, "0")
              : String(createResult.internal_order_id).slice(0, 8).toUpperCase();
            setOrderId(`TC-${reference}`);
            setOrderPlaced(true);
            clearCart();
          } catch (error) {
            setErrorMsg(error.message || "Payment verification failed. Please contact support.");
          } finally {
            setPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (!paymentHandlerStarted) setPlacingOrder(false);
          },
        },
      });

      checkout.on("payment.failed", (payment) => {
        setErrorMsg(
          payment?.error?.description || "Payment failed. You can try again."
        );
        setPlacingOrder(false);
      });

      checkout.open();
    } catch (error) {
      setErrorMsg(
        error.message ||
          "We couldn't start your payment. Please try again."
      );
      setPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    return (
      <main className="checkout-page">
        <div className="order-success-card">
          <div className="success-icon-wrap">
            <FiCheckCircle />
          </div>

          <span className="success-eyebrow">ORDER CONFIRMED</span>

          <h1>Thank You for Choosing The Class</h1>

          <p className="order-id-label">
            Order Reference: <strong>#{orderId}</strong>
          </p>

          <p className="success-desc">
            Your order has been saved successfully. A confirmation receipt
            and courier tracking details will be sent to{" "}
            <strong>{user?.email}</strong>. Your exquisite fragrance is
            being carefully packaged in our signature box.
          </p>

          <div className="success-actions">
            <Link to="/shop" className="continue-btn">
              Explore More Fragrances
            </Link>

            <Link to="/account" className="account-btn">
              View Your Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty-card">
          <FiShoppingBag className="empty-icon" />

          <h2>Your Shopping Bag is Empty</h2>

          <p>
            You do not have any fragrances in your bag to checkout at this time.
          </p>

          <Link to="/shop" className="continue-btn">
            Explore Fragrances
          </Link>
        </div>
      </main>
    );
  }

  const displayTotal = Number(totalPrice || 0);

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        {/* TOP HEADER */}
        <div className="checkout-header-bar">
          <Link to="/shop" className="checkout-back-link">
            <FiArrowLeft /> Continue Shopping
          </Link>

          <h1 className="checkout-title">Checkout</h1>

        
        </div>

        {errorMsg && (
          <div className="checkout-alert" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="checkout-grid">
          {/* LEFT: SHIPPING & PAYMENT */}
          <div className="checkout-left">
            {/* SHIPPING ADDRESS */}
            <section className="checkout-section">
              <div className="section-title-wrap">
                <span className="step-num">1</span>
                <h2>Delivery Address</h2>
              </div>

              <div className="form-row">
                <div className="form-group full">
                  <label htmlFor="chk-name">Recipient Full Name *</label>
                  <input
                    id="chk-name"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="form-row two-col">
                <div className="form-group">
                  <label htmlFor="chk-phone">Contact Phone Number *</label>
                  <input
                    id="chk-phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chk-email">Notification Email</label>
                  <input
                    id="chk-email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="disabled-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full">
                  <label htmlFor="chk-addr">Street Address / Suite *</label>
                  <textarea
                    id="chk-addr"
                    name="address"
                    rows="3"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Apartment, building, street address"
                  />
                </div>
              </div>

              <div className="form-row three-col">
                <div className="form-group">
                  <label htmlFor="chk-city">City *</label>
                  <input
                    id="chk-city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chk-state">State *</label>
                  <input
                    id="chk-state"
                    name="state"
                    type="text"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chk-pin">PIN Code *</label>
                  <input
                    id="chk-pin"
                    name="pincode"
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                  />
                </div>
              </div>
            </section>

            {/* PAYMENT METHOD */}
            <section className="checkout-section">
              <div className="section-title-wrap">
                <span className="step-num">2</span>
                <h2>Secure Payment</h2>
              </div>
              <p className="payment-opt-sub">
                Pay securely with UPI, cards, net banking, or other methods available in Razorpay Checkout.
              </p>
            </section>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="checkout-right">
            <div className="order-summary-box">
              <h3>Order Summary ({cartItems.length} items)</h3>

              <div className="summary-items-list">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.size}-${item.variantId ?? item.variant_id ?? ""}`}
                    className="summary-item-card"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="summary-thumb"
                    />

                    <div className="summary-info">
                      <h4>{item.name}</h4>

                      <p className="summary-details">
                        {item.size} • Qty: {item.quantity}
                      </p>

                      <span className="summary-price">
                        ₹
                        {(
                          Number(
                            String(item.price ?? 0).replace(/[^0-9.-]+/g, "")
                          ) * Number(item.quantity || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-calc-rows">
                <div className="calc-row">
                  <span>Subtotal</span>
                  <span>₹{displayTotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="calc-row">
                  <span>Express Insured Shipping</span>
                  <span className="free-badge">FREE</span>
                </div>

                <div className="calc-row">
                  <span>Signature Gift Packaging</span>
                  <span className="free-badge">COMPLIMENTARY</span>
                </div>

                <div className="calc-row total-calc-row">
                  <span>Total Due</span>
                  <span className="grand-total">
                    ₹{displayTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="place-order-btn"
                disabled={placingOrder}
              >
                {placingOrder
                  ? "OPENING SECURE CHECKOUT..."
                  : `PAY SECURELY — ₹${displayTotal.toLocaleString("en-IN")}`}
              </button>

              <div className="summary-guarantees">
                <div>
                  <FiTruck /> Express delivery in 2-4 business days
                </div>

                <div>
                  <FiShield /> 100% Authentic Luxury Guarantee
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
