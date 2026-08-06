import { useState } from "react";
import { useCart } from "../context/CartContext";
import "./CartDrawer.css";

// Reusing an asset for the "Frequently Bought Together" upsell
import bestseller3 from "../assets/bestseller3.jpg";

export default function CartDrawer() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    addToCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  // Prototype promo code logic: entering "CLASS20" gives ₹300 off
  const handleApplyDiscount = (e) => {
    e.preventDefault();
    if (discountCode.trim().toUpperCase() === "CLASS20") {
      setDiscountApplied(true);
      alert("Promo Code 'CLASS20' Applied! ₹300 OFF.");
    } else {
      alert("Invalid Discount Code. Try 'CLASS20'!");
    }
  };

  const finalTotal = discountApplied ? Math.max(0, totalPrice - 300) : totalPrice;

  // Mock upsell product
  const upsellProduct = {
    id: 99,
    name: "Discovery Fragrance Set (4 × 10ml)",
    price: "₹999",
    image: bestseller3,
  };

  return (
    <>
      {/* DARK OVERLAY */}
      <div
        className={`cart-overlay ${isCartOpen ? "show" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* SLIDE-OUT DRAWER */}
      <aside className={`cart-drawer ${isCartOpen ? "open" : ""}`}>
        {/* HEADER */}
        <div className="cart-header">
          <h2>
            YOUR CART <span>• {totalItems}</span>
          </h2>
          <button
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          /* EMPTY STATE */
          <div className="cart-empty">
            <p>Your shopping bag is currently empty.</p>
            <button
              className="cart-shop-btn"
              onClick={() => setIsCartOpen(false)}
            >
              Explore Collection
            </button>
          </div>
        ) : (
          /* CART CONTENT */
          <div className="cart-body">
            {/* CLEAR ALL LINK */}
            <div className="cart-top-bar">
              <button className="clear-all-btn" onClick={clearCart}>
                Clear all
              </button>
            </div>

            {/* ITEM LIST */}
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div className="cart-item-card" key={`${item.id}-${item.size}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                  />

                  <div className="cart-item-info">
                    <div className="cart-item-title-row">
                      <h3>{item.name}</h3>
                      <button
                        className="item-delete-btn"
                        onClick={() => removeFromCart(item.id, item.size)}
                      >
                        ✕
                      </button>
                    </div>
                    <p className="cart-item-subtitle">
                      {item.size} | Luxury Eau De Parfum
                    </p>

                    <div className="cart-item-controls">
                      {/* QUANTITY COUNTER (- 1 +) */}
                      <div className="qty-selector">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.size, -1)
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.size, 1)
                          }
                        >
                          +
                        </button>
                      </div>

                      <span className="cart-item-price">
                        {item.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DISCOUNT CODE BAR */}
            <form className="discount-bar" onSubmit={handleApplyDiscount}>
              <input
                type="text"
                placeholder="eg. CLASS20"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <button type="submit" className="discount-apply-btn">
                Apply
              </button>
            </form>

            {/* FREQUENTLY BOUGHT TOGETHER (UPSELL) */}
            <div className="upsell-section">
              <div className="upsell-banner">Frequently Bought Together</div>
              <div className="upsell-card">
                <img src={upsellProduct.image} alt="Discovery Set" />
                <div className="upsell-details">
                  <h4>{upsellProduct.name}</h4>
                  <p className="upsell-price">{upsellProduct.price}</p>
                </div>
                <button
                  className="upsell-add-btn"
                  onClick={() => addToCart(upsellProduct, "40ml", upsellProduct.price)}
                >
                  ADD
                </button>
              </div>
            </div>

            {/* SUMMARY & CHECKOUT FOOTER */}
            <div className="cart-footer">
              {discountApplied && (
                <div className="summary-row discount-row">
                  <span>Promo Discount (CLASS20)</span>
                  <span>− ₹300.00</span>
                </div>
              )}

              <div className="summary-row total-row">
                <span>Subtotal</span>
                <span className="cart-final-total">
                  ₹{finalTotal.toLocaleString("en-IN")}.00
                </span>
              </div>

              <button
                className="cart-checkout-btn"
                onClick={() =>
                  alert("Prototype: Redirecting to UPI / Checkout Gateway...")
                }
              >
                Checkout <span>›</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}