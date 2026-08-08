import React from "react";
import { Link } from "react-router-dom";
import "./BestSeller.css";

import perfume1 from "../assets/perfume1.jpg";
import bestseller1 from "../assets/bestseller1.jpg";
import bestseller2 from "../assets/bestseller2.jpg";
import bestseller3 from "../assets/bestseller3.jpg";

export default function BestSeller() {

  const products = [
    {
      id: 1,
      image: perfume1,
      name: "Noir Essence",
      category: "Men",
      price: "₹2,499",
    },
    {
      id: 4,
      image: bestseller1,
      name: "Golden Amber",
      category: "Men",
      price: "₹2,799",
    },
    {
      id: 5,
      image: bestseller2,
      name: "Celestial Bloom",
      category: "Women",
      price: "₹3,199",
    },
    {
      id: 6,
      image: bestseller3,
      name: "Santal Royale",
      category: "Unisex",
      price: "₹3,899",
    },
  ];

  return (
    <section className="bestSeller">

      <div className="best-heading">

        <p className="subtitle">
          BEST SELLERS
        </p>

        <h2>
          Our Most Loved Fragrances
        </h2>

        <p className="description">
          Discover our customers' favorite luxury perfumes,
          carefully crafted to leave a lasting impression.
        </p>

      </div>

      <div className="best-grid">

        {products.map((product) => (

          <div className="best-card" key={product.id}>

            <div className="best-image-wrapper">

              <Link to={`/product/${product.id}`}>

                <img
                  src={product.image}
                  alt={product.name}
                />

              </Link>

              <span className="best-badge">
                BEST SELLER
              </span>

            </div>

            <div className="best-content">

              <h3>
                {product.name}
              </h3>

              <p className="best-category">
                {product.category}
              </p>

              <p className="best-price">
                {product.price}
              </p>

              <Link
                to={`/product/${product.id}`}
                className="best-view-btn"
              >
                View Product
              </Link>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}