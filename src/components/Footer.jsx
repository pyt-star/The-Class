import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-brand">

          <h2>THE CLASS</h2>

          <p>
            Luxury fragrances crafted with timeless elegance,
            premium ingredients and unforgettable experiences.
          </p>

        </div>

        <div className="footer-links">

          <h3>Quick Links</h3>

          <a href="/">Home</a>
          <a href="/">Featured</a>
          <a href="/">Best Sellers</a>
          <a href="/">About</a>

        </div>

        <div className="footer-links">

          <h3>Collections</h3>

          <a href="/">Men</a>
          <a href="/">Women</a>
          <a href="/">Unisex</a>
          <a href="/">Gift Sets</a>

        </div>

        <div className="footer-links">

          <h3>Support</h3>

          <a href="/">Contact</a>
          <a href="/">Shipping</a>
          <a href="/">Returns</a>
          <a href="/">FAQs</a>

        </div>

      </div>

      <hr />

      <div className="footer-bottom">

        <p>
          © 2026 THE CLASS. All Rights Reserved.
        </p>

        <div className="socials">

          <a href="/">Instagram</a>

          <a href="/">Facebook</a>

          <a href="/">Pinterest</a>

        </div>

      </div>

    </footer>
  );
}