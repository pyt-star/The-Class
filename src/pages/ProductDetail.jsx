
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAlert } from "../context/AlertContext";
import { getProducts } from "../productService";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { showAlert } = useAlert();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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
          const variants = foundProduct.variants || [];

          // Prefer 50ml as the default selection.
          const defaultVariant =
            variants.find((variant) => variant.size_label === "50ml") ||
            variants[0] ||
            null;

          setSelectedVariant(defaultVariant);
        } else {
          setSelectedVariant(null);
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

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });

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

    // The fourth argument will be used by the updated CartContext.
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
          <Link to="/shop">← Back to Fragrances</Link>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pdp-page">
        <div className="pdp-container">
          <h2>Product not found</h2>
          <Link to="/shop">← Back to Fragrances</Link>
        </div>
      </main>
    );
  }

  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

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
          <Link to="/shop" className="back-link">
            ← Back to Fragrances
          </Link>

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
            <span className="size-label">BOTTLE SIZE:</span>

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
            <div>✔ Free Express Shipping</div>
            <div>✔ Complimentary Scent Sample Included</div>
          </div>
        </div>
      </div>
    </main>
  );
}
