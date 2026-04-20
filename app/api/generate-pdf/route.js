import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import ProductPDF from "@/components/ProductPDF";

const MAX_PRODUCTS = 100;

const ALLOWED_IMAGE_HOSTS = [
  "cdn.shopify.com",
  "images.unsplash.com",
  "melaartisans.com",
];

function sanitizeImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  try {
    const u = new URL(url);
    if (!ALLOWED_IMAGE_HOSTS.some((h) => u.hostname.endsWith(h))) return "";
    return u.toString();
  } catch {
    return "";
  }
}

function sanitize(products) {
  return products.map((p) => ({
    ...p,
    images: {
      main: sanitizeImageUrl(p.images?.main),
      gallery: (p.images?.gallery ?? []).map(sanitizeImageUrl).filter(Boolean),
    },
  }));
}

function validate(body) {
  const { products } = body;
  if (!Array.isArray(products)) return "products must be an array";
  if (products.length === 0) return "products array is empty";
  if (products.length > MAX_PRODUCTS)
    return `max ${MAX_PRODUCTS} products, got ${products.length}`;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p.id) return `products[${i}].id is required`;
    if (!p.title) return `products[${i}].title is required`;
    if (!p.pricing?.currency) return `products[${i}].pricing.currency is required`;
    if (typeof p.pricing?.min !== "number") return `products[${i}].pricing.min must be a number`;
    if (typeof p.pricing?.max !== "number") return `products[${i}].pricing.max must be a number`;
  }
  return null;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const err = validate(body);
  if (err) return Response.json({ error: err }, { status: 400 });

  const products = sanitize(body.products);
  const websiteUrl = String(body.websiteUrl || "www.melaartisans.com").slice(0, 100);

  const start = Date.now();
  try {
    const buffer = await renderToBuffer(
      React.createElement(ProductPDF, { products, websiteUrl })
    );
    const elapsed = Date.now() - start;

    console.log(`[pdf] ${products.length} products → ${buffer.byteLength} bytes in ${elapsed}ms`);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="catalog.pdf"',
        "Content-Length": String(buffer.byteLength),
        "X-Generation-Time-Ms": String(elapsed),
        "X-Product-Count": String(products.length),
      },
    });
  } catch (err) {
    console.error("[pdf] generation failed:", err);
    return Response.json(
      {
        error: "PDF generation failed",
        detail: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
