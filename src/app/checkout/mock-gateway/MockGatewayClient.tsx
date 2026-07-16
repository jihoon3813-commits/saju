"use client";

import React, { useEffect, useState } from "react";
import { processMockPaymentAction } from "@/app/actions/payment";

interface MockGatewayClientProps {
  autoRedirectUrl?: string;
  order?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
  token?: string;
}

export default function MockGatewayClient({ autoRedirectUrl, order, token }: MockGatewayClientProps) {
  const [selectedCard, setSelectedCard] = useState("shinhan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 자동 리다이렉트 바이패스 처리
  useEffect(() => {
    if (autoRedirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = autoRedirectUrl;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoRedirectUrl]);

  if (autoRedirectUrl) {
    return null;
  }

  const handleAction = async (action: "success" | "low_balance" | "cancel") => {
    if (!order || !token) return;
    setLoading(true);
    setError("");

    try {
      const res = await processMockPaymentAction(order.id, token, action);
      if (res.success && res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        setError(res.error || "가상 결제 승인 실패");
        setLoading(false);
      }
    } catch (err: any) {
      setError("서버 응답 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* 가상 카드 선택 */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-400">결제 수단 (모의 카드사)</label>
        <select
          value={selectedCard}
          onChange={(e) => setSelectedCard(e.target.value)}
          className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-3 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="shinhan">신한카드 (테스트)</option>
          <option value="hyundai">현대카드 (테스트)</option>
          <option value="samsung">삼성카드 (테스트)</option>
          <option value="toss">토스페이 머니 (테스트)</option>
          <option value="kakao">카카오페이 머니 (테스트)</option>
        </select>
      </div>

      {/* 제어 버튼 그룹 */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <button
          onClick={() => handleAction("success")}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 active:scale-95 transition disabled:opacity-50"
        >
          {loading ? "가상 결제 승인 중..." : "결제 승인 성공 시뮬레이션"}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAction("low_balance")}
            disabled={loading}
            className="py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700/80 transition active:scale-95 disabled:opacity-50"
          >
            한도 초과 실패
          </button>
          <button
            onClick={() => handleAction("cancel")}
            disabled={loading}
            className="py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition active:scale-95 disabled:opacity-50"
          >
            결제 창 취소
          </button>
        </div>
      </div>
    </div>
  );
}
