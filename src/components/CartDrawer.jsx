import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./CartDrawer.css";

export default function CartDrawer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      navigate("/login?redirect=/checkout");
    }
  };

  return (
    <>
      {/* DARK OVERLAY */}
      <div
        className={`cart-overlay ${isCartOpen ? "show" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* SLIDE-OUT DRAWER */}
      <aside
        className={`cart-drawer ${
          isCartOpen ? "open" : ""
        }`}
      >
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

            {/* CLEAR ALL */}
            <div className="cart-top-bar">
              <button
                className="clear-all-btn"
                onClick={clearCart}
              >
                Clear all
              </button>
            </div>

            {/* ITEM LIST */}
            <div className="cart-items-list">

              {cartItems.map((item) => (
                <div
                  className="cart-item-card"
                  key={`${item.id}-${item.size}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                  />

                  <div className="cart-item-info">

                    <div className="cart-item-title-row">

                      <h3>
                        {item.name}
                      </h3>

                      <button
                        className="item-delete-btn"
                        onClick={() =>
                          removeFromCart(
                            item.id,
                            item.size
                          )
                        }
                        aria-label={`Remove ${item.name}`}
                      >
                        ✕
                      </button>

                    </div>

                    <p className="cart-item-subtitle">
                      {item.size} | Luxury Eau De Parfum
                    </p>

                    <div className="cart-item-controls">

                      {/* QUANTITY */}
                      <div className="qty-selector">

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.size,
                              -1
                            )
                          }
                        >
                          −
                        </button>

                        <span>
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.size,
                              1
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                      {/* PRICE */}
                      <span className="cart-item-price">
                        ₹
                        {Number(item.price).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>

                  </div>
                </div>
              ))}

            </div>

            {/* SUMMARY */}
            <div className="cart-footer">

              <div className="summary-row total-row">

                <span>
                  Subtotal
                </span>

                <span className="cart-final-total">
                  ₹
                  {Number(totalPrice).toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

              <button
                className="cart-checkout-btn"
                onClick={handleCheckoutClick}
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