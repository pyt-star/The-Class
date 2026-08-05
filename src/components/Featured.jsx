import React from "react";
import "./Featured.css";

import perfume1 from "../assets/perfume1.jpg";
import perfume2 from "../assets/perfume2.jpg";
import perfume3 from "../assets/perfume3.jpg";

export default function Featured() {
  const products = [
    {
      id: 1,
      image: perfume1,
      name: "Noir Essence",
      category: "Men",
      price: "₹2,499",
    },
    {
      id: 2,
      image: perfume2,
      name: "Velvet Rose",
      category: "Women",
      price: "₹2,999",
    },
    {
      id: 3,
      image: perfume3,
      name: "Midnight Oud",
      category: "Unisex",
      price: "₹3,499",
    },
  ];

  return (
    <section className="featured">

      <div className="featured-heading">

        <p className="subtitle">OUR COLLECTION</p>

        <h2>Signature Fragrances</h2>

        <p className="description">
          Discover handcrafted luxury perfumes designed
          to leave a lasting impression.
        </p>

      </div>

      <div className="category-buttons">

        <button className="active">All</button>
        <button>Men</button>
        <button>Women</button>
        <button>Unisex</button>

      </div>

      <div className="product-grid">

        {products.map((product) => (

          <div className="card" key={product.id}>

            <img src={product.image} alt={product.name} />

            <span className="badge">NEW</span>

            <div className="card-content">

              <h3>{product.name}</h3>

              <p className="product-category">
                {product.category}
              </p>

              <p className="price">
                {product.price}
              </p>

              <button className="shop-btn">
                View Product
              </button>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}