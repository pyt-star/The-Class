import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function formatPrice(pricePaise) {
  return `₹${(Number(pricePaise) / 100).toLocaleString("en-IN")}`;
}

function normalizeProduct(product) {
  const variants = (product.variants || []).map((variant) => ({
    ...variant,
    price: formatPrice(variant.price_paise),
  }));

  const firstVariant = variants[0];
  const fiftyMlVariant = variants.find((variant) => variant.size === "50ml") || firstVariant;
  const hundredMlVariant = variants.find((variant) => variant.size === "100ml") || firstVariant;

  return {
    ...product,
    variants,
    image: product.image || "",
    size: firstVariant?.size || "",
    price: firstVariant?.price || "",
    price50: fiftyMlVariant?.price || firstVariant?.price || "",
    price100: hundredMlVariant?.price || firstVariant?.price || "",
  };
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState(
    supabase ? "" : "Supabase is not configured. Add the environment variables to load products."
  );

  useEffect(() => {
    let isMounted = true;

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    supabase
      .from("active_product_catalog")
      .select("*")
      .order("id")
      .then(({ data, error: queryError }) => {
        if (!isMounted) return;

        if (queryError) {
          setError(queryError.message);
          setLoading(false);
          return;
        }

        setProducts((data || []).map(normalizeProduct));
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, loading, error };
}

export function useProduct(productId) {
  const { products, loading, error } = useProducts();
  const product = products.find((item) => item.id === Number(productId));

  return { product, loading, error };
}
