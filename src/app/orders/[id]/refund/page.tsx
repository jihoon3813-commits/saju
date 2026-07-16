"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { requestRefundAction } from "@/app/actions/payment";

export default function OrderRefundPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [reason, setReason] = useState("DUPLICATE_ORDER");
  const [customReason, setCustomReason] = useState("");
  const [policyChecked, setPolicyChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!policyChecked) {
      setError("청약철회 약관 및 환불 규정에 동의해 주셔야 진행이 가능합니다.");
      return;
    }

    const finalReasonText = reason === "ETC" ? customReason.trim() : reason;
    if (reason === "ETC" && !finalReasonText) {
      setError("기타 사유의 구체적인 내용을 작성해 주세요.");
      return;
    }

    setLoading(true);

    try {
      const res = await requestRefundAction(id, finalReasonText);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = `/orders/${id}`;
        }, 1500);
      } else {
        setError(res.error || "결제 취소 처리 중 오류가 발생했습니다.");
        setLoading(false);
      }
    } catch (err: any) {
      setError("서버 통신 중 장애가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link href={`/orders/${id}`} className="text-sm text-indigo-400 hover:text-indigo-300 transition">
            ← 영수증 지면으로 돌아가기
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-100">디지털 청약철회(환불) 신청서</h1>
            <p className="text-slate-400 text-xs mt-2">
              주문건 취소를 위해 환불 약관 동의 및 신청 사유를 접수해 주세요.
            </p>
          </div>

          {success ? (
            <div className="p-6 bg-emerald-950/20 border border-emerald-900/50 rounded-2xl text-center space-y-3">
              <span className="text-3xl">💸</span>
              <h3 className="text-lg font-bold text-emerald-400">환불 접수 승인 완료</h3>
              <p className="text-xs text-slate-400">
                가상 결제취소 처리가 완전히 종료되었습니다. 잠시 후 상세 영수증으로 이동합니다.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-lg">
                  ⚠️ {error}
                </div>
              )}

              {/* 환불 약관 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3 text-xs text-slate-400 leading-relaxed">
                <h4 className="font-bold text-slate-200">디지털 콘텐츠 환불 제한 특별 약관</h4>
                <p>• 분석 완료(completed) 판정을 받아 결과물 텍스트 데이터베이스가 이미 영구 보존 스냅샷으로 생성된 경우에는 소비자의 서비스 이용/열람 여부와 무관하게 **청약철회가 절대 차단됩니다.**</p>
                <p>• 결제 후 대기 상태(pending/paid/generating)에서 기술 결함이나 중복 결제 오작동 사유로 청약철회를 접수할 경우, 확인 후 즉시 취소 승인 및 PG 환불 처리가 접수됩니다.</p>
                
                <label className="flex items-start gap-2 pt-2 text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policyChecked}
                    onChange={(e) => setPolicyChecked(e.target.checked)}
                    className="mt-0.5 text-indigo-600 focus:ring-0 rounded"
                  />
                  <span>위 약관 조항 및 디지털 콘텐츠 훼손 면책 규정을 모두 확인하였으며, 이에 동의합니다.</span>
                </label>
              </div>

              {/* 사유 선택 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400">환불 신청 사유</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-3 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="DUPLICATE_ORDER">중복 결제 / 실수로 인한 이중 주문</option>
                  <option value="SYSTEM_DELAY">AI 분석 지연 (15분 이상 결과 미출력)</option>
                  <option value="POLICY_MISUNDERSTAND">환불 규정 및 상품 상세 범위 오해</option>
                  <option value="ETC">기타 직접 기입 사유</option>
                </select>
              </div>

              {reason === "ETC" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400">구체적 사유 기입</label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="환불 사유를 10자 이상 구체적으로 적어주세요."
                    className="w-full h-24 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-3 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-700 resize-none"
                    maxLength={150}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white transition active:scale-95 disabled:opacity-50"
              >
                {loading ? "환불 취소 요청 중..." : "청약철회(결제 취소) 접수하기"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
