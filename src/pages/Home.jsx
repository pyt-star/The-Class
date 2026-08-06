// src/pages/Home.jsx
import Hero from "../components/Hero";
import Featured from "../components/Featured";
import BestSeller from "../components/BestSeller";
import Category from "../components/Category";
import About from "../components/About";
import WhyChooseUs from "../components/WhyChooseUs";
import Newsletter from "../components/Newsletter";

export default function Home() {
  return (
    <main>
      <Hero />
      <Featured />
      <BestSeller />
      <Category />
      <About />
      <WhyChooseUs />
      <Newsletter />
    </main>
  );
}