import React from "react";
import { Link } from "react-router-dom";
import "./Category.css";

import men from "../assets/men.jpg";
import women from "../assets/women.jpg";
import unisex from "../assets/unisex.jpg";
import gift from "../assets/gift.jpg";

const categories = [
  {
    title: "Men",
    label: "FOR MEN",
    description:
      "Bold, confident fragrances crafted for the modern gentleman.",
    image: men,
    category: "Men",
  },
  {
    title: "Women",
    label: "FOR WOMEN",
    description:
      "Elegant perfumes that celebrate beauty and individuality.",
    image: women,
    category: "Women",
  },
  {
    title: "Unisex",
    label: "FOR EVERYONE",
    description:
      "Sophisticated scents designed to be shared by everyone.",
    image: unisex,
    category: "Unisex",
  },
  {
    title: "Gift Sets",
    label: "PERFECT GIFTS",
    description:
      "Beautifully curated perfume collections for every occasion.",
    image: gift,
    category: "Gift Sets",
  },
];

export default function Category() {
  return (
    <section className="category">

      <div className="category-heading">

        <p>SHOP BY CATEGORY</p>

        <h2>
          Find Your Signature Fragrance
        </h2>

        <span>
          Discover fragrances tailored to every personality and occasion.
        </span>

      </div>

      <div className="category-grid">

        {categories.map((item, index) => (

          <Link
            to={`/shop?category=${encodeURIComponent(item.category)}`}
            className="category-card"
            key={index}
            style={{
              backgroundImage: `url(${item.image})`,
            }}
          >

            <div className="overlay">

              <span className="category-label">
                {item.label}
              </span>

              <h3>
                {item.title}
              </h3>

              <p>
                {item.description}
              </p>

              <span className="overlay-btn">
                Explore →
              </span>

            </div>

          </Link>

        ))}

      </div>

    </section>
  );
}