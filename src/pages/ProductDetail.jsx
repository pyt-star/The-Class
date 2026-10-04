import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getProducts } from "../productService";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();

  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================
  // FETCH PRODUCT FROM SUPABASE
  // =========================================

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await getProducts();

        const foundProduct = products.find(
          (item) => item.id === Number(id)
        );

        setProduct(foundProduct || null);
      } catch (error) {
        console.error(
          "Failed to load product:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <main className="pdp-page">
        <div className="pdp-container">
          <p>Loading product...</p>
        </div>
      </main>
    );
  }

  // =========================================
  // PRODUCT NOT FOUND
  // =========================================

  if (!product) {
    return (
      <main className="pdp-page">
        <div className="pdp-container">
          <h2>Product not found</h2>

          <Link to="/shop">
            ← Back to Fragrances
          </Link>
        </div>
      </main>
    );
  }

  // =========================================
  // PRICE
  // =========================================

  const numericPrice = Number(product.price);

  const formattedPrice = numericPrice.toLocaleString(
    "en-IN"
  );

  // =========================================
  // ADD TO CART
  // =========================================

  const handleAddToCart = () => {
    addToCart(
      product,
      product.size,
      numericPrice
    );

    alert(
      `${product.name} (${product.size}) added to your bag!`
    );
  };

  return (
    <main className="pdp-page">

      <div className="pdp-container">

        {/* =====================================
            PRODUCT IMAGE
        ===================================== */}

        <div className="pdp-image-section">

          <img
            src={product.image}
            alt={product.name}
          />

          <span className="pdp-category-badge">
            {product.category}
          </span>

        </div>


        {/* =====================================
            PRODUCT DETAILS
        ===================================== */}

        <div className="pdp-details-section">

          <Link
            to="/shop"
            className="back-link"
          >
            ← Back to Fragrances
          </Link>


          <h1>
            {product.name}
          </h1>


          <p className="pdp-price">
            ₹{formattedPrice}
          </p>


          <p className="pdp-description">
            {product.description}
          </p>


          {/* ===================================
              SIZE
          =================================== */}

          {product.size && (
            <div className="size-selector">

              <span className="size-label">
                BOTTLE SIZE:
              </span>

              <div className="size-buttons">

                <button
                  className="size-btn active"
                  type="button"
                >
                  {product.size}
                </button>

              </div>

            </div>
          )}


          {/* ===================================
              ADD TO CART
          =================================== */}

          <button
            className="pdp-add-btn"
            onClick={handleAddToCart}
          >
            ADD TO CART — ₹{formattedPrice}
          </button>


          {/* ===================================
              DESCRIPTION
          =================================== */}

          <div className="scent-notes-container">

            <h3>
              About This Fragrance
            </h3>

            <div className="note-row">

              <span className="note-title">
                Category
              </span>

              <span className="note-value">
                {product.category}
              </span>

            </div>

            <div className="note-row">

              <span className="note-title">
                Size
              </span>

              <span className="note-value">
                {product.size || "Not specified"}
              </span>

            </div>

            <div className="note-row">

              <span className="note-title">
                Description
              </span>

              <span className="note-value">
                {product.description}
              </span>

            </div>

          </div>


          {/* ===================================
              GUARANTEES
          =================================== */}

          <div className="pdp-perks">

            <div>
              ✔ Free Express Shipping
            </div>

            <div>
              ✔ Complimentary Scent Sample Included
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}