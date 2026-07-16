import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser, getOrCreateAnonymousSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. 주문 데이터 로딩
  const order = await db.orders.findById(id);
  if (!order) {
    notFound();
  }

  // 2. 권한 검증
  const user = await getCurrentUser();
  const anonSessionId = await getOrCreateAnonymousSession();

  let isOwner = false;
  if (order.userId) {
    if (user && order.userId === user.id) isOwner = true;
  } else {
    // 익명 세션 대조
    const anonProfiles = await db.profiles.findByAnonymousSessionId(anonSessionId);
    const anonProfileIds = anonProfiles.map((p) => p.id);
    try {
      const inputs = JSON.parse(order.chartId || "{}");
      if (anonProfileIds.includes(inputs.profileId)) {
        isOwner = true;
      }
    } catch {
      // JSON parse error
    }
  }

  // 관리자 권한 예외 허용
  if (user && user.role === "admin") {
    isOwner = true;
  }

  if (!isOwner) {
    redirect("/orders");
  }

  // 3. 연계 데이터 로딩
  const product = await db.products.findById(order.productId);
  const priceVersion = await db.priceVersions.findById(order.priceVersionId);
  const coupon = order.couponId ? await db.coupons.findById(order.couponId) : null;

  // 4. 주문 상세 입력 변수 디코딩
  let chartInputs: Record<string, any> = {};
  try {
    chartInputs = JSON.parse(order.chartId || "{}");
  } catch (e) {
    console.error("chartId parsing failure inside order detail page");
  }

  const profile1 = await db.profiles.findById(chartInputs.profileId || "");
  const profile2 = chartInputs.profileId2 ? await db.profiles.findById(chartInputs.profileId2) : null;

  // 상태 배지 매핑
  const statusBadgeMap: Record<string, { text: string; style: string }> = {
    pending: { text: "결제 진행 대기", style: "bg-slate-800 text-slate-400 border-slate-700" },
    authorized: { text: "인증 승인", style: "bg-indigo-950 text-indigo-400 border-indigo-900" },
    paid: { text: "결제 완료 (해석 대기)", style: "bg-emerald-950 text-emerald-400 border-emerald-900" },
    report_generating: { text: "해석서 생성 중", style: "bg-sky-950 text-sky-400 border-sky-900 animate-pulse" },
    completed: { text: "분석 완료", style: "bg-teal-950 text-teal-400 border-teal-900" },
    failed: { text: "결제 승인 거절", style: "bg-rose-950 text-rose-400 border-rose-900" },
    cancelled: { text: "사용자 결제 취소", style: "bg-slate-900 text-slate-500 border-slate-800" },
    refund_requested: { text: "환불 요청 검토중", style: "bg-amber-950 text-amber-400 border-amber-900" },
    refunded: { text: "환불 반환 완료", style: "bg-rose-950 text-rose-300 border-rose-900" }
  };
  const badge = statusBadgeMap[order.status] || { text: order.status, style: "bg-slate-800 text-slate-300" };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/orders" className="text-sm text-indigo-400 hover:text-indigo-300 transition">
            ← 보관함 리스트로 돌아가기
          </Link>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 space-y-8 backdrop-blur-md shadow-2xl">
          {/* 타이틀 및 영수증 번호 */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badge.style}`}>
                {badge.text}
              </span>
              <h1 className="text-2xl font-bold mt-3 text-slate-100">결제 상세 영수증</h1>
              <p className="text-slate-500 text-xs font-mono mt-1">주문 식별 번호: {order.id}</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>주문 생성: {order.createdAt.toLocaleString()}</p>
              {order.paidAt && <p>결제 승인: {order.paidAt.toLocaleString()}</p>}
              {order.refundedAt && <p className="text-rose-400">환불 승인: {order.refundedAt.toLocaleString()}</p>}
            </div>
          </div>

          {/* 구매 내역 목록 */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 mb-3">결제 품목</h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex justify-between items-center text-sm">
              <div>
                <p className="font-bold text-slate-200">{product?.title || "프리미엄 리포트"}</p>
                <p className="text-xs text-slate-500 mt-1">버전: {priceVersion?.version || "1.0.0"}</p>
              </div>
              <span className="font-bold text-slate-100">
                {(priceVersion?.price || 0).toLocaleString()} 원
              </span>
            </div>
          </div>

          {/* 할인 및 최종 결제액 */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 mb-3">결제 금액 정산</h3>
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-900 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>기본 정가</span>
                <span>{(priceVersion?.price || 0).toLocaleString()} 원</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <span>쿠폰 적용</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded">
                      {coupon.code}
                    </span>
                  </span>
                  <span className="text-rose-400">
                    - {Math.max(0, (priceVersion?.price || 0) - order.amount).toLocaleString()} 원
                  </span>
                </div>
              )}
              <div className="border-t border-slate-900 pt-3 flex justify-between font-bold text-slate-200">
                <span>실제 승인 금액</span>
                <span className="text-emerald-400">{order.amount.toLocaleString()} 원</span>
              </div>
            </div>
          </div>

          {/* 대상자 사주 정보 파라미터 대조 */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 mb-3">적용 사주 프로필</h3>
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-900 text-sm">
              {profile1 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">대상자 1 (본인)</span>
                  <span className="text-slate-200">
                    {profile1.alias} ({profile1.birthDate} {profile1.birthTime || "시간미상"})
                  </span>
                </div>
              )}
              {profile2 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">대상자 2 (상대방)</span>
                  <span className="text-slate-200">
                    {profile2.alias} ({profile2.birthDate} {profile2.birthTime || "시간미상"})
                  </span>
                </div>
              )}
              {chartInputs.question && (
                <div className="border-t border-slate-900 pt-3 space-y-1">
                  <span className="text-xs text-slate-500 block">입력된 분석 질문</span>
                  <p className="text-xs text-slate-300 italic">"{chartInputs.question}"</p>
                </div>
              )}
              {chartInputs.year && (
                <div className="flex justify-between">
                  <span className="text-slate-400">대상 연도</span>
                  <span className="text-slate-200 font-bold">{chartInputs.year} 년</span>
                </div>
              )}
            </div>
          </div>

          {/* 환불 / 액션 라우트 통제 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-800/80">
            {order.status === "completed" && order.interpretationId ? (
              <>
                <Link
                  href={`/orders/${order.id}/report`}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-95 text-white font-bold text-sm rounded-xl text-center shadow-lg"
                >
                  프리미엄 리포트 열람하기 📜
                </Link>
                <a
                  href={`/api/orders/${order.id}/pdf`}
                  className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl text-center border border-slate-700"
                >
                  A4 PDF 소장하기 📥
                </a>
              </>
            ) : order.status === "report_generating" ? (
              <div className="w-full p-4 bg-indigo-950/20 border border-indigo-900/50 rounded-2xl text-center text-sm font-semibold text-indigo-300 animate-pulse">
                현재 AI가 분석 결과 리포트를 집필하는 중입니다. 잠시만 대기해 주세요.
              </div>
            ) : null}

            {/* 환불 조건 분기 */}
            {order.status === "completed" ? (
              <div className="w-full text-center text-slate-500 text-xs py-2 bg-slate-950/30 rounded-xl">
                🔒 본 리포트는 분석 완료되어 규정상 청약철회(환불)가 불가능합니다.
              </div>
            ) : ["paid", "report_generating", "pending", "failed"].includes(order.status) ? (
              <Link
                href={`/orders/${order.id}/refund`}
                className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-rose-400 font-bold text-xs rounded-xl text-center border border-slate-800 ml-auto"
              >
                청약철회(환불) 신청
              </Link>
            ) : order.status === "refunded" ? (
              <div className="w-full p-4 bg-rose-950/20 border border-rose-900/50 rounded-2xl text-center text-xs text-rose-300">
                💸 이 거래는 환불 반환이 완료되었습니다. (사유: {order.refundReason || "없음"})
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
