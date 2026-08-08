import Hero from "../components/Hero";
import BestSeller from "../components/BestSeller";
import Category from "../components/Category";
import About from "../components/About";
import WhyChooseUs from "../components/WhyChooseUs";
import Newsletter from "../components/Newsletter";

export default function Home() {
  return (
    <main className="home-page">

      <div id="home" className="home-anchor">
        <Hero />
      </div>

      <div id="best-sellers" className="home-anchor">
        <BestSeller />
      </div>

      <div id="shop-by-category" className="home-anchor">
        <Category />
      </div>

      <div id="our-story" className="home-anchor">
        <About />
      </div>

      <div id="why-the-class" className="home-anchor">
        <WhyChooseUs />
      </div>

      <div id="newsletter" className="home-anchor">
        <Newsletter />
      </div>

    </main>
  );
}