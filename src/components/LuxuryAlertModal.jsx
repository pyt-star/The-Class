import { useEffect } from "react";
import { FiCheckCircle, FiShoppingBag, FiInfo, FiAlertCircle, FiX } from "react-icons/fi";
import { useAlert } from "../context/AlertContext";
import { useCart } from "../context/CartContext";
import "./LuxuryAlertModal.css";

export default function LuxuryAlertModal() {
  const { modalConfig, closeAlert } = useAlert();
  const { setIsCartOpen } = useCart();

  const {
    isOpen,
    title,
    message,
    type,
    product,
    size,
    price,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
  } = modalConfig;

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeAlert();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeAlert]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else if (type === "cart") {
      setIsCartOpen(true);
    }
    closeAlert();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    closeAlert();
  };

  const renderIcon = () => {
    switch (type) {
      case "cart":
        return <FiShoppingBag className="modal-icon cart-icon" />;
      case "success":
        return <FiCheckCircle className="modal-icon success-icon" />;
      case "error":
        return <FiAlertCircle className="modal-icon error-icon" />;
      default:
        return <FiCheckCircle className="modal-icon info-icon" />;
    }
  };

  return (
    <div className="luxury-modal-overlay" onClick={closeAlert}>
      <div
        className="luxury-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* TOP BRAND BAR */}
        <div className="luxury-modal-header">
          <span className="luxury-modal-brand-tag">THE CLASS EXCLUSIVE</span>
          <button
            className="luxury-modal-close-btn"
            onClick={closeAlert}
            aria-label="Close dialog"
            type="button"
          >
            <FiX />
          </button>
        </div>

        {/* CONTENT */}
        <div className="luxury-modal-content">
          <div className="luxury-modal-icon-badge">{renderIcon()}</div>

          <h2 id="modal-title" className="luxury-modal-title">
            {title}
          </h2>

          {message && <p className="luxury-modal-message">{message}</p>}

          {/* PRODUCT CARD PREVIEW (IF CART NOTIFICATION) */}
          {product && (
            <div className="luxury-modal-product-card">
              {product.image && (
                <div className="modal-product-thumb">
                  <img src={product.image} alt={product.name} />
                </div>
              )}
              <div className="modal-product-details">
                <h4 className="modal-product-name">{product.name}</h4>
                <div className="modal-product-meta">
                  <span>{size || product.size || "Standard"}</span>
                  <span className="meta-bullet">•</span>
                  <span>Eau De Parfum</span>
                </div>
                {(price || product.price) && (
                  <p className="modal-product-price">
                    ₹{Number(price || product.price).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="luxury-modal-actions">
          {cancelText && (
            <button
              className="luxury-modal-btn secondary"
              onClick={handleCancel}
              type="button"
            >
              {cancelText}
            </button>
          )}

          <button
            className="luxury-modal-btn primary"
            onClick={handleConfirm}
            type="button"
          >
            {confirmText || "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
