import { supabase } from "./supabaseClient";

const categoryMap = {
  1: "Men",
  2: "Women",
  3: "Unisex",
  4: "Gift Sets",
};

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", 1)
    .order("id");

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  return data.map((product) => ({
    ...product,
    category: categoryMap[product.category_id],
    image: product.image_asset,
  }));
}