import React from "react";
import "./Hero.css";

export default function Hero() {
  return (
    <section
      className="hero"
      style={{
        backgroundImage: "url('/perfume.jpg')",
      }}
    >
      <div className="overlay"></div>

      <nav>
        <a href="/">Home</a>
        <a href="/">About</a>
        <a href="/">Contact</a>
      </nav>

      <div className="content">
        <p className="tagline">A SCENT THAT DEFINES YOU</p>

        <h1>
          PERFUME IS AN
          <br />
          EXPERIENCE
        </h1>

        <svg
          className="orbit"
          viewBox="0 0 1200 700"
          preserveAspectRatio="none"
        >
          <path
            d="M130 460
            C130 620 1030 620 1060 260
            C1090 60 210 120 180 410
            C170 510 230 540 450 540"
          />

          <g transform="translate(1040 190)">
            <line x1="-35" y1="0" x2="35" y2="0" />
            <line x1="0" y1="-35" x2="0" y2="35" />
            <line x1="-25" y1="-25" x2="25" y2="25" />
            <line x1="-25" y1="25" x2="25" y2="-25" />
          </g>

          <g transform="translate(160 430)">
            <line x1="-20" y1="0" x2="20" y2="0" />
            <line x1="0" y1="-20" x2="0" y2="20" />
            <line x1="-14" y1="-14" x2="14" y2="14" />
            <line x1="-14" y1="14" x2="14" y2="-14" />
          </g>
        </svg>

        <div className="buttons">
          <button>See You Next</button>
          <button>www.reallygreatsite.com</button>
        </div>
      </div>
    </section>
  );
}