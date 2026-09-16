import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-brand">

          <Link
            to="/#home"
            className="footer-logo"
          >
            THE CLASS
          </Link>

          <p>
            Luxury fragrances crafted with timeless elegance,
            premium ingredients and unforgettable experiences.
          </p>

        </div>


        {/* QUICK LINKS */}
        <div className="footer-links">

          <h3>
            Quick Links
          </h3>

          <Link to="/#home">
            Home
          </Link>

          <Link to="/shop">
            Fragrances
          </Link>

          <Link to="/#best-sellers">
            Best Sellers
          </Link>

          <Link to="/#shop-by-category">
            Shop by Category
          </Link>

        </div>


        {/* COLLECTIONS */}
        <div className="footer-links">

          <h3>
            Collections
          </h3>

          <Link to="/shop?category=Men">
            Men
          </Link>

          <Link to="/shop?category=Women">
            Women
          </Link>

          <Link to="/shop?category=Unisex">
            Unisex
          </Link>

          <Link to="/shop?category=Gift%20Sets">
            Gift Sets
          </Link>

        </div>


        {/* EXPLORE */}
        <div className="footer-links">

          <h3>
            Explore
          </h3>

          <Link to="/#our-story">
            Our Story
          </Link>

          <Link to="/#why-the-class">
            Why The Class
          </Link>

          <Link to="/#newsletter">
            Newsletter
          </Link>

          <Link to="/shop">
            Shop All
          </Link>

        </div>

      </div>


      <hr />


      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">

        <p>
          © 2026 THE CLASS. All Rights Reserved.
        </p>

        <div className="socials">

          <span>
            Instagram
          </span>

          <span>
            Facebook
          </span>

          <span>
            Pinterest
          </span>

          <Link to="/privacy-policy">
            Privacy Policy
          </Link>

        </div>

      </div>

    </footer>
  );
}