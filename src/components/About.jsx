import React, { useState } from "react";
import "./About.css";

import about from "../assets/about.jpg";

export default function About() {
  const [storyOpen, setStoryOpen] = useState(false);

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

        <button
          type="button"
          aria-expanded={storyOpen}
          aria-controls="class-brand-story"
          onClick={() => setStoryOpen((open) => !open)}
        >
          {storyOpen ? "Close Our Story" : "Discover Our Story"}
        </button>

        {storyOpen && (
          <div className="about-story-reveal" id="class-brand-story">
            <p className="about-story-kicker">THE ART OF A SIGNATURE</p>
            <h3>A scent that feels like you.</h3>
            <p>
              At THE CLASS, we believe fragrance is the most personal part of
              getting dressed. It can mark a moment, change a mood, and stay in
              someone’s memory long after you leave the room.
            </p>
            <p>
              That is why every composition is considered as a journey: a
              luminous first impression, a distinctive heart, and a warm,
              lasting finish. Explore until you find the one that feels
              unmistakably yours.
            </p>
          </div>
        )}

      </div>

    </section>
  );
}
