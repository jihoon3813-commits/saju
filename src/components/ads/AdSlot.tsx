"use client";

import React, { useState, useEffect } from "react";
import { getAdPlacementBySlotKey } from "@/app/actions/ads";
import { ConsentAdapter } from "@/lib/consent/ConsentAdapter";
import { AdPlacement } from "@/lib/db/types";

interface AdSlotProps {
  slotKey: string;
  className?: string;
}

export function AdSlot({ slotKey, className = "" }: AdSlotProps) {
  const [placement, setPlacement] = useState<AdPlacement | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [adBlocked, setAdBlocked] = useState(false);

  // 1. 광고 설정 및 동의 정보 취득
  useEffect(() => {
    let active = true;

    async function loadPlacement() {
      const data = await getAdPlacementBySlotKey(slotKey);
      if (active) {
        setPlacement(data);
        setLoading(false);
      }
    }

    loadPlacement();
    setHasConsent(ConsentAdapter.hasAdConsent());

    // CMP 동의 변경 이벤트 리스너 바인딩
    const handleConsentChange = () => {
      setHasConsent(ConsentAdapter.hasAdConsent());
    };

    window.addEventListener("consent_changed", handleConsentChange);

    return () => {
      active = false;
      window.removeEventListener("consent_changed", handleConsentChange);
    };
  }, [slotKey]);

  // 2. 외부 애드센스 스크립트 로드 후 푸시 시도 (AdBlock 감지 포함)
  useEffect(() => {
    if (!placement || !placement.enabled || !hasConsent) return;
    
    const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
    const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
    const isDev = process.env.NODE_ENV === "development";

    if (!adsEnabled || isDev || !client) return;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("[AdSlot] Script error or AdBlocker blocked adsbygoogle execution:", e);
      setAdBlocked(true);
    }
  }, [placement, hasConsent]);

  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const isDev = process.env.NODE_ENV === "development";

  // 피처 플래그가 전역 꺼져 있으면 렌더링 배제
  if (!adsEnabled) return null;

  if (loading) {
    // 뼈대 레이아웃 확보 (CLS 방지)
    return (
      <div 
        className="w-full bg-slate-50/50 dark:bg-slate-900/10 border border-transparent rounded-lg flex items-center justify-center transition-all"
        style={{ minHeight: "100px" }}
      />
    );
  }

  // 슬롯이 부재하거나 비활성화 상태이면 렌더링하지 않음
  if (!placement || !placement.enabled) return null;

  // 광고 동의가 필요하나 동의하지 않았다면 렌더링 스킵
  if (placement.consentRequired && !hasConsent) {
    return null;
  }

  const height = placement.reserveHeight || 100;

  // 개발 환경(isDev)이거나 애드센스 클라이언트 식별자가 미등록 상태이면 회색 플레이스홀더 렌더링
  if (isDev || !client) {
    return (
      <section 
        aria-label="광고 영역" 
        className={`w-full max-w-7xl mx-auto my-6 px-4 flex items-center justify-center bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-slate-400 text-xs font-medium select-none ${className}`}
        style={{ minHeight: `${height}px` }}
      >
        <div className="text-center py-4">
          <p className="tracking-wide">광고 영역 테스트</p>
          <p className="text-[10px] text-slate-300 dark:text-slate-700 mt-1">
            Slot Key: {slotKey} ({height}px)
          </p>
        </div>
      </section>
    );
  }

  // 광고 스크립트 로딩 실패 또는 광고 차단기 감지 시에도 빈 큰 공간이 남지 않도록 정책 설정
  if (adBlocked) {
    return null;
  }

  // 프로덕션 렌더링 실체 (Google AdSense 스키마 준수)
  return (
    <section 
      aria-label="광고 영역" 
      className={`w-full max-w-7xl mx-auto my-6 px-4 overflow-hidden ${className}`}
      style={{ minHeight: `${height}px` }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", textDecoration: "none" }}
        data-ad-client={client}
        data-ad-slot={placement.slotKey}
        data-ad-format={placement.adFormat}
        data-full-width-responsive="true"
      />
    </section>
  );
}
