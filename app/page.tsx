"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ProductPDF from "../components/ProductPDF";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false }
);

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

function transformProduct(product: any): Product {
  const variants = product.variants || [];

  const prices = variants
    .map((v: any) => parseFloat(v.price))
    .filter((p: number) => !isNaN(p));

  return {
    id: String(product.id),
    title: product.title,
    handle: product.handle,
    description: product.body_html.replace(/<[^>]*>/g, "").trim(),
    vendor: product.vendor,

    tags: product.tags
      ? product.tags?.map((t: string) => t.trim())
      : [],

    pricing: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
      currency: variants[0]?.price_currency || "INR",
    },

    images: {
      main: product.image?.src || product.images[0]?.src || "",
      gallery: product.images?.map((img: any) => {
        const u = new URL(img.src);
        u.searchParams.set("width", "400");
        return u.toString();
      }) || [],
    },

    options:
      product.options?.map((opt: any) => ({
        name: opt.name,
        values: opt.values,
      })) || [],

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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "https://melaartisans.com/collections/shop-all/products.json?limit=2"
        );
        const data = await res.json();
        const formattedProducts = data.products
          .map((p: any) => transformProduct(p));
        setProducts(formattedProducts);
        console.log("Fetched products:", formattedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", fontSize: "18px" }}>
        Loading PDF...
      </div>
    );
  }

  return (
    <PDFViewer width="100%" height="800px">
      <ProductPDF
        products={products}
        websiteUrl="www.melaartisans.com"
      />
    </PDFViewer>
  );
}