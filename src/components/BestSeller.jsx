import React from "react";
import "./BestSeller.css";

import { FaHeart, FaStar, FaShoppingCart } from "react-icons/fa";

import bestseller1 from "../assets/bestseller1.jpg";
import bestseller2 from "../assets/bestseller2.jpg";
import bestseller3 from "../assets/bestseller3.jpg";
import bestseller4 from "../assets/bestseller4.jpg";

export default function BestSeller() {
  const products = [
    {
      id: 1,
      image: bestseller1,
      name: "Noir Essence",
      price: "₹2,499",
      reviews: "142 Reviews",
      size: "50ml",
    },
    {
      id: 2,
      image: bestseller2,
      name: "Velvet Rose",
      price: "₹2,999",
      reviews: "108 Reviews",
      size: "100ml",
    },
    {
      id: 3,
      image: bestseller3,
      name: "Midnight Oud",
      price: "₹3,499",
      reviews: "95 Reviews",
      size: "75ml",
    },
    {
      id: 4,
      image: bestseller4,
      name: "Golden Amber",
      price: "₹2,799",
      reviews: "131 Reviews",
      size: "50ml",
    },
  ];

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

          <div className="best-card" key={product.id}>

            <div className="heart">

              <FaHeart />

            </div>

            <span className="best-badge">

              BEST SELLER

            </span>

            <img
              src={product.image}
              alt={product.name}
            />

            <div className="best-content">

              <h3>{product.name}</h3>

              <div className="rating">

                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />

                <span>{product.reviews}</span>

              </div>

              <h4>{product.price}</h4>

              <p>{product.size}</p>

              <button>

                <FaShoppingCart />

                Add To Cart

              </button>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}