import { useState } from "react";
import { Link } from "react-router-dom";
import "./Shop.css";

// Reusing your existing perfume assets
import perfume1 from "../assets/perfume1.jpg";
import perfume2 from "../assets/perfume2.jpg";
import perfume3 from "../assets/perfume3.jpg";
import bestseller1 from "../assets/bestseller1.jpg";
import bestseller2 from "../assets/bestseller2.jpg";
import bestseller3 from "../assets/bestseller3.jpg";

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("All");

  // Master product catalog
  const products = [
    { id: 1, name: "Noir Essence", category: "Men", price: "₹2,499", image: perfume1, size: "50ml" },
    { id: 2, name: "Velvet Rose", category: "Women", price: "₹2,999", image: perfume2, size: "100ml" },
    { id: 3, name: "Midnight Oud", category: "Unisex", price: "₹3,499", image: perfume3, size: "75ml" },
    { id: 4, name: "Golden Amber", category: "Men", price: "₹2,799", image: bestseller1, size: "50ml" },
    { id: 5, name: "Celestial Bloom", category: "Women", price: "₹3,199", image: bestseller2, size: "100ml" },
    { id: 6, name: "Santal Royale", category: "Unisex", price: "₹3,899", image: bestseller3, size: "75ml" },
  ];

  // Filter logic: If "All" is selected, show everything. Otherwise, match category.
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((item) => item.category === activeCategory);

  return (
    <main className="shop-page">
      {/* HEADER BANNER */}
      <section className="shop-header">
        <p className="shop-subtitle">THE CLASS COLLECTION</p>
        <h1>Explore Our Fragrances</h1>
        <p className="shop-description">
          Handcrafted luxury scents designed for those who leave an unforgettable impression.
        </p>
      </section>

      {/* CATEGORY FILTER BUTTONS */}
      <div className="shop-filters">
        {["All", "Men", "Women", "Unisex"].map((category) => (
          <button
            key={category}
            className={`filter-btn ${activeCategory === category ? "active" : ""}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <section className="shop-grid-container">
        <div className="shop-grid">
          {filteredProducts.map((product) => (
            <div className="shop-card" key={product.id}>
              {/* 1. Clicking the photo opens the Product Detail Page */}
              <Link to={`/product/${product.id}`} className="image-wrapper">
                <img src={product.image} alt={product.name} />
                <span className="shop-badge">{product.category}</span>
              </Link>

              <div className="shop-card-content">
                <h3>{product.name}</h3>
                <p className="shop-size">{product.size} Eau De Parfum</p>
                <p className="shop-price">{product.price}</p>

                {/* 2. Clicking the button opens the Product Detail Page */}
                <Link to={`/product/${product.id}`} style={{ textDecoration: "none" }}>
                  <button className="shop-add-btn">View Fragrance →</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}