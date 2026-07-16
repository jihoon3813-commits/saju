"use client";

import React, { useState } from "react";
import { validateCouponAction, createOrderAction } from "@/app/actions/payment";

interface Profile {
  id: string;
  alias: string;
  birthDate: string;
  birthTime: string | null;
}

interface CheckoutFormProps {
  product: {
    id: string;
    title: string;
    price: number;
    productType: "saju_report" | "mini_report" | "compatibility" | "planner";
  };
  profile1: Profile;
  profile2?: Profile | null;
  question?: string;
  year?: number;
}

export default function CheckoutForm({ product, profile1, profile2, question, year }: CheckoutFormProps) {
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await validateCouponAction(couponCode.trim(), product.id);
      if (res.success && res.discountAmount !== undefined) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discountAmount: res.discountAmount
        });
      } else {
        setCouponError(res.error || "사용할 수 없는 쿠폰 번호입니다.");
      }
    } catch (err: any) {
      setCouponError("쿠폰 검증 도중 에러가 발생했습니다.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const originalPrice = product.price;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalAmount = Math.max(0, originalPrice - discount);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");
    setPaymentLoading(true);

    const chartInputs: Record<string, any> = {
      profileId: profile1.id
    };
    if (profile2) {
      chartInputs.profileId2 = profile2.id;
    }
    if (question) {
      chartInputs.question = question;
    }
    if (year) {
      chartInputs.year = year;
    }

    try {
      const res = await createOrderAction({
        productId: product.id,
        couponCode: appliedCoupon?.code,
        chartInputs,
        idempotencyKey: undefined // server will generate
      });

      if (res.success && res.redirectUrl) {
        // 만약 금액이 0원이면 (100% 무료 쿠폰) PG 호출 없이 바로 완료 처리 랜딩 가능
        if (finalAmount === 0) {
          // 가상 결제로 성공 강제 연동
          const token = res.paymentToken || "free_zero_token";
          window.location.href = `/checkout/mock-gateway?orderId=${res.orderId}&token=${token}&amount=0&bypass=true`;
        } else {
          window.location.href = res.redirectUrl;
        }
      } else {
        setPaymentError(res.error || "주문 생성 및 결제창 진입에 실패했습니다.");
        setPaymentLoading(false);
      }
    } catch (err: any) {
      setPaymentError("결제 준비 요청 중 치명적인 서버 통신 장애가 발생했습니다.");
      setPaymentLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 결제서 정보 리스트 */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">주문 상품 정보</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">상품명</span>
              <span className="text-slate-100 font-semibold">{product.title}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">결제 구분</span>
              <span className="text-indigo-400 font-semibold">일시불 소장형 디지털 콘텐츠</span>
            </div>
          </div>

          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">분석 정보 대조</h3>
            <div className="flex justify-between items-start text-sm">
              <span className="text-slate-400">대상자 (본인)</span>
              <span className="text-slate-200">
                {profile1.alias} ({profile1.birthDate} {profile1.birthTime || "시간미상"})
              </span>
            </div>
            {profile2 && (
              <div className="flex justify-between items-start text-sm">
                <span className="text-slate-400">상대방 (궁합)</span>
                <span className="text-slate-200">
                  {profile2.alias} ({profile2.birthDate} {profile2.birthTime || "시간미상"})
                </span>
              </div>
            )}
            {question && (
              <div className="border-t border-slate-800/50 pt-3 space-y-1">
                <span className="text-xs font-bold text-slate-400 block">제출된 세부 질문</span>
                <p className="text-sm text-slate-300 italic bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                  "{question}"
                </p>
              </div>
            )}
            {year && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">분석 대상 연도</span>
                <span className="text-slate-200 font-bold">{year} 년</span>
              </div>
            )}
          </div>

          {/* 할인 쿠폰 박스 */}
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">할인 쿠폰 적용</h3>
            
            {couponError && (
              <div className="p-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-lg">
                {couponError}
              </div>
            )}

            {!appliedCoupon ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="쿠폰 코드를 입력하세요 (예: WELCOME10)"
                  className="flex-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-sm font-bold rounded-lg transition disabled:opacity-50"
                >
                  {couponLoading ? "적용 중" : "적용"}
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-lg">
                <div>
                  <span className="text-xs font-bold text-emerald-400 mr-2">[적용됨]</span>
                  <span className="text-sm font-bold text-slate-200">{appliedCoupon.code}</span>
                  <span className="text-xs text-slate-400 ml-2">
                    (- {appliedCoupon.discountAmount.toLocaleString()}원)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-rose-400 hover:underline"
                >
                  쿠폰 취소
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-500">
              * 쿠폰 번호는 영문 대소문자를 구분하지 않습니다. 단일 주문건당 하나의 쿠폰만 적용 가능합니다.
            </p>
          </div>
        </div>

        {/* 결제금액 요약 및 버튼 */}
        <div>
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 space-y-6 sticky top-6">
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">최종 결제 금액</h3>
            
            {paymentError && (
              <div className="p-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-lg">
                {paymentError}
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>정가 합계</span>
                <span>{originalPrice.toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>쿠폰 할인액</span>
                <span className="text-rose-400">- {discount.toLocaleString()} 원</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-bold text-slate-100">
                <span>최종 결제액</span>
                <span className="text-emerald-400 text-lg">{finalAmount.toLocaleString()} 원</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-400 block mb-2">결제 방식 선택</label>
              <div className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-xl flex items-center gap-3">
                <input type="radio" defaultChecked className="text-indigo-600 focus:ring-0" />
                <span className="text-sm font-bold text-indigo-300">테스트 결제 대행 (Mock PG)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={paymentLoading}
              className="w-full py-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:opacity-90 transition shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {paymentLoading ? "결제창 호출 중..." : `${finalAmount.toLocaleString()}원 결제 요청`}
            </button>

            <div className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">
              <p>구매 완료와 즉시 사주 원장 해석서 생성이 비동기로 실행됩니다. 해석서 열람 이후에는 환불이 보장되지 않는 점 동의 후 구매를 클릭해 주세요.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
