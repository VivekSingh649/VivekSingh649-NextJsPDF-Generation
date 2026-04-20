"use client";

import { useState } from "react";

interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  tags: string[];
  pricing: { min: number; max: number; currency: string };
  images: { main: string; gallery: string[] };
  options: Array<{ name: string; values: string[] }>;
  variants: Array<{
    id: number;
    title: string;
    price: number;
    sku: string;
    available: boolean;
    option: string;
  }>;
}

interface Stats {
  productCount: number;
  fetchMs: number;
  pdfMs: number | null;
  fileSizeKb: number | null;
}

const PRESETS = [
  { label: "Shop All (60)", url: "https://melaartisans.com/collections/shop-all/products.json?limit=60" },
  { label: "25% Off (20)", url: "https://melaartisans.com/collections/25-off/products.json?limit=20" },
  { label: "New Arrivals (30)", url: "https://melaartisans.com/collections/new-arrivals/products.json?limit=30" },
  { label: "Best Sellers (50)", url: "https://melaartisans.com/collections/best-sellers/products.json?limit=50" },
];

function sanitizeImageUrl(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    u.searchParams.set("width", "400");
    return u.toString();
  } catch {
    return "";
  }
}

function transformProduct(raw: any): Product {
  const variants = raw.variants || [];
  const prices = variants.map((v: any) => parseFloat(v.price)).filter((p: number) => !isNaN(p));
  return {
    id: String(raw.id),
    title: raw.title,
    handle: raw.handle,
    description: (raw.body_html || "").replace(/<[^>]*>/g, "").trim(),
    vendor: raw.vendor,
    tags: Array.isArray(raw.tags) ? raw.tags.map((t: string) => t.trim()) : [],
    pricing: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
      currency: variants[0]?.price_currency || "INR",
    },
    images: {
      main: raw.image?.src || raw.images?.[0]?.src || "",
      gallery: (raw.images || []).map((img: any) => sanitizeImageUrl(img.src)).filter(Boolean),
    },
    options: (raw.options || []).map((opt: any) => ({ name: opt.name, values: opt.values })),
    variants: variants.map((v: any) => ({
      id: v.id,
      title: v.title,
      price: parseFloat(v.price),
      sku: v.sku,
      available: true,
      option: v.option1,
    })),
  };
}

function validateProducts(products: Product[]): string | null {
  if (products.length === 0) return "No products fetched";
  if (products.length > 100) return `Too many products: ${products.length} (max 100)`;
  for (let i = 0; i < products.length; i++) {
    if (!products[i].title) return `Product[${i}] missing title`;
    if (typeof products[i].pricing.min !== "number") return `Product[${i}] invalid pricing`;
  }
  return null;
}

export default function TestPage() {
  const [url, setUrl] = useState(PRESETS[0].url);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState("");
  const [fetching, setFetching] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function fetchProducts() {
    setFetching(true);
    setStatus("Fetching products…");
    setProducts([]);
    setStats(null);
    const t0 = Date.now();
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const transformed = (data.products || []).map(transformProduct);
      const fetchMs = Date.now() - t0;
      const err = validateProducts(transformed);
      if (err) { setStatus(`Validation error: ${err}`); return; }
      setProducts(transformed);
      setStats({ productCount: transformed.length, fetchMs, pdfMs: null, fileSizeKb: null });
      setStatus(`Fetched ${transformed.length} products in ${fetchMs}ms`);
    } catch (e: any) {
      setStatus(`Fetch failed: ${e.message}`);
    } finally {
      setFetching(false);
    }
  }

  async function downloadPdf() {
    if (products.length === 0) return;
    setDownloading(true);
    setStatus("Generating PDF…");
    const t0 = Date.now();
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products, websiteUrl: "www.melaartisans.com" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const pdfMs = parseInt(res.headers.get("X-Generation-Time-Ms") || "0", 10);
      const blob = await res.blob();
      const fileSizeKb = Math.round(blob.size / 1024);
      const totalMs = Date.now() - t0;
      setStats((s) => s ? { ...s, pdfMs, fileSizeKb } : null);
      setStatus(`PDF ready in ${pdfMs}ms server / ${totalMs}ms total — ${fileSizeKb} KB`);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "catalog.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      setStatus(`PDF failed: ${e.message}`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>PDF Generator — Test</h1>
      <p style={{ color: "#666", marginBottom: 28, fontSize: 14 }}>Fetch products, validate, and benchmark PDF download.</p>

      {/* Preset buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {PRESETS.map((p) => (
          <button
            key={p.url}
            onClick={() => setUrl(p.url)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: `2px solid ${url === p.url ? "#ff4f33" : "#e0d6cc"}`,
              background: url === p.url ? "#fff2f0" : "#fff",
              color: url === p.url ? "#ff4f33" : "#333",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: url === p.url ? 600 : 400,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom URL */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…/products.json?limit=60"
          style={{
            flex: 1, padding: "9px 12px", borderRadius: 6,
            border: "1.5px solid #ddd", fontSize: 13, outline: "none",
          }}
        />
        <button
          onClick={fetchProducts}
          disabled={fetching || !url}
          style={{
            padding: "9px 20px", borderRadius: 6, border: "none",
            background: fetching ? "#ccc" : "#111", color: "#fff",
            cursor: fetching ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600,
          }}
        >
          {fetching ? "Fetching…" : "Fetch Products"}
        </button>
      </div>

      {/* Stats bar */}
      {stats && (
        <div style={{
          display: "flex", gap: 24, padding: "14px 20px",
          background: "#f9f5f1", borderRadius: 8, marginBottom: 20,
          border: "1px solid #e8ddd4", fontSize: 13,
        }}>
          <Stat label="Products" value={String(stats.productCount)} />
          <Stat label="Fetch time" value={`${stats.fetchMs}ms`} />
          <Stat label="PDF gen (server)" value={stats.pdfMs != null ? `${stats.pdfMs}ms` : "—"} />
          <Stat label="File size" value={stats.fileSizeKb != null ? `${stats.fileSizeKb} KB` : "—"} />
        </div>
      )}

      {/* Status */}
      {status && (
        <p style={{ fontSize: 13, color: status.includes("fail") || status.includes("error") ? "#cc2200" : "#226600", marginBottom: 16 }}>
          {status}
        </p>
      )}

      {/* Download button */}
      {products.length > 0 && (
        <button
          onClick={downloadPdf}
          disabled={downloading}
          style={{
            padding: "10px 28px", borderRadius: 6, border: "none",
            background: downloading ? "#ccc" : "#ff4f33",
            color: "#fff", cursor: downloading ? "not-allowed" : "pointer",
            fontSize: 14, fontWeight: 700, marginBottom: 28,
          }}
        >
          {downloading ? "Generating…" : `Download PDF (${products.length} products)`}
        </button>
      )}

      {/* Product list */}
      {products.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f0e8de" }}>
              {["#", "Title", "Vendor", "Price (min–max)", "Images"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #efe8e0" }}>
                <td style={{ padding: "8px 12px", color: "#999" }}>{i + 1}</td>
                <td style={{ padding: "8px 12px", fontWeight: 500, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</td>
                <td style={{ padding: "8px 12px", color: "#666" }}>{p.vendor}</td>
                <td style={{ padding: "8px 12px" }}>
                  {p.pricing.currency} {p.pricing.min.toLocaleString()}
                  {p.pricing.min !== p.pricing.max && ` – ${p.pricing.max.toLocaleString()}`}
                </td>
                <td style={{ padding: "8px 12px", color: "#888" }}>{p.images.gallery.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{value}</div>
    </div>
  );
}
