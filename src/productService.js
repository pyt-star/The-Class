
import { supabase } from "./supabaseClient";

const categoryMap = {
  1: "Men",
  2: "Women",
  3: "Unisex",
  4: "Gift Sets",
};

export async function getProducts() {
  // Fetch product information
  const {
    data: products,
    error: productsError,
  } = await supabase
    .from("products")
    .select(
      "id, name, category_id, description, image_asset, is_featured, is_best_seller, active"
    )
    .eq("active", 1)
    .order("id");

  if (productsError) {
    console.error("Error fetching products:", productsError);
    throw productsError;
  }

  if (!products || products.length === 0) {
    return [];
  }

  // Fetch bottle sizes, prices, and stock
  const {
    data: variants,
    error: variantsError,
  } = await supabase
    .from("product_variants")
    .select(
      "id, product_id, size_label, price_inr, stock_quantity, sku"
    )
    .order("id");

  if (variantsError) {
    console.error("Error fetching product variants:", variantsError);
    throw variantsError;
  }

  // Attach variants to their respective products
  return products.map((product) => {
    const productVariants = (variants || [])
      .filter(
        (variant) => variant.product_id === product.id
      )
      .sort((a, b) => {
        const sizeOrder = {
          "50ml": 1,
          "100ml": 2,
        };

        return (
          (sizeOrder[a.size_label] || 99) -
          (sizeOrder[b.size_label] || 99)
        );
      })
      .map((variant) => ({
        ...variant,
        size: variant.size_label,
        price: Number(variant.price_inr),
        stock: Number(variant.stock_quantity),
        formattedPrice: `₹${Number(
          variant.price_inr
        ).toLocaleString("en-IN")}`,
      }));

    const fiftyMl = productVariants.find(
      (variant) => variant.size_label === "50ml"
    );

    const hundredMl = productVariants.find(
      (variant) => variant.size_label === "100ml"
    );

    return {
      ...product,
      category: categoryMap[product.category_id] || "Other",
      image: product.image_asset || "",
      variants: productVariants,

      // Convenience values for product cards
      price50: fiftyMl?.price ?? null,
      price100: hundredMl?.price ?? null,

      // Default selection for existing components
      size: fiftyMl?.size || productVariants[0]?.size || "",
      price: fiftyMl?.price ?? productVariants[0]?.price ?? null,
    };
  });
}
