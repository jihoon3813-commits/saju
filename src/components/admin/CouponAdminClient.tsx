"use client";

import React, { useState } from "react";
import { createCouponAction, toggleCouponActiveAction } from "@/app/actions/admin";

interface Coupon {
  id: string;
  code: string;
  discountType: "amount" | "percent";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: Date;
  createdAt: Date;
}

interface CouponAdminClientProps {
  initialCoupons: Coupon[];
}

export default function CouponAdminClient({ initialCoupons }: CouponAdminClientProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"amount" | "percent">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("100");
  const [expiresAtStr, setExpiresAtStr] = useState("2030-12-31");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("쿠폰 코드를 입력해 주세요.");
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      setError("유효한 할인율/할인액을 작성해 주세요.");
      return;
    }

    setLoading(true);

    try {
      const res = await createCouponAction({
        code: code.trim(),
        discountType,
        discountValue: Number(discountValue),
        maxUses: Number(maxUses),
        expiresAtStr: `${expiresAtStr}T23:59:59Z`
      });

      if (res.success) {
        alert("쿠폰이 성공적으로 발행되었습니다!");
        window.location.reload();
      } else {
        setError(res.error || "쿠폰 발행에 실패했습니다.");
        setLoading(false);
      }
    } catch (err) {
      setError("서버 통신 장애가 발생했습니다.");
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await toggleCouponActiveAction(id);
      if (res.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
        );
      } else {
        alert(res.error || "쿠폰 상태 변경 실패");
      }
    } catch (err) {
      alert("서버 연결 실패");
    }
  };

  return (
    <div className="space-y-8 font-semibold">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">할인 쿠폰 중앙 통제</h1>
        <p className="text-navy/60 text-xs mt-1">신규 마케팅 쿠폰 발행, 최대 사용량 제한 및 쿠폰 강제 비활성화</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* 왼쪽: 신규 쿠폰 발행 양식 */}
        <form onSubmit={handleCreateCoupon} className="lg:col-span-1 bg-white border border-brand-border p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-navy border-b border-brand-border pb-2">➕ 신규 쿠폰 발행</h3>
          
          {error && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-navy/40 font-bold block">쿠폰 식별 코드</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="예: CHUSEOK5000"
              className="w-full bg-white text-navy border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none uppercase placeholder-navy/20 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-navy/40 font-bold block">할인 형태</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "amount" | "percent")}
                className="w-full bg-white text-navy border border-brand-border rounded-lg p-2 text-xs focus:outline-none cursor-pointer"
              >
                <option value="percent">정률 할인 (%)</option>
                <option value="amount">정액 할인 (원)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-navy/40 font-bold block">할인 수치</label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percent" ? "예: 15 (%)" : "예: 5000 (원)"}
                className="w-full bg-white text-navy border border-brand-border rounded-lg p-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-navy/40 font-bold block">최대 소진 수량</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="예: 200"
                className="w-full bg-white text-navy border border-brand-border rounded-lg p-2 text-xs focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-navy/40 font-bold block">만료 기한</label>
              <input
                type="date"
                value={expiresAtStr}
                onChange={(e) => setExpiresAtStr(e.target.value)}
                className="w-full bg-white text-navy border border-brand-border rounded-lg p-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gold hover:bg-gold/95 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
          >
            {loading ? "쿠폰 발행 등록 중..." : "할인 쿠폰 발행하기"}
          </button>
        </form>

        {/* 오른쪽: 쿠폰 목록 현황 */}
        <div className="lg:col-span-2 overflow-x-auto bg-white border border-brand-border rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse text-xs text-navy/85">
            <thead>
              <tr className="bg-cream/50 text-navy/60 border-b border-brand-border">
                <th className="p-4 font-bold">쿠폰 코드</th>
                <th className="p-4 font-bold">할인 금액/율</th>
                <th className="p-4 font-bold">소진 한도 현황</th>
                <th className="p-4 font-bold">만료 기한</th>
                <th className="p-4 font-bold">상태 스위치</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-brand-border/60 hover:bg-cream/10">
                  <td className="p-4 font-mono font-bold text-navy">
                    {c.code}
                  </td>
                  <td className="p-4 font-semibold text-navy">
                    {c.discountType === "percent" ? `${c.discountValue}% 할인` : `${c.discountValue.toLocaleString()}원 할인`}
                  </td>
                  <td className="p-4 text-navy">
                    <span className="font-bold">{c.usedCount}</span>
                    <span className="text-navy/50"> / {c.maxUses} 회 사용</span>
                  </td>
                  <td className="p-4 text-navy/60 font-mono">
                    {new Date(c.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(c.id)}
                      className={`px-3 py-1 rounded-full font-bold transition text-[10px] cursor-pointer ${
                        c.active
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-cream text-navy/40 border border-brand-border/60"
                      }`}
                    >
                      {c.active ? "활성화" : "비활성 잠금"}
                    </button>
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
