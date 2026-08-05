import React from "react";
import "./About.css";

import about from "../assets/about.jpg";

export default function About() {
  return (
    <section className="about">

      <div className="about-image">
        <img src={about} alt="About Brand" />
      </div>

      <div className="about-content">

        <p className="about-subtitle">
          ABOUT OUR BRAND
        </p>

        <h2>
          Crafted for
          <br />
          Timeless Elegance
        </h2>

        <p className="about-text">
          Every fragrance we create is inspired by timeless
          sophistication and crafted using carefully selected
          ingredients. Our mission is to deliver luxurious scents
          that express individuality, confidence and elegance in
          every moment.
        </p>

        <div className="about-features">

          <div>✔ Premium Ingredients</div>

          <div>✔ Long Lasting Fragrance</div>

          <div>✔ Cruelty Free</div>

          <div>✔ Expert Craftsmanship</div>

        </div>

        <button>
          Discover Our Story
        </button>

      </div>

    </section>
  );
}