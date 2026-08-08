import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./ProductDetail.css";

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

export default function ProductDetail() {

  // =========================================
  // GET PRODUCT ID
  // =========================================

  const { id } = useParams();

  const [selectedSize, setSelectedSize] =
    useState("50ml");

  const { addToCart } = useCart();


  // =========================================
  // MASTER PRODUCT CATALOG
  // =========================================

  const products = [

    {
      id: 1,
      name: "Noir Essence",
      category: "Men",

      price50: "₹2,499",
      price100: "₹3,799",

      image: perfume1,

      description:
        "A mysterious, intoxicating fragrance crafted for the modern gentleman. Noir Essence combines dark woody undertones with a refreshing burst of citrus.",

      topNotes:
        "Italian Bergamot, Black Pepper, Lavender",

      heartNotes:
        "Cedarwood, Damask Rose, Nutmeg",

      baseNotes:
        "Madagascan Vanilla, Smoked Amber, Oud",
    },


    {
      id: 2,
      name: "Velvet Rose",
      category: "Women",

      price50: "₹2,999",
      price100: "₹4,299",

      image: perfume2,

      description:
        "An elegant, timeless perfume celebrating beauty and grace. Velvet Rose captures the essence of a blooming garden bathed in warm morning sunlight.",

      topNotes:
        "Pink Peony, Freesia, Lychee",

      heartNotes:
        "Velvet Rose Petals, Magnolia, Lily of the Valley",

      baseNotes:
        "White Musk, Honeywood, Warm Cedar",
    },


    {
      id: 3,
      name: "Midnight Oud",
      category: "Unisex",

      price50: "₹3,499",
      price100: "₹4,999",

      image: perfume3,

      description:
        "A sophisticated scent designed to be shared. Midnight Oud is rich, bold, and unapologetically luxurious, leaving a powerful trail wherever you go.",

      topNotes:
        "Saffron, Cardamom, Bergamot",

      heartNotes:
        "Rare Agarwood (Oud), Patchouli, Leather",

      baseNotes:
        "Amberwood, Bourbon Vanilla, Smoked Vetiver",
    },


    {
      id: 4,
      name: "Golden Amber",
      category: "Men",

      price50: "₹2,799",
      price100: "₹3,999",

      image: bestseller1,

      description:
        "Warm, opulent, and refined. Golden Amber wraps you in a comforting embrace of spiced honey and rich woods.",

      topNotes:
        "Cinnamon, Orange Blossom, Pink Pepper",

      heartNotes:
        "Amber Crystals, Tonka Bean, Tobacco Leaf",

      baseNotes:
        "Sandalwood, Vanilla Bourbon, Benzoin",
    },


    {
      id: 5,
      name: "Celestial Bloom",
      category: "Women",

      price50: "₹3,199",
      price100: "₹4,499",

      image: bestseller2,

      description:
        "Airy, radiant, and undeniably chic. Celestial Bloom evokes a dreamy night under starlit skies.",

      topNotes:
        "Mandarin, Jasmine Nectar, Dewdrops",

      heartNotes:
        "Tuberose, Orange Blossom, Orchid",

      baseNotes:
        "White Amber, Cashmere Wood, Musk",
    },


    {
      id: 6,
      name: "Santal Royale",
      category: "Unisex",

      price50: "₹3,899",
      price100: "₹5,499",

      image: bestseller3,

      description:
        "The absolute pinnacle of luxury craftsmanship. Santal Royale is a smooth, creamy sandalwood scent that radiates quiet elegance.",

      topNotes:
        "Australian Sandalwood, Cardamom, Violet Leaf",

      heartNotes:
        "Papyrus, Iris, Amberwood",

      baseNotes:
        "Cedar, Leather, White Musk",
    },


    // =========================================
    // GIFT SET 1
    // =========================================

    {
      id: 7,

      name: "His & Hers Duo Set",

      category: "Gift Sets",

      price50: "₹5,499",
      price100: "₹5,499",

      image: gift1,

      description:
        "A perfectly paired gift set for two, featuring one signature men's and one signature women's fragrance in an elegant presentation box.",

      topNotes:
        "Italian Bergamot, Pink Peony, Freesia",

      heartNotes:
        "Cedarwood, Damask Rose, Magnolia",

      baseNotes:
        "Madagascan Vanilla, White Musk, Smoked Amber",
    },


    // =========================================
    // GIFT SET 2
    // =========================================

    {
      id: 8,

      name: "Royal Trio Gift Box",

      category: "Gift Sets",

      price50: "₹6,999",
      price100: "₹6,999",

      image: gift2,

      description:
        "Our most generous gift box, bringing together three of the house's most loved scents in one luxurious keepsake case.",

      topNotes:
        "Saffron, Cardamom, Mandarin",

      heartNotes:
        "Rare Agarwood (Oud), Tuberose, Amber Crystals",

      baseNotes:
        "Sandalwood, Bourbon Vanilla, Smoked Vetiver",
    },


    // =========================================
    // GIFT SET 3
    // =========================================

    {
      id: 9,

      name: "Discovery Miniature Set",

      category: "Gift Sets",

      price50: "₹2,999",
      price100: "₹2,999",

      image: gift3,

      description:
        "The perfect introduction to THE CLASS — four travel-friendly miniatures so you can find your signature scent before committing to a full bottle.",

      topNotes:
        "Bergamot, Jasmine Nectar, Black Pepper",

      heartNotes:
        "Damask Rose, Patchouli, Orange Blossom",

      baseNotes:
        "Amberwood, White Musk, Tonka Bean",
    },

  ];


  // =========================================
  // FIND PRODUCT
  // =========================================

  const product =
    products.find(
      (item) => item.id === Number(id)
    ) || products[0];


  // =========================================
  // PRICE
  // =========================================

  const currentPrice =
    selectedSize === "50ml"
      ? product.price50
      : product.price100;


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
            {currentPrice}
          </p>


          <p className="pdp-description">
            {product.description}
          </p>


          {/* ===================================
              SIZE SELECTOR
          =================================== */}

          {product.category !== "Gift Sets" && (

            <div className="size-selector">

              <span className="size-label">
                SELECT BOTTLE SIZE:
              </span>

              <div className="size-buttons">

                <button
                  className={`size-btn ${
                    selectedSize === "50ml"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedSize("50ml")
                  }
                >
                  50ml / 1.7 oz
                </button>


                <button
                  className={`size-btn ${
                    selectedSize === "100ml"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedSize("100ml")
                  }
                >
                  100ml / 3.4 oz
                </button>

              </div>

            </div>

          )}


          {/* ===================================
              ADD TO CART
          =================================== */}

          <button
            className="pdp-add-btn"
            onClick={() => {

              addToCart(
                product,
                selectedSize,
                currentPrice
              );

              alert(
                `${product.name} (${selectedSize}) added to your bag!`
              );

            }}
          >
            ADD TO CART — {currentPrice}
          </button>


          {/* ===================================
              SCENT NOTES
          =================================== */}

          <div className="scent-notes-container">

            <h3>
              Olfactory Pyramid
            </h3>


            <div className="note-row">

              <span className="note-title">
                Top Notes
              </span>

              <span className="note-value">
                {product.topNotes}
              </span>

            </div>


            <div className="note-row">

              <span className="note-title">
                Heart Notes
              </span>

              <span className="note-value">
                {product.heartNotes}
              </span>

            </div>


            <div className="note-row">

              <span className="note-title">
                Base Notes
              </span>

              <span className="note-value">
                {product.baseNotes}
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