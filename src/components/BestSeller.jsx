
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./BestSeller.css";
import { getProducts } from "../productService";

export default function BestSeller() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadBestSellers = async () => {
      try {
        const data = await getProducts();

        const bestSellers = data.filter(
          (product) =>
            product.is_best_seller === true ||
            product.is_best_seller === 1 ||
            product.is_best_seller === "1"
        );

        if (isMounted) {
          setProducts(bestSellers);
        }
      } catch (error) {
        console.error("Failed to load best sellers:", error);
      }
    };

    loadBestSellers();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return null;
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  return (
    <section className="bestSeller">
      <div className="best-heading">
        <p className="subtitle">BEST SELLERS</p>

        <h2>Our Most Loved Fragrances</h2>

        <p className="description">
          Discover our customers' favorite luxury perfumes,
          carefully crafted to leave a lasting impression.
        </p>
      </div>

      <div className="best-grid">
        {products.map((product) => {
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
            <div className="best-card" key={product.id}>
              <div className="best-image-wrapper">
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.image || product.image_asset || ""}
                    alt={product.name}
                    loading="lazy"
                  />
                </Link>

                <span className="best-badge">
                  BEST SELLER
                </span>
              </div>

              <div className="best-content">
                <h3>{product.name}</h3>

                <p className="best-category">
                  {product.category}
                </p>

                {isGiftSet ? (
                  <p className="best-price">
                    {giftPrice || "Price unavailable"}
                  </p>
                ) : (
                  <div className="best-price">
                    {price50 && <p>50ml: {price50}</p>}
                    {price100 && <p>100ml: {price100}</p>}

                    {!price50 && !price100 && (
                      <p>Price unavailable</p>
                    )}
                  </div>
                )}

                <Link
                  to={`/product/${product.id}`}
                  className="best-view-btn"
                >
                  View Product
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
