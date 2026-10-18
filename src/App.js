
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import LuxuryAlertModal from "./components/LuxuryAlertModal";
import { supabase } from "./supabaseClient";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import ResetPassword from "./pages/ResetPassword";

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

      // Check if we have a pending scroll target for Shop or Home BestSellers
      const targetId = sessionStorage.getItem("lastViewedProductId");
      const targetSection = sessionStorage.getItem("scrollTargetSection");

      if (
        targetId &&
        ((pathname === "/shop" && targetSection === "shop") ||
          (pathname === "/" && targetSection === "bestseller"))
      ) {
        // Let the respective page smoothly scroll to the exact product card
        return;
      }

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    };

    const timer = setTimeout(scrollToTarget, 50);

    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isResetPasswordPage = location.pathname === "/reset-password";

  useEffect(() => {
    testSupabase();
  }, []);

  async function testSupabase() {
    console.log("========== SUPABASE TEST ==========");

    try {
      // Test connection by checking Supabase authentication endpoint
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Supabase connection failed:");
        console.error(error);
        return;
      }

      console.log("✅ Supabase connection successful!");
      console.log("Session:", data.session);
    } catch (error) {
      console.error("❌ Supabase connection failed:");
      console.error(error);
    }

    console.log("===================================");
  }

  return (
    <>
      <ScrollManager />

      {!isResetPasswordPage && <Navbar />}

      {!isResetPasswordPage && <CartDrawer />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
      </Routes>

      {!isResetPasswordPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AlertProvider>
          <Router>
            <AppContent />
            <LuxuryAlertModal />
          </Router>
        </AlertProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
