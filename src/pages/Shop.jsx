import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Shop.css";

// Existing perfume assets
import perfume1 from "../assets/perfume1.jpg";
import perfume2 from "../assets/perfume2.jpg";
import perfume3 from "../assets/perfume3.jpg";

import bestseller1 from "../assets/bestseller1.jpg";
import bestseller2 from "../assets/bestseller2.jpg";
import bestseller3 from "../assets/bestseller3.jpg";

// Gift Set images
import gift1 from "../assets/gift1.png";
import gift2 from "../assets/gift2.png";
import gift3 from "../assets/gift3.png";

const CATEGORIES = [
  "All",
  "Men",
  "Women",
  "Unisex",
  "Gift Sets",
];

export default function Shop() {
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState(
    CATEGORIES.includes(categoryFromUrl)
      ? categoryFromUrl
      : "All"
  );

  // =========================================
  // MASTER PRODUCT CATALOG
  // =========================================

  const products = [

    {
      id: 1,
      name: "Noir Essence",
      category: "Men",
      price: "₹2,499",
      image: perfume1,
      size: "50ml",
    },

    {
      id: 2,
      name: "Velvet Rose",
      category: "Women",
      price: "₹2,999",
      image: perfume2,
      size: "100ml",
    },

    {
      id: 3,
      name: "Midnight Oud",
      category: "Unisex",
      price: "₹3,499",
      image: perfume3,
      size: "75ml",
    },

    {
      id: 4,
      name: "Golden Amber",
      category: "Men",
      price: "₹2,799",
      image: bestseller1,
      size: "50ml",
    },

    {
      id: 5,
      name: "Celestial Bloom",
      category: "Women",
      price: "₹3,199",
      image: bestseller2,
      size: "100ml",
    },

    {
      id: 6,
      name: "Santal Royale",
      category: "Unisex",
      price: "₹3,899",
      image: bestseller3,
      size: "75ml",
    },

    // =========================================
    // GIFT SETS
    // =========================================

    {
      id: 7,
      name: "His & Hers Duo Set",
      category: "Gift Sets",
      price: "₹5,499",
      image: gift1,
      size: "2 x 50ml",
    },

    {
      id: 8,
      name: "Royal Trio Gift Box",
      category: "Gift Sets",
      price: "₹6,999",
      image: gift2,
      size: "3 x 50ml",
    },

    {
      id: 9,
      name: "Discovery Miniature Set",
      category: "Gift Sets",
      price: "₹2,999",
      image: gift3,
      size: "4 x 15ml",
    },

  ];

  // =========================================
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter(
          (item) => item.category === activeCategory
        );

  return (
    <main className="shop-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="shop-header">

        <p className="shop-subtitle">
          THE CLASS COLLECTION
        </p>

        <h1>
          Explore Our Fragrances
        </h1>

        <p className="shop-description">
          Handcrafted luxury scents designed for those
          who leave an unforgettable impression.
        </p>

      </section>


      {/* =====================================
          CATEGORY FILTERS
      ===================================== */}

      <div className="shop-filters">

        {CATEGORIES.map((category) => (

          <button
            key={category}
            className={`filter-btn ${
              activeCategory === category
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveCategory(category)
            }
          >
            {category}
          </button>

        ))}

      </div>


      {/* =====================================
          PRODUCT GRID
      ===================================== */}

      <section className="shop-grid-container">

        <div className="shop-grid">

          {filteredProducts.map((product) => (

            <div
              className="shop-card"
              key={product.id}
            >

              {/* PRODUCT IMAGE */}

              <Link
                to={`/product/${product.id}`}
                className="image-wrapper"
              >

                <img
                  src={product.image}
                  alt={product.name}
                />

                <span className="shop-badge">
                  {product.category}
                </span>

              </Link>


              {/* PRODUCT INFORMATION */}

              <div className="shop-card-content">

                <h3>
                  {product.name}
                </h3>

                <p className="shop-size">
                  {product.size} Eau De Parfum
                </p>

                <p className="shop-price">
                  {product.price}
                </p>


                <Link
                  to={`/product/${product.id}`}
                  style={{
                    textDecoration: "none",
                  }}
                >

                  <button className="shop-add-btn">
                    View Fragrance →
                  </button>

                </Link>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}