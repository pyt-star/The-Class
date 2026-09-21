
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiMenu,
  FiHeart,
  FiShoppingBag,
  FiX,
  FiSearch,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";
import "./Navbar.css";

/* =========================================
   MOCK CATALOG FOR GLOBAL SEARCH
========================================= */

const searchCatalog = [
  { id: 1, name: "Noir Essence", category: "Men" },
  { id: 2, name: "Velvet Rose", category: "Women" },
  { id: 3, name: "Midnight Oud", category: "Unisex" },
  { id: 4, name: "Golden Amber", category: "Men" },
  { id: 5, name: "Celestial Bloom", category: "Women" },
  { id: 6, name: "Santal Royale", category: "Unisex" },
  { id: 7, name: "French Essence", category: "Luxury" },
];

/* =========================================
   NAVBAR COMPONENT
========================================= */

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { totalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  /* =========================================
     SEARCH STATE
  ========================================= */

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const searchRef = useRef(null);

  /* =========================================
     SEARCH HANDLERS
  ========================================= */

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setQuery(value);

    if (value.trim().length > 0) {
      const filtered = searchCatalog.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );

      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  const handleProductClick = (productId) => {
    clearSearch();
    setIsFocused(false);
    navigate(`/product/${productId}`);
  };

  /* =========================================
     CLOSE SEARCH WHEN CLICKING OUTSIDE
  ========================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================================
     MENU KEYBOARD HANDLER
  ========================================= */

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setIsFocused(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* =========================================
     LOCK BODY SCROLL WHEN MENU IS OPEN
  ========================================= */

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* =========================================
     MENU HANDLERS
  ========================================= */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /* =========================================
     JSX
  ========================================= */

  return (
    <>
      {/* =================================
          TOP NAVBAR
      ================================= */}

      <header className="navbar">
        {/* MENU BUTTON */}

        <button
          className="menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <FiMenu />
        </button>

        {/* CENTERED LOGO */}

        <Link
          to="/#home"
          className="navbar-logo"
          onClick={closeMenu}
        >
          THE CLASS
        </Link>

        {/* RIGHT SIDE: SEARCH + ICONS */}

        <div className="navbar-right">
          {/* SEARCH BAR */}

          <div className="nav-search-container" ref={searchRef}>
            <div
              className={`nav-search-box ${
                isFocused ? "active" : ""
              }`}
            >
              <FiSearch className="nav-search-icon" />

              <input
                type="text"
                placeholder="Search fragrances..."
                value={query}
                onChange={handleSearchChange}
                onFocus={() => setIsFocused(true)}
                aria-label="Search fragrances"
              />

              {query && (
                <button
                  className="nav-clear-btn"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  type="button"
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* SEARCH DROPDOWN */}

            {isFocused && query.trim().length > 0 && (
              <div className="nav-search-dropdown">
                {results.length > 0 ? (
                  results.map((item) => (
                    <div
                      key={item.id}
                      className="nav-search-item"
                      onClick={() => handleProductClick(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleProductClick(item.id);
                        }
                      }}
                    >
                      <span className="nav-result-name">
                        {item.name}
                      </span>

                      <span className="nav-result-cat">
                        {item.category}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="nav-search-empty">
                    No fragrances found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* NAVIGATION ICONS */}

          <div className="navbar-icons">
            {/* WISHLIST */}

            <button
              className="icon-btn"
              aria-label="Wishlist"
              title="Wishlist"
              type="button"
            >
              <FiHeart />
            </button>

            {/* SHOPPING BAG */}

            <button
              className="icon-btn"
              aria-label="Shopping Bag"
              title="Shopping Bag"
              onClick={() => setIsCartOpen(true)}
              type="button"
              style={{
                position: "relative",
              }}
            >
              <FiShoppingBag />

              {totalItems > 0 && (
                <span className="cart-count">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =================================
          BACKDROP
      ================================= */}

      <div
        className={`navbar-overlay ${
          menuOpen ? "show" : ""
        }`}
        onClick={closeMenu}
      />

      {/* =================================
          SIDE MENU
      ================================= */}

      <aside
        className={`sidebar ${menuOpen ? "show" : ""}`}
        aria-hidden={!menuOpen}
      >
        {/* SIDEBAR HEADER */}

        <div className="sidebar-header">
          <span className="sidebar-brand">
            THE CLASS
          </span>

          <button
            className="close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
            type="button"
          >
            <FiX />
          </button>
        </div>

        {/* NAVIGATION LINKS */}

        <nav className="sidebar-nav">
          <Link to="/#home" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/shop" onClick={closeMenu}>
            Fragrances
          </Link>

          <Link to="/#best-sellers" onClick={closeMenu}>
            Best Sellers
          </Link>

          <Link to="/#shop-by-category" onClick={closeMenu}>
            Shop by Category
          </Link>

          <Link to="/#our-story" onClick={closeMenu}>
            Our Story
          </Link>

          <Link to="/#why-the-class" onClick={closeMenu}>
            Why The Class
          </Link>
        </nav>

        {/* SIDEBAR FOOTER */}

        <div className="sidebar-footer">
          <p className="footer-title">
            STAY CONNECTED
          </p>

          <Link to="/#newsletter" onClick={closeMenu}>
            Newsletter
          </Link>
        </div>
      </aside>
    </>
  );
}