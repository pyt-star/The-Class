import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./context/CartContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const scrollToTarget = () => {
      if (hash) {
        const id = decodeURIComponent(hash.substring(1));
        const element = document.getElementById(id);

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          return;
        }
      }

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    };

    // Small delay gives React time to render the destination page.
    const timer = setTimeout(scrollToTarget, 50);

    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollManager />

        <Navbar />

        <CartDrawer />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>

        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App;