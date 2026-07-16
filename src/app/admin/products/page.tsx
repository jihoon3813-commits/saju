import { db } from "@/lib/db";
import ProductAdminClient from "@/components/admin/ProductAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await db.products.findAll();
  
  const priceVersions: Record<string, any[]> = {};
  for (const prod of products) {
    const versions = await db.priceVersions.findByProductId(prod.id);
    // 생성 역순 정렬
    priceVersions[prod.id] = versions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  const serializedProducts = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    active: p.active,
    productType: p.productType
  }));

  const serializedPriceVersions: Record<string, any[]> = {};
  for (const [prodId, list] of Object.entries(priceVersions)) {
    serializedPriceVersions[prodId] = list.map((pv) => ({
      id: pv.id,
      productId: pv.productId,
      price: pv.price,
      version: pv.version,
      createdAt: pv.createdAt
    }));
  }

  return (
    <ProductAdminClient
      initialProducts={serializedProducts}
      priceVersions={serializedPriceVersions}
    />
  );
}
