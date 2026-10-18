
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

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await getProducts();

        if (isMounted) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter(
          (item) => item.category === activeCategory
        );

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return null;
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  return (
    <main className="shop-page">
      {/* HEADER */}
      <section className="shop-header">
        <p className="shop-subtitle">
          THE CLASS COLLECTION
        </p>

        <h1>Explore Our Fragrances</h1>

        <p className="shop-description">
          Handcrafted luxury scents designed for those
          who leave an unforgettable impression.
        </p>
      </section>

      {/* CATEGORY FILTERS */}
      <div className="shop-filters">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`filter-btn ${
              activeCategory === category ? "active" : ""
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <section className="shop-grid-container">
        <div className="shop-grid">
          {filteredProducts.map((product) => {
            const variants = product.variants || [];

            const fiftyMl = variants.find(
              (variant) =>
                String(variant.size_label || variant.size)
                  .trim()
                  .toLowerCase() === "50ml"
            );

            const hundredMl = variants.find(
              (variant) =>
                String(variant.size_label || variant.size)
                  .trim()
                  .toLowerCase() === "100ml"
            );

            const isGiftSet = product.category === "Gift Sets";

            const giftVariant = isGiftSet ? variants[0] : null;

            const price50 = formatPrice(
              fiftyMl?.price_inr ?? fiftyMl?.price
            );

            const price100 = formatPrice(
              hundredMl?.price_inr ?? hundredMl?.price
            );

            const giftPrice = formatPrice(
              giftVariant?.price_inr ?? giftVariant?.price
            );

            return (
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
                    src={product.image || product.image_asset || ""}
                    alt={product.name}
                    loading="lazy"
                  />

                  <span className="shop-badge">
                    {product.category}
                  </span>
                </Link>

                {/* PRODUCT INFORMATION */}
                <div className="shop-card-content">
                  <h3>{product.name}</h3>

                  <p className="shop-size">
                    {isGiftSet
                      ? giftVariant?.size_label ||
                        giftVariant?.size ||
                        "Gift Set"
                      : "Luxury Eau De Parfum"}
                  </p>

                  {isGiftSet ? (
                    <p className="shop-price">
                      {giftPrice || "Price unavailable"}
                    </p>
                  ) : (
                    <div className="shop-price">
                      {price50 && (
                        <p>50ml: {price50}</p>
                      )}

                      {price100 && (
                        <p>100ml: {price100}</p>
                      )}

                      {!price50 && !price100 && (
                        <p>Price unavailable</p>
                      )}
                    </div>
                  )}

                  {/* VIEW PRODUCT */}
                  <Link
                    to={`/product/${product.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <button className="shop-add-btn">
                      View Fragrance →
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
