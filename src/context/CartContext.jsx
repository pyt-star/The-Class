
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
const CART_STORAGE_KEY = "luxury_cart";
const CART_OWNER_KEY = "luxury_cart_owner";

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || null;
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartReadyRef = useRef(false);
  const skipNextPersistRef = useRef(false);

  // Restore a cart only for the same identity. A logout or account switch
  // starts a clean cart so one customer's bag never appears for another.
  useEffect(() => {
    if (authLoading) return;

    const owner = userId || "guest";
    let savedCart = [];
    let savedOwner = null;

    try {
      savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
      savedOwner = localStorage.getItem(CART_OWNER_KEY);
    } catch (error) {
      console.error("Failed to load saved cart:", error);
    }

    const canRestore = savedOwner === owner && Array.isArray(savedCart);
    const nextCart = canRestore ? savedCart : [];
    skipNextPersistRef.current = true;
    cartReadyRef.current = true;
    setCartItems(nextCart);
    setIsCartOpen(false);

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
      localStorage.setItem(CART_OWNER_KEY, owner);
    } catch (error) {
      console.error("Failed to prepare cart for this account:", error);
    }
  }, [authLoading, userId]);

  useEffect(() => {
    if (authLoading || !cartReadyRef.current) return;
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      localStorage.setItem(CART_OWNER_KEY, userId || "guest");
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [authLoading, cartItems, userId]);

  // Add a product variant to the cart
  // Existing calls with only product, size, and price still work.
  const addToCart = (
    product,
    size = "50ml",
    price,
    variantId = null
  ) => {
    const selectedPrice = Number(
      price ?? product.price ?? 0
    );

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => {
        const sameProduct = item.id === product.id;
        const sameSize = item.size === size;

        // If a variant ID is provided, match that exact variant.
        // Otherwise, retain compatibility with older cart entries.
        const sameVariant =
          variantId != null
            ? String(item.variantId ?? item.variant_id ?? "") ===
              String(variantId)
            : (item.variantId == null && item.variant_id == null) ||
              String(item.variantId ?? item.variant_id ?? "") ===
                String(variantId);

        return sameProduct && sameSize && sameVariant;
      });

      if (existingIndex !== -1) {
        return prevItems.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
                price: selectedPrice,
              }
            : item
        );
      }

      return [
        ...prevItems,
        {
          id: product.id,
          variantId,
          name: product.name,
          image: product.image || product.image_asset || "",
          size,
          price: selectedPrice,
          quantity: 1,
        },
      ];
    });

    setIsCartOpen(true);
  };

  // Remove a product or a specific size/variant
  const removeFromCart = (id, size, variantId = null) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        const sameProduct = item.id === id;

        if (!sameProduct) return true;

        if (size !== undefined && item.size !== size) {
          return true;
        }

        if (variantId != null) {
          const itemVariantId =
            item.variantId ?? item.variant_id ?? null;

          return String(itemVariantId) !== String(variantId);
        }

        return false;
      })
    );
  };

  // Increase or decrease quantity
  const updateQuantity = (
    id,
    size,
    change,
    variantId = null
  ) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          const sameProduct = item.id === id;
          const sameSize = item.size === size;

          const itemVariantId =
            item.variantId ?? item.variant_id ?? null;

          const sameVariant =
            variantId == null
              ? true
              : String(itemVariantId) === String(variantId);

          if (
            !sameProduct ||
            !sameSize ||
            !sameVariant
          ) {
            return item;
          }

          const newQuantity = item.quantity + change;

          return newQuantity > 0
            ? { ...item, quantity: newQuantity }
            : null;
        })
        .filter(Boolean)
    );
  };

  // Empty the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Total number of individual items
  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  // Total price, using the selected variant's price
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 0);

    return sum + price * quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
