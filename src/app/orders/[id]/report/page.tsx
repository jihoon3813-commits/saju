import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser, getOrCreateAnonymousSession } from "@/lib/auth";
import { getManseChartAction } from "@/app/actions/manse";
import PremiumResultClient from "@/components/interpretation/PremiumResultClient";

export const dynamic = "force-dynamic";

export default async function PremiumReportPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. 주문 조회
  const order = await db.orders.findById(id);
  if (!order || order.status !== "completed" || !order.interpretationId) {
    redirect("/orders");
  }

  // 2. 권한 검증
  const user = await getCurrentUser();
  const anonSessionId = await getOrCreateAnonymousSession();

  let isOwner = false;
  if (order.userId) {
    if (user && order.userId === user.id) isOwner = true;
  } else {
    const anonProfiles = await db.profiles.findByAnonymousSessionId(anonSessionId);
    const anonProfileIds = anonProfiles.map((p) => p.id);
    try {
      const inputs = JSON.parse(order.chartId || "{}");
      if (anonProfileIds.includes(inputs.profileId)) {
        isOwner = true;
      }
    } catch {
      // ignore
    }
  }

  // 관리자 권한 허용
  if (user && user.role === "admin") {
    isOwner = true;
  }

  if (!isOwner) {
    redirect("/orders");
  }

  // 3. 해석서 및 상품 정보 로딩
  const interpretation = await db.interpretations.findById(order.interpretationId);
  if (!interpretation) {
    notFound();
  }

  const product = await db.products.findById(order.productId);
  if (!product) {
    notFound();
  }

  // 4. 사주 원국 정보 대조 (명식 출력을 위한 만세력 호출)
  const inputs = JSON.parse(order.chartId || "{}");
  const chartRes = await getManseChartAction({ profileId: inputs.profileId });
  const chart = chartRes.success && chartRes.chart ? chartRes.chart : null;

  let chart2 = null;
  if (inputs.profileId2) {
    const chartRes2 = await getManseChartAction({ profileId: inputs.profileId2 });
    if (chartRes2.success && chartRes2.chart) {
      chart2 = chartRes2.chart;
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href={`/orders/${order.id}`} className="text-sm text-indigo-400 hover:text-indigo-300 transition">
            ← 영수증 지면으로
          </Link>
          <a
            href={`/api/orders/${order.id}/pdf`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-bold rounded-lg transition shadow-md shadow-indigo-950"
          >
            A4 인쇄용 PDF 소장하기 📥
          </a>
        </div>

        {/* 프리미엄 결과지 전용 대화형 뷰어 연결 */}
        <PremiumResultClient
          orderId={order.id}
          productTitle={product.title}
          productType={product.productType}
          interpretation={interpretation.reportData}
          chart={chart}
          chart2={chart2}
        />
      </div>
    </main>
  );
}
