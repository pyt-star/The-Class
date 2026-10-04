import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./BestSeller.css";

import { getProducts } from "../productService";

export default function BestSeller() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadBestSellers = async () => {
      try {
        const data = await getProducts();

        const bestSellers = data.filter(
          (product) => product.is_best_seller === 1
        );

        setProducts(bestSellers);
      } catch (error) {
        console.error(
          "Failed to load best sellers:",
          error
        );
      }
    };

    loadBestSellers();
  }, []);

  return (
    <section className="bestSeller">

      <div className="best-heading">

        <p className="subtitle">
          BEST SELLERS
        </p>

        <h2>
          Our Most Loved Fragrances
        </h2>

        <p className="description">
          Discover our customers' favorite luxury perfumes,
          carefully crafted to leave a lasting impression.
        </p>

      </div>

      <div className="best-grid">

        {products.map((product) => (

          <div
            className="best-card"
            key={product.id}
          >

            <div className="best-image-wrapper">

              <Link
                to={`/product/${product.id}`}
              >

                <img
                  src={product.image}
                  alt={product.name}
                />

              </Link>

              <span className="best-badge">
                BEST SELLER
              </span>

            </div>

            <div className="best-content">

              <h3>
                {product.name}
              </h3>

              <p className="best-category">
                {product.category}
              </p>

              <p className="best-price">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </p>

              <Link
                to={`/product/${product.id}`}
                className="best-view-btn"
              >
                View Product
              </Link>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}