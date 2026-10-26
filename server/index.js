const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const crypto = require("crypto");
const express = require("express");
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json({ limit: "32kb" }));

class ConfigurationError extends Error {}

function getEnvironment() {
  const values = {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    supabaseUrl: process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([name]) => ({
      keyId: "RAZORPAY_KEY_ID",
      keySecret: "RAZORPAY_KEY_SECRET",
      supabaseUrl: "SUPABASE_URL (or REACT_APP_SUPABASE_URL)",
      supabaseServiceKey: "SUPABASE_SERVICE_ROLE_KEY",
    }[name]));

  if (missing.length) {
    missing.forEach((name) => console.error(`Missing environment variable: ${name}`));
    throw new ConfigurationError("Payment provider misconfigured.");
  }

  return values;
}

function getDatabase(environment) {
  return createClient(environment.supabaseUrl, environment.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function requireCustomer(req, db) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    const error = new Error("Sign in to continue.");
    error.status = 401;
    throw error;
  }

  const { data, error } = await db.auth.getUser(match[1]);
  if (error || !data?.user) {
    const authError = new Error("Your session is invalid. Please sign in again.");
    authError.status = 401;
    throw authError;
  }
  return data.user;
}

async function getCustomerProfile(db, customer) {
  const { data: profile, error } = await db
    .from("profiles")
    .select("id")
    .eq("email", customer.email)
    .maybeSingle();
  if (error) throw error;
  if (!profile?.id) {
    const profileError = new Error("Your customer profile was not found.");
    profileError.status = 400;
    throw profileError;
  }
  return profile;
}

function sendError(res, error) {
  if (error instanceof ConfigurationError) {
    return res.status(500).json({ error: "payment provider misconfigured" });
  }
  if (error.status === 400 || error.status === 401) {
    return res.status(error.status).json({ error: error.message });
  }

  const providerStatus = Number(error.statusCode || 0);
  const providerCode = error.error?.code || error.code || "UNKNOWN";
  const providerDescription = error.error?.description || error.message || "Unknown error";
  if (providerStatus === 401) {
    console.error("Razorpay configuration error:", providerCode, providerDescription);
    return res.status(500).json({ error: "payment provider misconfigured" });
  }
  if (providerStatus === 400 && error.error?.description) {
    console.error("Razorpay request rejected:", providerCode, providerDescription);
    return res.status(400).json({ error: providerDescription });
  }
  if (providerStatus >= 500) {
    console.error("Razorpay service error:", providerCode, providerDescription);
    return res.status(503).json({ error: "Payment service is temporarily unavailable. Please try again." });
  }

  console.error("Payment API error:", error.message || "Unknown error");
  return res.status(500).json({ error: "Unable to process payment right now." });
}

function validateShipping(shipping) {
  const fields = ["full_name", "phone", "address", "city", "state", "postal_code"];
  for (const field of fields) {
    if (typeof shipping?.[field] !== "string" || !shipping[field].trim()) {
      const error = new Error(`Missing or invalid shipping field: ${field}.`);
      error.status = 400;
      throw error;
    }
  }
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    const error = new Error("Cart must contain between 1 and 50 items.");
    error.status = 400;
    throw error;
  }

  const merged = new Map();
  for (const item of items) {
    const productId = Number(item?.product_id);
    const variantId = Number(item?.variant_id);
    const quantity = Number(item?.quantity);
    if (!Number.isSafeInteger(productId) || productId < 1) {
      const error = new Error("Invalid product_id.");
      error.status = 400;
      throw error;
    }
    if (!Number.isSafeInteger(variantId) || variantId < 1) {
      const error = new Error("Invalid variant_id.");
      error.status = 400;
      throw error;
    }
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      const error = new Error("Invalid quantity.");
      error.status = 400;
      throw error;
    }
    const existing = merged.get(variantId);
    if (existing && existing.productId !== productId) {
      const error = new Error("A cart variant does not match its product.");
      error.status = 400;
      throw error;
    }
    merged.set(variantId, {
      productId,
      variantId,
      quantity: quantity + (existing?.quantity || 0),
    });
  }
  return [...merged.values()];
}

