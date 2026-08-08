import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiMenu,
  FiHeart,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";

import { useCart } from "../context/CartContext";
import "./Navbar.css";

export default function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);

  const {
    totalItems,
    setIsCartOpen,
  } = useCart();


  useEffect(() => {

    const handleKeyDown = (e) => {

      if (e.key === "Escape") {
        setMenuOpen(false);
      }

    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };

  }, []);


  useEffect(() => {

    document.body.style.overflow = menuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };

  }, [menuOpen]);


  const closeMenu = () => {
    setMenuOpen(false);
  };


  return (
    <>

      {/* =================================
          TOP NAVBAR
      ================================= */}

      <header className="navbar">

        <button
          className="menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <FiMenu />
        </button>


        <Link
          to="/#home"
          className="navbar-logo"
          onClick={closeMenu}
        >
          THE CLASS
        </Link>


        <div className="navbar-icons">

          <button
            className="icon-btn"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <FiHeart />
          </button>


          <button
            className="icon-btn"
            aria-label="Shopping Bag"
            onClick={() => setIsCartOpen(true)}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
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
      >

        <div className="sidebar-header">

          <span className="sidebar-brand">
            THE CLASS
          </span>

          <button
            className="close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <FiX />
          </button>

        </div>


        <nav className="sidebar-nav">

          <Link
            to="/#home"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/shop"
            onClick={closeMenu}
          >
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

        </nav>


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