import "./Newsletter.css";
import newsletter from "../assets/newsletter.jpg";

export default function Newsletter() {
  return (
    <section
      className="newsletter"
      style={{
        backgroundImage: `url(${newsletter})`,
      }}
    >
      <div className="newsletter-overlay">

        <div className="newsletter-content">

          <p className="newsletter-subtitle">
            STAY CONNECTED
          </p>

          <h2>
            Discover Your
            <br />
            Signature Fragrance
          </h2>

          <p className="newsletter-text">
            Be the first to know about new arrivals,
            exclusive collections and luxury offers.
          </p>

          <div className="newsletter-form">

            <input
              type="email"
              placeholder="Enter your email"
            />

            <button>
              Subscribe
            </button>

          </div>

          <span>
            No spam. Only timeless fragrances.
          </span>

        </div>

      </div>
    </section>
  );
}