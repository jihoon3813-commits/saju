import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { processMockPaymentAction } from "@/app/actions/payment";
import MockGatewayClient from "./MockGatewayClient";

export const dynamic = "force-dynamic";

interface MockGatewayPageProps {
  searchParams: {
    orderId?: string;
    token?: string;
    amount?: string;
    bypass?: string;
  };
}

export default async function MockGatewayPage({ searchParams }: MockGatewayPageProps) {
  const { orderId, token, amount, bypass } = searchParams;

  if (!orderId || !token) {
    notFound();
  }

  // 1. 주문서 상세 조회
  const order = await db.orders.findById(orderId);
  if (!order || order.status !== "pending") {
    notFound();
  }

  // 2. 상품 조회
  const product = await db.products.findById(order.productId);
  if (!product) {
    notFound();
  }

  // 3. 만약 bypass 플래그가 참이면 (0원 결제 무료 쿠폰 등) 사용자 입력 없이 즉시 자동 성공 처리 실행
  if (bypass === "true") {
    // 서버 액션을 즉시 실행하여 리다이렉트 처리 유도
    const res = await processMockPaymentAction(orderId, token, "success");
    if (res.success && res.redirectUrl) {
      // 강제 리다이렉트를 클라이언트로 위임하거나 여기서 바로 처리
      // 이 컴포넌트는 서버 컴포넌트이므로 클라이언트 컴포넌트를 호출하여 강제 리다이렉트 실행
      return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl font-bold">쿠폰 100% 자동 결제 승인 중...</h2>
            <p className="text-sm text-slate-400">잠시만 기다려 주시면 리포트 페이지로 이동합니다.</p>
            <MockGatewayClient autoRedirectUrl={res.redirectUrl} />
          </div>
        </main>
      );
    }
  }

  const serializedOrder = {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    status: order.status
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* 가상 PG 헤더 */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <span className="text-indigo-400 font-extrabold text-sm tracking-wider uppercase">
            🧪 ANTIGRAVITY MOCK PG
          </span>
          <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-900/50 px-2 py-0.5 rounded-full font-bold">
            TEST MODE
          </span>
        </div>

        {/* 상점 및 결제액 정보 */}
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <span className="text-slate-500 text-xs block font-semibold">가맹점명</span>
            <span className="text-slate-100 font-bold text-sm">꿈해몽·운세백과 콘텐츠 허브</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-xs block font-semibold">구매 상품</span>
              <span className="text-slate-200 font-bold text-xs truncate block">{product.title}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-xs block font-semibold">결제 금액</span>
              <span className="text-emerald-400 font-extrabold text-base">
                {order.amount.toLocaleString()} 원
              </span>
            </div>
          </div>
        </div>

        {/* 클라이언트 사이드 결제 승인 동작 바인딩 */}
        <MockGatewayClient order={serializedOrder} token={token} />

        <div className="text-[10px] text-slate-500 text-center leading-relaxed">
          <p>이 화면은 포트원/토스페이먼츠 등 가상 PG의 연동 테스트용 모듈입니다.</p>
          <p>실제 금전거래가 발생하지 않는 모의 결제입니다.</p>
        </div>
      </div>
    </main>
  );
}
