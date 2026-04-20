import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const colors = {
  brand: "#2C2C2A",
  accent: "#BA7517",
  muted: "#888780",
  border: "#D3D1C7",
  background: "#F9F8F5",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  coverPage: {
    backgroundColor: colors.brand,
    padding: 60,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  coverTitle: {
    fontSize: 36,
    color: colors.white,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 13,
    color: colors.accent,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  coverDate: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 8,
  },
  coverFooter: {
    fontSize: 10,
    color: colors.muted,
  },
  productPage: {
    backgroundColor: colors.white,
    padding: 0,
    flexDirection: "column",
  },
  productCard: {
    flexDirection: "row",
    flex: 1,
    borderBottom: `1 solid ${colors.border}`,
  },
  imageColumn: {
    width: "48%",
    backgroundColor: colors.background,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    maxHeight: 340,
    objectFit: "contain",
  },
  noImage: {
    width: 120,
    height: 120,
    backgroundColor: colors.border,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 9,
    color: colors.muted,
  },
  detailsColumn: {
    width: "52%",
    padding: 40,
    flexDirection: "column",
    justifyContent: "center",
  },
  productTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.brand,
    marginBottom: 12,
    lineHeight: 1.3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  price: {
    fontSize: 22,
    color: colors.accent,
    fontWeight: "bold",
  },
  sku: {
    fontSize: 10,
    color: colors.muted,
    marginLeft: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  description: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 1.7,
  },
  gridPage: {
    backgroundColor: colors.white,
    padding: 32,
    flexDirection: "column",
  },
  gridRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
    flex: 1,
  },
  gridCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 4,
    padding: 16,
    flexDirection: "column",
  },
  gridImage: {
    width: "100%",
    height: 180,
    objectFit: "contain",
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.brand,
    marginBottom: 4,
    lineHeight: 1.3,
  },
  gridPrice: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "bold",
    marginBottom: 4,
  },
  gridSku: {
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 0.5,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerBrand: {
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 1,
  },
  footerPage: {
    fontSize: 9,
    color: colors.muted,
  },
});

const PageFooter = ({ pageNumber, totalPages, brandName }) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerBrand}>{brandName?.toUpperCase()}</Text>
    <Text style={styles.footerPage}>
      {pageNumber} / {totalPages}
    </Text>
  </View>
);

const ProductImageBlock = ({ imageUrl, style }) => {
  if (!imageUrl) {
    return (
      <View style={styles.noImage}>
        <Text style={styles.noImageText}>No image</Text>
      </View>
    );
  }
  return <Image src={imageUrl} style={style} />;
};

const SingleProductPage = ({ product, pageNumber, totalPages, brandName }) => (
  <Page size="A4" orientation="landscape" style={styles.productPage}>
    <View style={styles.productCard}>
      <View style={styles.imageColumn}>
        <ProductImageBlock imageUrl={product.imageUrl} style={styles.productImage} />
      </View>
      <View style={styles.detailsColumn}>
        <Text style={styles.productTitle}>{product.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price}</Text>
          {product.sku ? <Text style={styles.sku}>SKU: {product.sku}</Text> : null}
        </View>
        {product.description ? (
          <>
            <View style={styles.divider} />
            <Text style={styles.description}>{product.description}</Text>
          </>
        ) : null}
      </View>
    </View>
    <PageFooter pageNumber={pageNumber} totalPages={totalPages} brandName={brandName} />
  </Page>
);

const GridPage = ({ products, pageNumber, totalPages, brandName }) => (
  <Page size="A4" style={styles.gridPage}>
    <View style={styles.gridRow}>
      {products.map((product, i) => (
        <View key={i} style={styles.gridCard}>
          <ProductImageBlock imageUrl={product.imageUrl} style={styles.gridImage} />
          <Text style={styles.gridTitle}>{product.title}</Text>
          <Text style={styles.gridPrice}>{product.price}</Text>
          {product.sku ? <Text style={styles.gridSku}>SKU: {product.sku}</Text> : null}
        </View>
      ))}
      {products.length === 1 ? <View style={{ flex: 1 }} /> : null}
    </View>
    <PageFooter pageNumber={pageNumber} totalPages={totalPages} brandName={brandName} />
  </Page>
);

const CoverPage = ({ title, date, productCount }) => (
  <Page size="A4" style={styles.coverPage}>
    <View>
      <Text style={styles.coverTitle}>{title || "Product Catalog"}</Text>
      <Text style={styles.coverSubtitle}>Handcrafted Home Decor</Text>
      {date ? <Text style={styles.coverDate}>{date}</Text> : null}
    </View>
    <View>
      <Text style={styles.coverFooter}>
        {productCount} product{productCount !== 1 ? "s" : ""} · melaartisans.com
      </Text>
    </View>
  </Page>
);

export const CatalogDocument = ({
  products = [],
  title = "Product Catalog",
  date = "",
  layout = "grid",
  brandName = "Mela Artisans",
}) => {
  const gridPages =
    layout === "grid"
      ? products.reduce((pages, product, i) => {
          if (i % 2 === 0) pages.push([product]);
          else pages[pages.length - 1].push(product);
          return pages;
        }, [])
      : [];

  const contentPageCount = layout === "grid" ? gridPages.length : products.length;
  const totalPages = 1 + contentPageCount;

  return (
    <Document title={title} author={brandName} creator={brandName} producer="Mela Artisans Catalog Generator">
      <CoverPage title={title} date={date} productCount={products.length} />
      {layout === "grid"
        ? gridPages.map((pair, i) => (
            <GridPage key={i} products={pair} pageNumber={i + 2} totalPages={totalPages} brandName={brandName} />
          ))
        : products.map((product, i) => (
            <SingleProductPage key={i} product={product} pageNumber={i + 2} totalPages={totalPages} brandName={brandName} />
          ))}
    </Document>
  );
};
