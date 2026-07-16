"use client";

import React, { useState } from "react";
import { triggerAdminRefundAction, triggerAdminReportRegenerationAction } from "@/app/actions/admin";

interface Order {
  id: string;
  userId: string | null;
  userEmail: string | null;
  productId: string;
  productTitle: string;
  amount: number;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
  chartIdMasked: string; // 마스킹 완료된 사주 파라미터 정보
}

interface WebhookLog {
  id: string;
  provider: string;
  payload: string;
  signature: string | null;
  processed: boolean;
  errorMessage: string | null;
  createdAt: Date;
}

interface OrderAdminClientProps {
  initialOrders: Order[];
  webhookLogs: WebhookLog[];
}

export default function OrderAdminClient({ initialOrders, webhookLogs }: OrderAdminClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [refundReason, setRefundReason] = useState<Record<string, string>>({});

  const handleRefund = async (orderId: string) => {
    const reason = refundReason[orderId] || "";
    if (!reason.trim()) {
      alert("환불 사유를 상세하게 작성해 주세요.");
      return;
    }

    if (!confirm("결제사에 환불을 요청하시겠습니까? 즉각 되돌릴 수 없습니다.")) return;

    setLoading((prev) => ({ ...prev, [`refund-${orderId}`]: true }));

    try {
      const res = await triggerAdminRefundAction(orderId, reason.trim());
      if (res.success) {
        alert("환불 승인 처리가 완료되었습니다!");
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "refunded" } : o))
        );
      } else {
        alert(res.error || "환불 실패");
      }
    } catch (err) {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setLoading((prev) => ({ ...prev, [`refund-${orderId}`]: false }));
    }
  };

  const handleRegenerate = async (orderId: string) => {
    setLoading((prev) => ({ ...prev, [`regen-${orderId}`]: true }));

    try {
      const res = await triggerAdminReportRegenerationAction(orderId);
      if (res.success) {
        alert("AI 해석 리포트 백그라운드 재생성 명령이 접수되었습니다! (주문 상태: report_generating)");
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "report_generating" } : o))
        );
      } else {
        alert(res.error || "재생성 실패");
      }
    } catch (err) {
      alert("서버 연결 실패");
    } finally {
      setLoading((prev) => ({ ...prev, [`regen-${orderId}`]: false }));
    }
  };

  return (
    <div className="space-y-12 font-semibold">
      {/* 1. 주문 목록 대장 */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">결제 및 주문 통합 대장</h1>
          <p className="text-navy/60 text-xs mt-1">사용자 주문 통제, AI 리포트 강제 재생성, 비정상 건 강제 취소 처리</p>
        </div>

        <div className="overflow-x-auto bg-white border border-brand-border rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse text-xs text-navy/85">
            <thead>
              <tr className="bg-cream/50 text-navy/60 border-b border-brand-border">
                <th className="p-4 font-bold">주문 일시 / ID</th>
                <th className="p-4 font-bold">주문자 정보</th>
                <th className="p-4 font-bold">구매 상품</th>
                <th className="p-4 font-bold">결제 상태 / 금액</th>
                <th className="p-4 font-bold">보안 마스킹 파라미터</th>
                <th className="p-4 font-bold">관리자 비상 통제</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-brand-border/60 hover:bg-cream/10">
                  <td className="p-4">
                    <p className="font-mono text-[10px] text-navy/40">{o.id}</p>
                    <p className="mt-1 text-navy/60">{new Date(o.createdAt).toLocaleString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-navy">{o.userEmail || "비회원(임시세션)"}</p>
                    <p className="text-[10px] text-navy/40 font-mono">UID: {o.userId || "N/A"}</p>
                  </td>
                  <td className="p-4 font-bold text-navy">
                    {o.productTitle}
                  </td>
                  <td className="p-4">
                    <span className="font-extrabold text-emerald-600 block">{o.amount.toLocaleString()} 원</span>
                    <span className="block mt-1 font-bold text-navy/65">{o.status}</span>
                  </td>
                  <td className="p-4 font-mono text-[10px] text-navy/40 max-w-[200px] truncate" title={o.chartIdMasked}>
                    {o.chartIdMasked}
                  </td>
                  <td className="p-4 space-y-2">
                    {/* 재생성 버튼 */}
                    {["failed", "report_generating", "completed"].includes(o.status) && (
                      <button
                        onClick={() => handleRegenerate(o.id)}
                        disabled={loading[`regen-${o.id}`]}
                        className="px-3 py-1 bg-sky-50 text-sky-600 border border-sky-100 rounded-lg font-bold hover:bg-sky-100 disabled:opacity-50 text-[10px] mr-2 transition cursor-pointer"
                      >
                        {loading[`regen-${o.id}`] ? "재생성 중" : "AI 리포트 재생성 🔄"}
                      </button>
                    )}

                    {/* 환불 입력 폼 */}
                    {o.status !== "refunded" && (
                      <div className="flex gap-1.5 mt-2 max-w-xs">
                        <input
                          type="text"
                          placeholder="환불 사유 기입"
                          value={refundReason[o.id] || ""}
                          onChange={(e) =>
                            setRefundReason((prev) => ({ ...prev, [o.id]: e.target.value }))
                          }
                          className="bg-white border border-brand-border rounded p-1 text-[10px] text-navy focus:outline-none w-24"
                        />
                        <button
                          onClick={() => handleRefund(o.id)}
                          disabled={loading[`refund-${o.id}`]}
                          className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded font-bold hover:bg-rose-100 disabled:opacity-50 text-[10px] transition cursor-pointer"
                        >
                          강제환불
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. 웹훅 로그 모니터링 */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-navy">결제사 비동기 웹훅 모니터링</h2>
          <p className="text-navy/60 text-xs mt-1">PG사 결제 완료 수신 원장 로그 및 위변조 서명 에러 감시</p>
        </div>

        <div className="overflow-x-auto bg-white border border-brand-border rounded-2xl shadow-sm max-h-[400px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs text-navy/85">
            <thead>
              <tr className="bg-cream/50 text-navy/60 border-b border-brand-border">
                <th className="p-4 font-bold">수신 일시</th>
                <th className="p-4 font-bold">제공사</th>
                <th className="p-4 font-bold">서명 정보</th>
                <th className="p-4 font-bold">처리 결과</th>
                <th className="p-4 font-bold">수신 페이로드 (바디)</th>
              </tr>
            </thead>
            <tbody>
              {webhookLogs.map((wl) => (
                <tr key={wl.id} className="border-b border-brand-border/60 hover:bg-cream/10">
                  <td className="p-4 text-navy/60 font-mono">
                    {new Date(wl.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-navy">
                    {wl.provider}
                  </td>
                  <td className="p-4 font-mono text-[10px] text-navy/40 max-w-[120px] truncate" title={wl.signature || "없음"}>
                    {wl.signature || "(없음)"}
                  </td>
                  <td className="p-4 font-bold">
                    {wl.processed ? (
                      <span className="text-emerald-600">승인 성공</span>
                    ) : (
                      <span className="text-rose-600" title={wl.errorMessage || ""}>
                        오류: {wl.errorMessage || "미처리"}
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-[9px] text-navy/50 max-w-[300px] truncate" title={wl.payload}>
                    {wl.payload}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
