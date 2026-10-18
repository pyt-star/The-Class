
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

    let createdOrderId = null;

    try {
      if (!user?.email) {
        throw new Error("Please log in again to verify your account.");
      }

      // Find the customer's profile using their authenticated email.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile?.id) {
        throw new Error(
          "Your customer profile was not found. Please contact support."
        );
      }

      // Validate cart items before creating the order.
      const orderItems = cartItems.map((item) => {
        const productId = Number(item.id);
        const variantId = item.variantId ?? item.variant_id ?? null;
        const price = Number(
          String(item.price ?? 0).replace(/[^0-9.-]+/g, "")
        );
        const quantity = Number(item.quantity);

        if (!Number.isInteger(productId) || productId <= 0) {
          throw new Error(`Invalid product ID for ${item.name}.`);
        }

        if (!Number.isInteger(price) || price < 0) {
          throw new Error(`Invalid price for ${item.name}.`);
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new Error(`Invalid quantity for ${item.name}.`);
        }

        if (
          variantId !== null &&
          (!Number.isInteger(Number(variantId)) || Number(variantId) <= 0)
        ) {
          throw new Error(`Invalid size variant for ${item.name}.`);
        }

        return {
          product_id: productId,
          variant_id: variantId === null ? null : Number(variantId),
          product_name_snapshot: item.name,
          size_snapshot: item.size || null,
          unit_price_inr: price,
          quantity,
        };
      });

      // Calculate the subtotal from the individual cart lines.
      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.unit_price_inr * item.quantity,
        0
      );

      // Create the order. The database generates its integer ID.
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          profile_id: profile.id,
          customer_id: null,
          status: "pending",
          subtotal_inr: subtotal,
          discount_inr: 0,
          shipping_inr: 0,
          total_inr: subtotal,
          shipping_name: formData.fullName.trim(),
          shipping_phone: formData.phone.trim(),
          shipping_address: [
            formData.address.trim(),
            formData.city.trim(),
            formData.state.trim(),
            formData.pincode.trim(),
          ].join(", "),
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      createdOrderId = order.id;

      // Save all selected products and variants.
      const rowsToInsert = orderItems.map((item) => ({
        ...item,
        order_id: order.id,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(rowsToInsert);

      if (itemsError) {
        // Attempt to remove the incomplete order if item insertion fails.
        const { error: cleanupError } = await supabase
          .from("orders")
          .delete()
          .eq("id", order.id);

        if (cleanupError) {
          console.error(
            "Could not remove the incomplete order:",
            cleanupError
          );
        }

        throw itemsError;
      }

      setOrderId(`TC-${String(order.id).padStart(6, "0")}`);
      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error("Failed to place order:", error);

      setErrorMsg(
        error.message ||
          "We couldn't place your order. Please try again."
      );
    } finally {
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

          <h1 className="checkout-title">Secure Luxury Checkout</h1>

          <div className="checkout-badge">
            <FiShield /> 256-Bit SSL Encrypted
          </div>
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
                      Pay with cash upon doorstep delivery
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
                  ? "PLACING ORDER..."
                  : `PLACE ORDER — ₹${displayTotal.toLocaleString("en-IN")}`}
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
