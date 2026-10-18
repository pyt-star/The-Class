import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAlert } from "../context/AlertContext";
import { getProducts } from "../productService";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showAlert } = useAlert();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Scroll to top smoothly whenever id changes (e.g. clicking a related product)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setLoadError("");

      try {
        const products = await getProducts();

        if (cancelled) return;

        const foundProduct = products.find(
          (item) => Number(item.id) === Number(id)
        );

        setProduct(foundProduct || null);

        if (foundProduct) {
          // Track this product ID so back navigation goes right to it
          sessionStorage.setItem("lastViewedProductId", String(foundProduct.id));
          sessionStorage.setItem("shopActiveCategory", foundProduct.category);

          const variants = foundProduct.variants || [];

          // Prefer 50ml as default, or first variant for gift sets
          const defaultVariant =
            variants.find(
              (variant) =>
                String(variant.size_label || variant.size)
                  .trim()
                  .toLowerCase() === "50ml"
            ) ||
            variants[0] ||
            null;

          setSelectedVariant(defaultVariant);

          // Compute other items to display below
          const otherProducts = products.filter(
            (item) => Number(item.id) !== Number(foundProduct.id)
          );

          const isCurrentGiftSet =
            foundProduct.category === "Gift Sets" ||
            foundProduct.category_id === 4;

          const shuffle = (array) => {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
          };

          let chosen = [];
          if (isCurrentGiftSet) {
            // When viewing a gift set: other gift sets MUST be visible and placed first!
            const otherGiftSets = otherProducts.filter(
              (p) => p.category === "Gift Sets" || p.category_id === 4
            );
            const nonGiftSets = otherProducts.filter(
              (p) => p.category !== "Gift Sets" && p.category_id !== 4
            );

            chosen = [
              ...shuffle(otherGiftSets),
              ...shuffle(nonGiftSets),
            ].slice(0, 4);
          } else {
            // Normal perfume: randomized other products (prefer same category or diverse fragrances)
            const sameCategory = otherProducts.filter(
              (p) => p.category === foundProduct.category
            );
            const otherCategories = otherProducts.filter(
              (p) => p.category !== foundProduct.category
            );

            chosen = [
              ...shuffle(sameCategory),
              ...shuffle(otherCategories),
            ].slice(0, 4);
          }

          setRelatedProducts(chosen);
        } else {
          setSelectedVariant(null);
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error("Failed to load product:", error);

        if (!cancelled) {
          setLoadError(
            "We couldn't load this product. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return null;
    }
    return Number(price).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  const handleBackToFragrances = () => {
    const savedCat = sessionStorage.getItem("shopActiveCategory");
    const targetSection = sessionStorage.getItem("scrollTargetSection");

    // If user originated from home bestsellers, return to home
    if (targetSection === "bestseller") {
      navigate("/#best-sellers");
      return;
    }

    // Otherwise return to shop, keeping category filter intact
    if (savedCat && savedCat !== "All") {
      navigate(`/shop?category=${encodeURIComponent(savedCat)}`);
    } else {
      navigate("/shop");
    }
  };

  const handleRelatedProductClick = (item) => {
    sessionStorage.setItem("lastViewedProductId", String(item.id));
    sessionStorage.setItem("scrollTargetSection", "shop");
    sessionStorage.setItem("shopActiveCategory", item.category);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      showAlert({
        type: "error",
        title: "Size unavailable",
        message: "Please select an available bottle size.",
      });
      return;
    }

    if (Number(selectedVariant.stock_quantity) <= 0) {
      showAlert({
        type: "error",
        title: "Out of stock",
        message: `${selectedVariant.size_label} is currently unavailable.`,
      });
      return;
    }

    addToCart(
      product,
      selectedVariant.size_label,
      Number(selectedVariant.price_inr),
      selectedVariant.id
    );

    showAlert({
      type: "cart",
      title: "Added to Your Bag",
      product: {
        name: product.name,
        image: product.image,
        size: selectedVariant.size_label,
        price: Number(selectedVariant.price_inr),
      },
      size: selectedVariant.size_label,
      price: Number(selectedVariant.price_inr),
      confirmText: "VIEW SHOPPING BAG",
      cancelText: "CONTINUE SHOPPING",
    });
  };

  if (loading) {
    return (
      <main className="pdp-page">
        <div className="pdp-container">
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="pdp-page">
        <div className="pdp-container">
          <h2>Unable to load product</h2>
          <p>{loadError}</p>
          <button
            type="button"
            onClick={handleBackToFragrances}
            className="back-link pdp-back-button"
          >
            ← Back to Fragrances
          </button>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pdp-page">
        <div className="pdp-container">
          <h2>Product not found</h2>
          <button
            type="button"
            onClick={handleBackToFragrances}
            className="back-link pdp-back-button"
          >
            ← Back to Fragrances
          </button>
        </div>
      </main>
    );
  }

  const variants = product.variants || [];
  const hasVariants = variants.length > 0;
  const isGiftSet = product.category === "Gift Sets";

  return (
    <main className="pdp-page">
      <div className="pdp-container">
        <div className="pdp-image-section">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="pdp-image-placeholder">
              Image coming soon
            </div>
          )}

          <span className="pdp-category-badge">
            {product.category}
          </span>
        </div>

        <div className="pdp-details-section">
          <button
            type="button"
            onClick={handleBackToFragrances}
            className="back-link pdp-back-button"
          >
            ← Back to Fragrances
          </button>

          <h1>{product.name}</h1>

          {selectedVariant ? (
            <p className="pdp-price">
              ₹{formatPrice(selectedVariant.price_inr)}
            </p>
          ) : (
            <p className="pdp-price">Price unavailable</p>
          )}

          <p className="pdp-description">
            {product.description}
          </p>

          <div className="size-selector">
            <span className="size-label">
              {isGiftSet ? "PACKAGE INCLUDES:" : "BOTTLE SIZE:"}
            </span>

            {hasVariants ? (
              <div className="size-buttons">
                {variants.map((variant) => {
                  const isSelected =
                    selectedVariant?.id === variant.id;

                  const isOutOfStock =
                    Number(variant.stock_quantity) <= 0;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      className={`size-btn ${
                        isSelected ? "active" : ""
                      }`}
                      onClick={() => setSelectedVariant(variant)}
                      aria-pressed={isSelected}
                      disabled={isOutOfStock}
                      title={
                        isOutOfStock
                          ? "Currently out of stock"
                          : `${variant.size_label} - ₹${formatPrice(
                              variant.price_inr
                            )}`
                      }
                    >
                      {variant.size_label}
                      <br />
                      <span>
                        ₹{formatPrice(variant.price_inr)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p>No bottle sizes are available for this product.</p>
            )}
          </div>

          {selectedVariant && (
            <p className="pdp-stock">
              {Number(selectedVariant.stock_quantity) > 0
                ? "In stock"
                : "Out of stock"}
            </p>
          )}

          <button
            className="pdp-add-btn"
            onClick={handleAddToCart}
            disabled={
              !selectedVariant ||
              Number(selectedVariant.stock_quantity) <= 0
            }
          >
            {selectedVariant
              ? `ADD TO CART — ₹${formatPrice(
                  selectedVariant.price_inr
                )}`
              : "UNAVAILABLE"}
          </button>

          <div className="scent-notes-container">
            <h3>About This Fragrance</h3>

            <div className="note-row">
              <span className="note-title">Category</span>
              <span className="note-value">
                {product.category}
              </span>
            </div>

            <div className="note-row">
              <span className="note-title">Size</span>
              <span className="note-value">
                {selectedVariant?.size_label || "Unavailable"}
              </span>
            </div>

            <div className="note-row">
              <span className="note-title">Description</span>
              <span className="note-value">
                {product.description}
              </span>
            </div>
          </div>

          <div className="pdp-perks">
            <div>✔ Free Express Shipping Across India</div>
            <div>✔ Complimentary Luxury Scent Sample Included</div>
          </div>
        </div>
      </div>

      {/* RELATED / OTHER ITEMS SECTION */}
      {relatedProducts.length > 0 && (
        <section className="pdp-related-section">
          <div className="pdp-related-header">
            <p className="pdp-related-subtitle">
              {isGiftSet ? "CURATED COLLECTIONS" : "YOU MAY ALSO LIKE"}
            </p>
            <h2>
              {isGiftSet
                ? "Other Gift Sets You May Like"
                : "Explore More Fragrances"}
            </h2>
            <p className="pdp-related-description">
              {isGiftSet
                ? "Discover our exclusive gift sets and bestselling perfumes, beautifully packaged for any memorable moment."
                : "Handcrafted luxury scents designed for those who leave an unforgettable impression."}
            </p>
          </div>

          <div className="pdp-related-grid">
            {relatedProducts.map((item) => {
              const itemVariants = item.variants || [];
              const itemFiftyMl = itemVariants.find(
                (v) =>
                  String(v.size_label || v.size)
                    .trim()
                    .toLowerCase() === "50ml"
              );
              const itemHundredMl = itemVariants.find(
                (v) =>
                  String(v.size_label || v.size)
                    .trim()
                    .toLowerCase() === "100ml"
              );
              const itemIsGiftSet = item.category === "Gift Sets";
              const itemGiftVariant = itemIsGiftSet ? itemVariants[0] : null;

              const p50 = formatPrice(
                itemFiftyMl?.price_inr ?? itemFiftyMl?.price
              );
              const p100 = formatPrice(
                itemHundredMl?.price_inr ?? itemHundredMl?.price
              );
              const pGift = formatPrice(
                itemGiftVariant?.price_inr ?? itemGiftVariant?.price
              );

              return (
                <div className="pdp-related-card" key={item.id}>
                  <Link
                    to={`/product/${item.id}`}
                    className="pdp-related-image-wrapper"
                    onClick={() => handleRelatedProductClick(item)}
                  >
                    <img
                      src={item.image || item.image_asset || ""}
                      alt={item.name}
                      loading="lazy"
                    />
                    <span className="pdp-related-badge">
                      {item.category}
                    </span>
                  </Link>

                  <div className="pdp-related-content">
                    <h3>{item.name}</h3>

                    <p className="pdp-related-size">
                      {itemIsGiftSet
                        ? itemGiftVariant?.size_label ||
                          itemGiftVariant?.size ||
                          "Gift Set"
                        : "Luxury Eau De Parfum"}
                    </p>

                    {itemIsGiftSet ? (
                      <p className="pdp-related-price">
                        {pGift ? `₹${pGift}` : "Price unavailable"}
                      </p>
                    ) : (
                      <div className="pdp-related-price">
                        {p50 && <span>50ml: ₹{p50}</span>}
                        {p100 && <span>100ml: ₹{p100}</span>}
                        {!p50 && !p100 && (
                          <span>Price unavailable</span>
                        )}
                      </div>
                    )}

                    <Link
                      to={`/product/${item.id}`}
                      className="pdp-related-btn"
                      onClick={() => handleRelatedProductClick(item)}
                    >
                      {itemIsGiftSet
                        ? "View Gift Set →"
                        : "View Fragrance →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
