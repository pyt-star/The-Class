import { Link } from "react-router-dom";
import "./Hero.css";
import hero from "../assets/hero.png";

export default function Hero() {
  return (
    <section
      className="hero"
      style={{
        backgroundImage: `url(${hero})`,
      }}
    >
      {/* TOP/LEFT: Text Content */}
      <div className="hero-content">
        <div className="hero-brand-container">
          <p className="hero-brand">THE CLASS</p>
          <div className="hero-line"></div>
        </div>

        <h1>
          Crafted for
          <br />
          timeless elegance.
        </h1>

        <p className="hero-text">
          Luxury fragrances crafted with precision
          for those who leave an unforgettable
          impression.
        </p>
      </div>

      {/* BOTTOM/CENTER: Button and Scroll */}
      <div className="hero-bottom-actions">
        <Link to="/shop" className="hero-btn">
          DISCOVER COLLECTION
          <span>→</span>
        </Link>

        
      </div>
    </section>
  );
}