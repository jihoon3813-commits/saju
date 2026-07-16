"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";

interface Profile {
  id: string;
  alias: string;
  birthDate: string;
  birthTime: string | null;
}

interface PurchaseSelectorProps {
  productId: string;
  productType: "saju_report" | "mini_report" | "compatibility" | "planner";
  profiles: Profile[];
}

export default function PurchaseSelector({ productId, productType, profiles }: PurchaseSelectorProps) {
  const [profileId1, setProfileId1] = useState(profiles[0]?.id || "");
  const [profileId2, setProfileId2] = useState(profiles[1]?.id || profiles[0]?.id || "");
  const [question, setQuestion] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!profileId1) {
      setError("해석의 대상이 될 사주 프로필을 선택해 주세요.");
      return;
    }

    if (productType === "compatibility" && !profileId2) {
      setError("궁합 분석을 위해 상대방 프로필을 선택해 주세요.");
      return;
    }

    if (productType === "compatibility" && profileId1 === profileId2) {
      setError("본인과 상대방은 서로 다른 프로필이어야 합니다.");
      return;
    }

    if (productType === "mini_report" && !question.trim()) {
      setError("해결하고 싶은 질문을 입력해 주세요.");
      return;
    }

    setLoading(false);

    // 구매 Checkout 라우트 설계 파라미터 빌드
    const params = new URLSearchParams();
    params.set("profileId", profileId1);

    if (productType === "compatibility") {
      params.set("profileId2", profileId2);
    }
    if (productType === "mini_report") {
      params.set("question", question.trim());
    }
    if (productType === "planner") {
      params.set("year", year.toString());
    }

    // Checkout 지면으로 이동
    window.location.href = `/checkout/${productId}?${params.toString()}`;
  };

  return (
    <form onSubmit={handlePurchase} className="space-y-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
      <h4 className="text-lg font-bold text-slate-100 mb-4 border-b border-slate-800 pb-3 flex items-center gap-2">
        <span>⚙️</span> 구매 조건 및 대상자 선택
      </h4>

      {error && (
        <div className="p-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-slate-400 text-sm mb-4">등록된 사주 프로필이 없습니다.</p>
          <a
            href="/profile/new?redirect=products"
            className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-bold rounded-lg transition"
          >
            새 사주 프로필 등록하러 가기
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 첫 번째 대상자 */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              {productType === "compatibility" ? "나 (첫 번째 대상자)" : "해석 대상 사주"}
            </label>
            <select
              value={profileId1}
              onChange={(e) => setProfileId1(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">-- 프로필 선택 --</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.alias} ({p.birthDate} {p.birthTime || "시간미상"})
                </option>
              ))}
            </select>
          </div>

          {/* 두 번째 대상자 (궁합용) */}
          {productType === "compatibility" && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">상대방 (두 번째 대상자)</label>
              <select
                value={profileId2}
                onChange={(e) => setProfileId2(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">-- 프로필 선택 --</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.alias} ({p.birthDate} {p.birthTime || "시간미상"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 질문 기입란 (질문형 미니 운세 리포트용) */}
          {productType === "mini_report" && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">답을 얻고 싶은 질문 기입</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="예: 올해 가을 이직을 준비하고 있는데, 다른 회사로 옮기는 기류가 좋을까요 아니면 현재 회사에 남는 것이 좋을까요?"
                className="w-full h-24 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-2 text-sm focus:border-sky-500 focus:outline-none placeholder-slate-600 resize-none"
                maxLength={200}
              />
              <span className="text-[10px] text-slate-500 block text-right mt-1">
                {question.length} / 200자 제한
              </span>
            </div>
          )}

          {/* 연도 기입란 (연간 플래너용) */}
          {productType === "planner" && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">분석 대상 연도</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value={new Date().getFullYear()}>{new Date().getFullYear()} 년 (현재)</option>
                <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1} 년 (내년)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? "전송 중..." : "결제 수단 선택하러 가기 💳"}
          </button>
        </div>
      )}
    </form>
  );
}
