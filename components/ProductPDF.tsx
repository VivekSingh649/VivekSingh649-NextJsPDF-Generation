import React from "react";
import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
} from "@react-pdf/renderer";

const C = {
    bg: "#fdf7f1",
    primary: "#ff4f33",
    headText: "#111111",
    body: "#444444",
    footer: "#6d6f71",
    priceText: "#ffffff",
    border: "#e8ddd4",
    imageBg: "#f0e8de",
};

function truncateDescription(text: string,) {
    if (!text) return "";
    const cleaned = text.replace(/\n/g, " ").replace(/•/g, "·").trim();
    return cleaned
}

function pickGallery(images: { gallery: string[]; main: string }, max = 3) {
    return images.gallery.filter((src) => src !== images.main).slice(1, max);
}

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
    variants: Array<{ id: number; title: string; price: number; sku: string; available: boolean; option: string }>;
}

interface ProductPDFProps {
    products: Product[];
    websiteUrl?: string;
}


const MAIN_SIZE = 400;
const GUTTER = 4;

const s = StyleSheet.create({
    page: {
        backgroundColor: C.bg,
        fontFamily: "Helvetica",
        paddingBottom: 48,
    },

    // ── Image grid ──────────────────────────────────────────────────────────────
    imageGrid: {
        flexDirection: "row",
        width: "100%",
        height: MAIN_SIZE,
    },
    mainImageCol: {
        width: MAIN_SIZE,
        height: MAIN_SIZE,
        backgroundColor: C.imageBg,
        borderRadius: 6,
        overflow: "hidden",
    },
    mainImage: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
    },
    thumbCol: {
        flex: 1,
        height: MAIN_SIZE,
        flexDirection: "column",
        paddingLeft: GUTTER,
        gap: GUTTER,
    },
    thumbWrapper: {
        flex: 1,
        backgroundColor: C.imageBg,
        borderRadius: 5,
        overflow: "hidden",
    },
    thumbImage: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
    },
    thumbPlaceholder: {
        flex: 1,
        backgroundColor: C.border,
        borderRadius: 5,
    },

    // ── Content area ────────────────────────────────────────────────────────────
    content: {
        paddingHorizontal: 36,
        paddingTop: 30,
    },

    // ── Vendor label ────────────────────────────────────────────────────────────
    vendorLabel: {
        fontSize: 8,
        color: C.primary,
        fontFamily: "Helvetica-Bold",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginBottom: 8,
    },

    // ── Title ───────────────────────────────────────────────────────────────────
    title: {
        fontSize: 28,
        fontFamily: "Helvetica-Bold",
        color: C.headText,
        lineHeight: 1.2,
        letterSpacing: -0.5,
        marginBottom: 14,
    },

    // ── Divider ─────────────────────────────────────────────────────────────────
    divider: {
        height: 1,
        backgroundColor: C.border,
        marginBottom: 14,
    },

    // ── Description ─────────────────────────────────────────────────────────────
    description: {
        fontSize: 10.5,
        color: C.body,
        fontFamily: "Helvetica",
        lineHeight: 1.7,
        marginBottom: 28,
    },

    // ── Price box ───────────────────────────────────────────────────────────────
    priceBox: {
        backgroundColor: C.primary,
        borderRadius: 6,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    priceCell: {
        alignItems: "center",
        flex: 1,
    },
    priceCellBorder: {
        alignItems: "center",
        flex: 1,
        borderLeftWidth: 1,
        borderLeftColor: C.priceText,
        borderRightWidth: 1,
        borderRightColor: C.priceText,
    },
    priceBoxLabel: {
        fontSize: 7,
        color: "rgba(255,255,255,0.65)",
        fontFamily: "Helvetica",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        marginBottom: 4,
    },
    priceBoxValue: {
        fontSize: 18,
        fontFamily: "Helvetica-Bold",
        color: C.priceText,
        letterSpacing: 0.3,
    },

    // ── Footer ──────────────────────────────────────────────────────────────────
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingHorizontal: 36,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: C.bg,
    },
    footerText: {
        fontSize: 8.5,
        color: C.footer,
        fontFamily: "Helvetica",
        letterSpacing: 0.3,
    },
});

function ProductPage({
    product,
    pageNumber,
    totalPages,
    websiteUrl,
}: {
    product: Product;
    pageNumber: number;
    totalPages: number;
    websiteUrl: string;
}) {
    const gallery = pickGallery(product.images, 3);
    const description = truncateDescription(product.description);
    const { min, max, currency } = product.pricing;


    const thumbs: (string | null)[] = [
        gallery[0] ?? null,
        gallery[1] ?? null,
    ];

    return (
        <Page size="A4" style={s.page}>

            {/* ── Image grid: left main + right 3 thumbs ── */}
            <View style={s.imageGrid}>
                {/* Left: large main image */}
                <View style={s.mainImageCol}>
                    {product.images.main ? (
                        <Image src={product.images.main} style={s.mainImage} />
                    ) : (
                        <View style={{ flex: 1, backgroundColor: C.imageBg }} />
                    )}
                </View>

                {/* Right: 3 stacked thumbnails */}
                <View style={s.thumbCol}>
                    {thumbs.map((src, i) =>
                        src ? (
                            <View key={i} style={s.thumbWrapper}>
                                <Image src={src} style={s.thumbImage} />
                            </View>
                        ) : (
                            <View key={i} style={s.thumbPlaceholder} />
                        )
                    )}
                </View>
            </View>

            {/* ── Content ── */}
            <View style={s.content}>
                {/* Vendor */}
                <Text style={s.vendorLabel}>{product.vendor}</Text>

                {/* Title */}
                <Text style={s.title}>{product.title}</Text>

                <View style={s.divider} />

                {/* Description */}
                <Text style={s.description}>{description}</Text>

                {/* Price box */}
                <View style={s.priceBox}>
                    <View style={s.priceCell}>
                        <Text style={s.priceBoxLabel}>Min Price</Text>
                        <Text style={s.priceBoxValue}>{min.toLocaleString()}</Text>
                    </View>
                    <View style={s.priceCellBorder}>
                        <Text style={s.priceBoxLabel}>Max Price</Text>
                        <Text style={s.priceBoxValue}>{max.toLocaleString()}</Text>
                    </View>
                    <View style={s.priceCell}>
                        <Text style={s.priceBoxLabel}>Currency</Text>
                        <Text style={s.priceBoxValue}>{currency}</Text>
                    </View>
                </View>
            </View>

            {/* ── Footer ── */}
            <View style={s.footer} fixed>
                <Text style={s.footerText}>{websiteUrl}</Text>
                <Text style={s.footerText}>{pageNumber} / {totalPages}</Text>
            </View>
        </Page>
    );
}

export default function ProductPDF({
    products = [],
    websiteUrl = "www.melaartisans.com",
}: ProductPDFProps) {
    const total = products.length;
    return (
        <Document
            title="Mela Artisans — Product Catalogue"
            author="Mela Artisans"
            subject="Product Catalogue"
            creator="Mela Artisans"
        >
            {products.map((product, index) => (
                <ProductPage
                    key={product.id}
                    product={product}
                    pageNumber={index + 1}
                    totalPages={total}
                    websiteUrl={websiteUrl}
                />
            ))}
        </Document>
    );
}
