import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, getOrCreateAnonymousSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const anonSessionId = await getOrCreateAnonymousSession();

  let orders: any[] = [];
  if (user) {
    orders = await db.orders.findByUserId(user.id);
  } else if (anonSessionId) {
    // 익명 사용자는 임시 테이블 구조에서 대조
    const allOrders = await db.orders.findAll();
    // 익명 사용자 주문 매칭 (chartId 세션 정보 매치 또는 orders 목록에서 2차 검증)
    // chartId 내부에 profileId가 있고 그 profile이 익명 세션인지 검사
    const anonProfiles = await db.profiles.findByAnonymousSessionId(anonSessionId);
    const anonProfileIds = anonProfiles.map((p) => p.id);
    
    orders = allOrders.filter((o) => {
      try {
        const inputs = JSON.parse(o.chartId || "{}");
        return anonProfileIds.includes(inputs.profileId);
      } catch {
        return false;
      }
    });
  }

  // 상태 배지 매핑
  const statusBadgeMap: Record<string, { text: string; style: string }> = {
    pending: { text: "결제 대기", style: "bg-slate-800 text-slate-400 border-slate-700" },
    authorized: { text: "승인 완료", style: "bg-indigo-950 text-indigo-400 border-indigo-900" },
    paid: { text: "결제 완료", style: "bg-emerald-950 text-emerald-400 border-emerald-900" },
    report_generating: { text: "리포트 생성중", style: "bg-sky-950 text-sky-400 border-sky-900 animate-pulse" },
    completed: { text: "분석 완수", style: "bg-teal-950 text-teal-400 border-teal-900" },
    failed: { text: "결제 실패", style: "bg-rose-950 text-rose-400 border-rose-900" },
    cancelled: { text: "결제 취소", style: "bg-slate-900 text-slate-500 border-slate-800" },
    refund_requested: { text: "환불 요청", style: "bg-amber-950 text-amber-400 border-amber-900" },
    refunded: { text: "환불 완료", style: "bg-rose-950 text-rose-300 border-rose-900" }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
              구매 내역 및 리포트 보관함
            </h1>
            <p className="mt-2 text-slate-400 text-sm">
              내가 주문한 프리미엄 운세 리포트 목록을 보관하고 다운로드할 수 있습니다.
            </p>
          </div>
          <Link
            href="/products"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-bold rounded-lg transition"
          >
            + 새 상품 보기
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border border-slate-900 rounded-3xl">
            <p className="text-slate-400 mb-6 text-sm">구매하신 유료 리포트 내역이 없습니다.</p>
            <Link
              href="/products"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 font-bold text-sm rounded-xl text-slate-100 hover:opacity-95 transition"
            >
              프리미엄 운세 리포트 둘러보기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(async (order) => {
              const product = await db.products.findById(order.productId);
              const badge = statusBadgeMap[order.status] || { text: order.status, style: "bg-slate-800 text-slate-300 border-slate-700" };

              return (
                <div
                  key={order.id}
                  className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.style}`}>
                        {badge.text}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {order.id.slice(0, 8)}...</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">
                      {product?.title || "유료 리포트"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      구매 시각: {order.createdAt.toLocaleString()}
                    </p>
                    <p className="text-sm font-bold text-slate-300">
                      결제금액: {order.amount.toLocaleString()} 원
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition"
                    >
                      거래 세부 내역
                    </Link>

                    {order.status === "completed" && order.interpretationId ? (
                      <Link
                        href={`/orders/${order.id}/report`}
                        className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-slate-100 text-xs font-bold rounded-lg shadow-md transition"
                      >
                        리포트 열람 📜
                      </Link>
                    ) : order.status === "report_generating" ? (
                      <Link
                        href={`/checkout/success?orderId=${order.id}`}
                        className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-slate-100 text-xs font-bold rounded-lg transition"
                      >
                        대기열 확인 ⏳
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
