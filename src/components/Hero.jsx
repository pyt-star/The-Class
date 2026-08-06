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
      <div className="hero-content">

        <p className="hero-brand">
          THE CLASS
        </p>

        <div className="hero-line"></div>

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

        <button className="hero-btn">
          DISCOVER COLLECTION
          <span>→</span>
        </button>

      </div>

      <div className="scroll-text">
        SCROLL
      </div>

    </section>
  );
}