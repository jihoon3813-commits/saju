"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckoutFailContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "";
  const orderId = searchParams.get("orderId") || "";

  // 실패 사유 순화 매핑
  const reasonMap: Record<string, string> = {
    USER_CANCEL: "사용자께서 결제 대행창을 취소하셨거나 중간에 닫으셨습니다.",
    LIMIT_EXCEEDED: "카드사 한도가 초과되었거나 잔액이 부족해 승인이 거절되었습니다.",
    INVALID_AMOUNT: "주문서 위변조 결제 대조 실패(유효하지 않은 금액)로 결제건이 자동 반려되었습니다.",
    UNKNOWN: "알 수 없는 PG사 시스템 일시 오류입니다."
  };

  const errorMessage = reasonMap[reason] || "결제 승인 처리 중 에러가 발생했습니다.";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-6 backdrop-blur-md shadow-2xl">
        <div className="inline-block p-4 rounded-full bg-rose-950/40 border border-rose-900/50 text-rose-400 text-3xl font-extrabold animate-pulse">
          !
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-100">결제를 완료하지 못했습니다</h1>
          <p className="text-slate-400 text-sm">
            아래 실패 이유를 확인해 주세요.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-rose-300 font-semibold leading-relaxed">
          {errorMessage}
        </div>

        {orderId && (
          <p className="text-[10px] text-slate-500">
            문제가 지속되는 경우 고객 센터에 주문 고유 코드(<span className="font-mono text-slate-400">{orderId}</span>)를 전달해 주세요.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/products"
            className="py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-slate-100 transition active:scale-95 text-center"
          >
            리포트 재구매 시도
          </Link>
          <Link
            href="/"
            className="py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition active:scale-95 text-center"
          >
            메인 화면으로
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-6 backdrop-blur-md shadow-2xl">
            <div className="text-slate-400 text-sm animate-pulse">결제 상태 조회 준비 중...</div>
          </div>
        </main>
      }
    >
      <CheckoutFailContent />
    </Suspense>
  );
}
