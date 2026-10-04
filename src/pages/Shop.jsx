import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Shop.css";
import { getProducts } from "../productService";

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

  const [products, setProducts] = useState([]);

  // =========================================
  // LOAD PRODUCTS FROM SUPABASE
  // =========================================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error(
          "Failed to load products:",
          error
        );
      }
    };

    loadProducts();
  }, []);

  // =========================================
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter(
          (item) =>
            item.category === activeCategory
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

              {/* =================================
                  PRODUCT IMAGE
              ================================= */}

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


              {/* =================================
                  PRODUCT INFORMATION
              ================================= */}

              <div className="shop-card-content">

                <h3>
                  {product.name}
                </h3>

                <p className="shop-size">
                  {product.size
                    ? `${product.size} Eau De Parfum`
                    : "Eau De Parfum"}
                </p>

                <p className="shop-price">
                  ₹
                  {Number(
                    product.price
                  ).toLocaleString("en-IN")}
                </p>


                {/* =================================
                    VIEW PRODUCT
                ================================= */}

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