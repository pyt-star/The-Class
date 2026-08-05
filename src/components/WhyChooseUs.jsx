import React from "react";
import "./WhyChooseUs.css";

import {
  FaAward,
  FaLeaf,
  FaClock,
  FaGift
} from "react-icons/fa";

export default function WhyChooseUs() {

  const features = [

    {
      icon: <FaAward />,
      title: "Premium Quality",
      text: "Expertly crafted fragrances made using the finest ingredients."
    },

    {
      icon: <FaLeaf />,
      title: "Cruelty Free",
      text: "Every perfume is ethically produced without animal testing."
    },

    {
      icon: <FaClock />,
      title: "Long Lasting",
      text: "Luxury scents that stay with you throughout the entire day."
    },

    {
      icon: <FaGift />,
      title: "Luxury Packaging",
      text: "Beautifully designed bottles and gift-ready packaging."
    }

  ];

  return (

    <section className="why">

      <div className="why-heading">

        <p className="why-subtitle">

          WHY CHOOSE US

        </p>

        <h2>

          Crafted With Excellence

        </h2>

        <p className="why-description">

          We combine timeless elegance with premium ingredients
          to create unforgettable fragrances for every occasion.

        </p>

      </div>

      <div className="why-grid">

        {features.map((item, index)=>(

          <div className="why-card" key={index}>

            <div className="why-icon">

              {item.icon}

            </div>

            <h3>

              {item.title}

            </h3>

            <p>

              {item.text}

            </p>

          </div>

        ))}

      </div>

    </section>

  );

}