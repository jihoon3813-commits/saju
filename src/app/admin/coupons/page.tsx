import { db } from "@/lib/db";
import CouponAdminClient from "@/components/admin/CouponAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await db.coupons.findAll();
  
  // 생성 역순 정렬
  const sortedCoupons = coupons.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const serializedCoupons = sortedCoupons.map((c) => ({
    id: c.id,
    code: c.code,
    discountType: c.discountType,
    discountValue: c.discountValue,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    active: c.active,
    expiresAt: c.expiresAt,
    createdAt: c.createdAt
  }));

  return (
    <CouponAdminClient
      initialCoupons={serializedCoupons}
    />
  );
}
