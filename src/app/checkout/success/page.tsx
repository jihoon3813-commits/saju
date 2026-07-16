"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { checkOrderStatusAction } from "@/app/actions/payment";
import Link from "next/link";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  const [status, setStatus] = useState<string>("report_generating");
  const [progress, setProgress] = useState(10);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("주문 식별 번호가 누락되었습니다.");
      return;
    }

    // 1. 프로그레스 바 가상 애니메이션 루프
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + Math.floor(Math.random() * 8) + 2;
        if (prev < 98) return prev + 1;
        return prev;
      });
    }, 400);

    // 2. 주문 완료 검사용 폴링 루프 (1.5초 주기)
    const pollTimer = setInterval(async () => {
      try {
        const res = await checkOrderStatusAction(orderId);
        if (res.success && res.status) {
          setStatus(res.status);
          if (res.status === "completed") {
            clearInterval(pollTimer);
            clearInterval(progressTimer);
            setProgress(100);
            // 완료 후 결과지 이동
            setTimeout(() => {
              window.location.href = `/orders/${orderId}/report`;
            }, 800);
          } else if (res.status === "failed") {
            clearInterval(pollTimer);
            clearInterval(progressTimer);
            setError("프리미엄 리포트 생성에 실패했습니다. 관리자에게 문의해 주세요.");
          }
        } else if (!res.success) {
          setError(res.error || "주문 내역 검증 실패");
          clearInterval(pollTimer);
          clearInterval(progressTimer);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(pollTimer);
    };
  }, [orderId]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-6 backdrop-blur-md shadow-2xl">
        <div className="inline-block p-4 rounded-full bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-3xl animate-bounce">
          ✓
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-emerald-300 to-sky-300">
            결제가 정상적으로 완료되었습니다!
          </h1>
          <p className="text-slate-400 text-sm">
            {status === "completed" ? "분석이 성공적으로 종료되었습니다. 리다이렉트 중..." : "백그라운드에서 AI 프리미엄 사주 명리 분석을 진행 중입니다."}
          </p>
        </div>

        {/* 안내 카드 */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 text-left text-xs text-slate-400 space-y-2">
          <span className="font-bold text-slate-300 block">🔮 현재 수행 중인 고유 연산</span>
          <p>• 출생시 및 출생 국가 위도·경도에 따른 **태양 경도Spencer Equation 균시차** 보정 중</p>
          <p>• 본인 사주 원국의 오행 분포율 및 십성 다원 관계 구조 대조 중</p>
          <p>• 평생의 대운 시작 나이 및 연도별 길흉화복 흐름 가이드라인 조립 중</p>
        </div>

        {/* 프로그레스 바 영역 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>리포트 생성율</span>
            <span className="text-indigo-400">{progress} %</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3.5 border border-slate-800/50 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-lg">
            ⚠️ {error}
            <div className="mt-3">
              <Link href="/products" className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-slate-100 font-bold rounded-lg transition inline-block">
                상품 목록으로 이동
              </Link>
            </div>
          </div>
        )}

        <div className="text-[10px] text-slate-500">
          * AI 연산은 평균적으로 5초 ~ 15초가 소요됩니다. 브라우저 창을 닫지 말고 잠시만 기다려 주세요.
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-6 backdrop-blur-md shadow-2xl">
            <div className="text-slate-400 text-sm animate-pulse">결제 연계 데이터 로딩 대기 중...</div>
          </div>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