function transientRazorpayError(error) {
  const status = Number(error.statusCode || error.status || 0);
  return status >= 500 || (!status && Boolean(error.code));
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function createRazorpayOrder(client, payload) {
  for (let attempt = 0; attempt <= 2; attempt += 1) {
    try {
      return await client.orders.create(payload);
    } catch (error) {
      if (!transientRazorpayError(error) || attempt === 2) throw error;
      await delay(200 * (2 ** attempt));
    }
  }
  throw new Error("Razorpay order creation failed.");
}

app.post("/api/create-order", async (req, res) => {
  try {
    const environment = getEnvironment();
    const db = getDatabase(environment);
    const customer = await requireCustomer(req, db);
    const profile = await getCustomerProfile(db, customer);
    validateShipping(req.body?.shipping);
    const items = normalizeItems(req.body?.items);

    const variantIds = items.map((item) => item.variantId);
    const { data: variants, error: variantError } = await db
      .from("product_variants")
      .select("id, product_id, size_label, price_inr, stock_quantity")
      .in("id", variantIds);
    if (variantError) throw variantError;

    const productIds = [...new Set(items.map((item) => item.productId))];
    const { data: products, error: productError } = await db
      .from("products")
      .select("id, name, active")
      .in("id", productIds);
    if (productError) throw productError;

    const variantById = new Map((variants || []).map((variant) => [Number(variant.id), variant]));
    const productById = new Map((products || []).map((product) => [Number(product.id), product]));
    const verifiedItems = items.map((item) => {
      const variant = variantById.get(item.variantId);
      const product = productById.get(item.productId);
      if (!variant || Number(variant.product_id) !== item.productId || !product || !(product.active === true || Number(product.active) === 1)) {
        const error = new Error("A cart item is no longer available. Refresh your cart and try again.");
        error.status = 400;
        throw error;
      }
      if (item.quantity > variant.stock_quantity) {
        const error = new Error(`${product.name} does not have enough stock for this quantity.`);
        error.status = 400;
        throw error;
      }
      const price = Number(variant.price_inr);
      if (!Number.isSafeInteger(price) || price < 0) {
        const error = new Error("Invalid product price in the catalog.");
        error.status = 400;
        throw error;
      }
      return {
        product_id: item.productId,
        variant_id: item.variantId,
        product_name_snapshot: product.name,
        size_snapshot: variant.size_label,
        unit_price_inr: price,
        quantity: item.quantity,
      };
    });

    const amountInRupees = verifiedItems.reduce(
      (sum, item) => sum + item.unit_price_inr * item.quantity,
      0
    );
    const amount = amountInRupees * 100;
    if (!Number.isSafeInteger(amountInRupees) || !Number.isSafeInteger(amount) || amount < 100) {
      const error = new Error("amount must be at least 100 paise.");
      error.status = 400;
      throw error;
    }

    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        profile_id: profile.id,
        customer_id: null,
        status: "pending",
        subtotal_inr: amountInRupees,
        discount_inr: 0,
        shipping_inr: 0,
        total_inr: amountInRupees,
        shipping_name: req.body.shipping.full_name.trim(),
        shipping_phone: req.body.shipping.phone.trim(),
        shipping_address: [
          req.body.shipping.address.trim(),
          req.body.shipping.city.trim(),
          req.body.shipping.state.trim(),
          req.body.shipping.postal_code.trim(),
        ].join(", "),
      })
      .select("id")
      .single();
    if (orderError) throw orderError;

    const { error: itemsError } = await db
      .from("order_items")
      .insert(verifiedItems.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name_snapshot: item.product_name_snapshot,
        size_snapshot: item.size_snapshot,
        unit_price_inr: item.unit_price_inr,
        quantity: item.quantity,
        order_id: order.id,
      })));
    if (itemsError) throw itemsError;

    const receipt = `tc_${String(order.id).replace(/-/g, "").slice(0, 36)}`.slice(0, 40);
    const razorpay = new Razorpay({ key_id: environment.keyId, key_secret: environment.keySecret });
    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder(razorpay, {
        amount,
        currency: "INR",
        receipt,
        notes: { order_id: String(order.id) },
      });
    } catch (error) {
      const status = Number(error.statusCode || error.status || 0);
      console.error("Razorpay create-order failure:", error.error?.code || error.code || "UNKNOWN", error.error?.description || error.message || "Unknown error");
      if (status === 400 && error.error?.description) {
        return res.status(400).json({ error: error.error.description });
      }
      if (status === 401) {
        return res.status(500).json({ error: "payment provider misconfigured" });
      }
      if (transientRazorpayError(error)) {
        return res.status(503).json({ error: "Payment service is temporarily unavailable. Please try again." });
      }
      throw error;
    }

    if (!razorpayOrder?.id) {
      console.error("Razorpay create-order response did not include an order id.");
      return res.status(502).json({ error: "Payment service returned an invalid response." });
    }

    const { error: persistError } = await db
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", order.id);
    if (persistError) throw persistError;

    return res.json({
      internal_order_id: order.id,
      order_id: razorpayOrder.id,
      amount,
      currency: "INR",
      key_id: environment.keyId,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

app.post("/api/verify-payment", async (req, res) => {
  try {
    const environment = getEnvironment();
    const db = getDatabase(environment);
    const customer = await requireCustomer(req, db);
    const profile = await getCustomerProfile(db, customer);
    const { razorpay_payment_id: paymentId, razorpay_order_id: razorpayOrderId, razorpay_signature: signature } = req.body || {};

    if (![paymentId, razorpayOrderId, signature].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ error: "razorpay_payment_id, razorpay_order_id, and razorpay_signature are required." });
    }
    if (!/^[a-f0-9]{64}$/i.test(signature)) {
      return res.status(400).json({ error: "Payment signature is invalid." });
    }

    const { data: order, error: orderError } = await db
      .from("orders")
      .select("id, profile_id, status, razorpay_order_id, razorpay_payment_id")
      .eq("razorpay_order_id", razorpayOrderId)
      .eq("profile_id", profile.id)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order) return res.status(400).json({ error: "Payment order was not found." });

    const expected = crypto
      .createHmac("sha256", environment.keySecret)
      .update(`${order.razorpay_order_id}|${paymentId}`)
      .digest();
    const received = Buffer.from(signature, "hex");
    if (received.length !== expected.length || !crypto.timingSafeEqual(expected, received)) {
      return res.status(400).json({ error: "Payment signature is invalid." });
    }

    if (order.razorpay_payment_id) {
      if (order.razorpay_payment_id !== paymentId) {
        return res.status(400).json({ error: "This order was paid with a different payment." });
      }
      return res.json({ verified: true, internal_order_id: order.id });
    }
    if (order.status !== "pending") {
      return res.status(400).json({ error: "This order cannot be marked paid." });
    }

    const { data: updatedOrder, error: orderUpdateError } = await db
      .from("orders")
      .update({ status: "confirmed", razorpay_payment_id: paymentId })
      .eq("id", order.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (orderUpdateError) throw orderUpdateError;
    if (!updatedOrder) {
      const { data: latestOrder, error: latestOrderError } = await db
        .from("orders")
        .select("status, razorpay_payment_id")
        .eq("id", order.id)
        .maybeSingle();
      if (latestOrderError) throw latestOrderError;
      if (latestOrder?.razorpay_payment_id !== paymentId || latestOrder.status !== "confirmed") {
        return res.status(400).json({ error: "This order could not be confirmed." });
      }
    }

    return res.json({ verified: true, internal_order_id: order.id });
  } catch (error) {
    return sendError(res, error);
  }
});

app.use("/api", (_req, res) => res.status(404).json({ error: "API route not found." }));

const port = Number(process.env.API_PORT || 4000);
app.listen(port, () => console.log(`Payment API listening on port ${port}.`));
