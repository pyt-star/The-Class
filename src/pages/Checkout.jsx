import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  FiCheckCircle,
  FiShield,
  FiTruck,
  FiShoppingBag,
  FiCreditCard,
  FiArrowLeft,
} from "react-icons/fi";
import "./Checkout.css";

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
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

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/checkout" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.pincode
    ) {
      setErrorMsg("Please fill in all required shipping address fields.");
      return;
    }

    const generatedId = "TC-" + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedId);
    setOrderPlaced(true);
    clearCart();
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
            A confirmation receipt and courier tracking details will be sent to{" "}
            <strong>{user?.email}</strong>. Your exquisite olfactory creation is
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

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        {/* TOP HEADER */}
        <div className="checkout-header-bar">
          <Link to="/shop" className="checkout-back-link">
            <FiArrowLeft /> Continue Shopping
          </Link>
          <h1 className="checkout-title">Secure Luxury Checkout</h1>
          <div className="checkout-badge">
            <FiShield /> 256-Bit SSL Encrypted
          </div>
        </div>

        {errorMsg && <div className="checkout-alert">{errorMsg}</div>}

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
                <h2>Payment Method</h2>
              </div>

              <div className="payment-options">
                <label
                  className={`payment-option ${
                    formData.paymentMethod === "upi" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === "upi"}
                    onChange={handleChange}
                  />
                  <div className="payment-opt-content">
                    <span className="payment-opt-title">UPI Instant Pay</span>
                    <span className="payment-opt-sub">
                      Google Pay, PhonePe, Paytm, or any UPI App
                    </span>
                  </div>
                </label>

                <label
                  className={`payment-option ${
                    formData.paymentMethod === "card" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === "card"}
                    onChange={handleChange}
                  />
                  <div className="payment-opt-content">
                    <span className="payment-opt-title">
                      Credit / Debit Card
                    </span>
                    <span className="payment-opt-sub">
                      Visa, Mastercard, American Express, RuPay
                    </span>
                  </div>
                </label>

                <label
                  className={`payment-option ${
                    formData.paymentMethod === "cod" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                  />
                  <div className="payment-opt-content">
                    <span className="payment-opt-title">Cash on Delivery</span>
                    <span className="payment-opt-sub">
                      Pay with cash upon white-glove doorstep delivery
                    </span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="checkout-right">
            <div className="order-summary-box">
              <h3>Order Summary ({cartItems.length} items)</h3>

              <div className="summary-items-list">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
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
                          Number(String(item.price).replace(/[^0-9.-]+/g, "")) *
                          item.quantity
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-calc-rows">
                <div className="calc-row">
                  <span>Subtotal</span>
                  <span>₹{Number(totalPrice).toLocaleString("en-IN")}</span>
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
                    ₹{Number(totalPrice).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button type="submit" className="place-order-btn">
                PLACE ORDER — ₹{Number(totalPrice).toLocaleString("en-IN")}
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
