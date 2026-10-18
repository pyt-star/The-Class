
import {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("luxury_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to load saved cart:", error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save cart changes to local storage
  useEffect(() => {
    try {
      localStorage.setItem("luxury_cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cartItems]);

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
