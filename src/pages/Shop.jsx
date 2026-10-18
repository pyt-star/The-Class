
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
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");
  const savedCategory = sessionStorage.getItem("shopActiveCategory");

  const initialCategory = CATEGORIES.includes(categoryFromUrl)
    ? categoryFromUrl
    : (CATEGORIES.includes(savedCategory) ? savedCategory : "All");

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [products, setProducts] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);

  // Sync category state when URL query changes
  useEffect(() => {
    if (categoryFromUrl && CATEGORIES.includes(categoryFromUrl)) {
      setActiveCategory(categoryFromUrl);
      sessionStorage.setItem("shopActiveCategory", categoryFromUrl);
    }
  }, [categoryFromUrl]);

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

  // When returning to shop after viewing a perfume, smoothly scroll to that perfume's section!
  useEffect(() => {
    if (products.length === 0) return;

    const targetId = sessionStorage.getItem("lastViewedProductId");
    const targetSection = sessionStorage.getItem("scrollTargetSection");

    if (!targetId || targetSection !== "shop") return;

    const targetProduct = products.find((p) => String(p.id) === String(targetId));
    if (!targetProduct) {
      sessionStorage.removeItem("lastViewedProductId");
      sessionStorage.removeItem("scrollTargetSection");
      return;
    }

    // If current category filter hides this product, switch to its category
    if (activeCategory !== "All" && activeCategory !== targetProduct.category) {
      setActiveCategory(targetProduct.category);
      sessionStorage.setItem("shopActiveCategory", targetProduct.category);
      setSearchParams({ category: targetProduct.category });
    }

    const timer = setTimeout(() => {
      const el = document.getElementById(`product-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(Number(targetId));
        setTimeout(() => setHighlightedId(null), 2500);
      }
      sessionStorage.removeItem("lastViewedProductId");
      sessionStorage.removeItem("scrollTargetSection");
    }, 120);

    return () => clearTimeout(timer);
  }, [products, activeCategory, setSearchParams]);

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    sessionStorage.setItem("shopActiveCategory", category);
    if (category === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const handleProductClick = (productId) => {
    sessionStorage.setItem("lastViewedProductId", String(productId));
    sessionStorage.setItem("scrollTargetSection", "shop");
    sessionStorage.setItem("shopActiveCategory", activeCategory);
  };

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
            onClick={() => handleCategorySelect(category)}
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
                className={`shop-card ${
                  highlightedId === product.id ? "shop-card-highlighted" : ""
                }`}
                id={`product-${product.id}`}
                key={product.id}
              >
                {/* PRODUCT IMAGE */}
                <Link
                  to={`/product/${product.id}`}
                  className="image-wrapper"
                  onClick={() => handleProductClick(product.id)}
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
                    onClick={() => handleProductClick(product.id)}
                  >
                    <button className="shop-add-btn">
                      {isGiftSet ? "View Gift Set →" : "View Fragrance →"}
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
