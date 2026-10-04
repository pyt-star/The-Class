import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiMenu,
  FiHeart,
  FiShoppingBag,
  FiX,
  FiSearch,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getProducts } from "../productService";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAuthenticated, userInitial, logout } = useAuth();
  const navigate = useNavigate();

  const accountRef = useRef(null);

  /* =========================================
     SEARCH STATE
  ========================================= */

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchCatalog, setSearchCatalog] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const searchRef = useRef(null);

  /* =========================================
     LOAD PRODUCTS FROM SUPABASE
  ========================================= */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getProducts();
        setSearchCatalog(products);
      } catch (error) {
        console.error("Failed to load products for search:", error);
      }
    };

    loadProducts();
  }, []);

  /* =========================================
     SEARCH HANDLER
  ========================================= */

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setQuery(value);

    if (value.trim().length > 0) {
      const filtered = searchCatalog.filter((product) =>
        product.name
          .toLowerCase()
          .includes(value.toLowerCase())
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
     CLOSE SEARCH & ACCOUNT WHEN CLICKING OUTSIDE
  ========================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsFocused(false);
      }

      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
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
        setAccountMenuOpen(false);
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
     MENU HANDLER
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

        {/* RIGHT SIDE */}

        <div className="navbar-right">

          {/* SEARCH BAR */}

          <div
            className="nav-search-container"
            ref={searchRef}
          >
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
                      onClick={() =>
                        handleProductClick(item.id)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" ||
                          e.key === " "
                        ) {
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

            {/* ACCOUNT CIRCLE */}

            <div className="nav-account-container" ref={accountRef}>
              <button
                className={`account-circle-btn ${
                  isAuthenticated ? "logged-in" : ""
                }`}
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                aria-label={
                  isAuthenticated
                    ? `Account: ${user?.name || "User"}`
                    : "Account & Sign In"
                }
                title={
                  isAuthenticated
                    ? `Account (${user?.name || user?.email})`
                    : "Sign In / Register"
                }
                type="button"
              >
                {isAuthenticated ? (
                  <span className="account-initial">{userInitial}</span>
                ) : (
                  <FiUser className="account-icon" />
                )}
              </button>

              {/* ACCOUNT DROPDOWN */}
              {accountMenuOpen && (
                <div className="nav-account-dropdown">
                  {isAuthenticated ? (
                    <>
                      <div className="nav-dropdown-header">
                        <span className="dropdown-label">Signed in as</span>
                        <strong className="dropdown-username">
                          {user?.name || "Member"}
                        </strong>
                        <span className="dropdown-email">{user?.email}</span>
                      </div>

                      <div className="nav-dropdown-divider" />

                      <Link
                        to="/account"
                        className="nav-dropdown-item"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <FiUser /> My Account & Orders
                      </Link>

                      <button
                        className="nav-dropdown-item logout-item"
                        onClick={async () => {
                          setAccountMenuOpen(false);
                          await logout();
                          navigate("/");
                        }}
                        type="button"
                      >
                        <FiLogOut /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="nav-dropdown-header">
                        <strong className="dropdown-username">
                          Welcome to The Class
                        </strong>
                        <span className="dropdown-email">
                          Access your bespoke scents & orders
                        </span>
                      </div>

                      <div className="nav-dropdown-divider" />

                      <Link
                        to="/login"
                        className="nav-dropdown-btn primary"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        Sign In
                      </Link>

                      <Link
                        to="/register"
                        className="nav-dropdown-btn secondary"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

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
        className={`sidebar ${
          menuOpen ? "show" : ""
        }`}
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

          <Link
            to="/#best-sellers"
            onClick={closeMenu}
          >
            Best Sellers
          </Link>

          <Link
            to="/#shop-by-category"
            onClick={closeMenu}
          >
            Shop by Category
          </Link>

          <Link
            to="/#our-story"
            onClick={closeMenu}
          >
            Our Story
          </Link>

          <Link
            to="/#why-the-class"
            onClick={closeMenu}
          >
            Why The Class
          </Link>

          {isAuthenticated ? (
            <Link to="/account" onClick={closeMenu}>
              My Account
            </Link>
          ) : (
            <Link to="/login" onClick={closeMenu}>
              Sign In / Register
            </Link>
          )}

        </nav>

        {/* SIDEBAR FOOTER */}

        <div className="sidebar-footer">

          <p className="footer-title">
            STAY CONNECTED
          </p>

          <Link
            to="/#newsletter"
            onClick={closeMenu}
          >
            Newsletter
          </Link>

        </div>

      </aside>
    </>
  );
}