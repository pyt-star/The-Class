import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiHeart, FiShoppingBag, FiX } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Grab total items count and drawer control from CartContext
  const { totalItems, setIsCartOpen } = useCart();

  // Close mobile sidebar if the user presses the Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* TOP NAVBAR */}
      <header className="navbar">
        <button
          className="menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <FiMenu />
        </button>

        {/* Brand Logo links instantly to Home */}
        <Link to="/" className="navbar-logo">
          THE CLASS
        </Link>

        <div className="navbar-icons">
          <button className="icon-btn" aria-label="Wishlist">
            <FiHeart />
          </button>

          {/* Shopping Bag Icon: Opens Cart Drawer & Shows Item Badge */}
          <button
            className="icon-btn"
            aria-label="Shopping Bag"
            onClick={() => setIsCartOpen(true)}
            style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
          >
            <FiShoppingBag />
            {totalItems > 0 && (
              <span
                style={{
                  background: "#201712",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "2px 6px",
                  borderRadius: "50%",
                  marginLeft: "4px",
                  lineHeight: "1",
                }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* CLICK-OUT OVERLAY FOR MOBILE DRAWER */}
      <div
        className={`overlay ${menuOpen ? "show" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* SIDEBAR NAVIGATION DRAWER */}
      <aside className={`sidebar ${menuOpen ? "show" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-brand">THE CLASS</span>
          <button
            className="close-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        {/* Sidebar navigation links close the menu drawer automatically on click */}
        <nav className="sidebar-nav">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/shop" onClick={() => setMenuOpen(false)}>
            Fragrances
          </Link>
          <Link to="/shop" onClick={() => setMenuOpen(false)}>
            Collections
          </Link>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Our Story
          </Link>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
        </nav>

        <div className="sidebar-footer">
          <p className="footer-title">FOLLOW US</p>
          <div className="social-links">
            <a href="/">Instagram</a>
            <a href="/">Facebook</a>
            <a href="/">Pinterest</a>
          </div>
        </div>
      </aside>
    </>
  );
}