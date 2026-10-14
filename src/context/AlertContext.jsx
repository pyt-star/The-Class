import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "THE CLASS",
    message: "",
    type: "cart", // 'cart' | 'success' | 'info' | 'error'
    product: null,
    size: "",
    price: null,
    confirmText: "VIEW SHOPPING BAG",
    cancelText: "CONTINUE SHOPPING",
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = useCallback((options) => {
    setModalConfig({
      isOpen: true,
      title: options.title || (options.type === "cart" ? "Added to Your Bag" : "THE CLASS"),
      message: options.message || "",
      type: options.type || "info",
      product: options.product || null,
      size: options.size || (options.product?.size || ""),
      price: options.price || (options.product?.price || null),
      confirmText: options.confirmText !== undefined ? options.confirmText : "VIEW SHOPPING BAG",
      cancelText: options.cancelText !== undefined ? options.cancelText : "CONTINUE SHOPPING",
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
    });
  }, []);

  const closeAlert = useCallback(() => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Globally intercept window.alert so no raw browser dialog is ever shown
  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (msg) => {
      showAlert({
        title: "THE CLASS",
        message: String(msg),
        type: "info",
        confirmText: "CONTINUE",
        cancelText: null,
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showAlert]);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        closeAlert,
        modalConfig,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
