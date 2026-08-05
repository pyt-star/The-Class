import React from "react";
import "./Category.css";

import men from "../assets/men.jpg";
import women from "../assets/women.jpg";
import unisex from "../assets/unisex.jpg";
import gift from "../assets/gift.jpg";

const categories = [
  {
    title: "Men",
    description: "Bold, confident fragrances crafted for the modern gentleman.",
    image: men,
  },
  {
    title: "Women",
    description: "Elegant perfumes that celebrate beauty and individuality.",
    image: women,
  },
  {
    title: "Unisex",
    description: "Sophisticated scents designed to be shared by everyone.",
    image: unisex,
  },
  {
    title: "Gift Sets",
    description: "Beautifully curated perfume collections for every occasion.",
    image: gift,
  },
];

export default function Category() {
  return (
    <section className="category">

      <div className="category-heading">

        <p>SHOP BY CATEGORY</p>

        <h2>Find Your Signature Fragrance</h2>

        <span>
          Discover fragrances tailored to every personality and occasion.
        </span>

      </div>

      <div className="category-grid">

        {categories.map((item, index) => (

          <div
            className="category-card"
            key={index}
            style={{
              backgroundImage: `url(${item.image})`,
            }}
          >

            <div className="overlay">

              <h3>{item.title}</h3>

              <p>{item.description}</p>

              <button>Explore →</button>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}