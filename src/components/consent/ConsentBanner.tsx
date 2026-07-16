"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ConsentAdapter } from "@/lib/consent/ConsentAdapter";
import { ShieldCheck, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [adsConsent, setAdsConsent] = useState(true);

  useEffect(() => {
    // 렌더링 후 클라이언트 사이드에서만 동의 판단
    if (ConsentAdapter.isConsentRequired()) {
      // 1초 뒤 부드럽게 등장하도록 제어
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    ConsentAdapter.setConsent(true, true);
    setVisible(false);
  };

  const handleAcceptRequiredOnly = () => {
    ConsentAdapter.setConsent(false, false);
    setVisible(false);
  };

  const handleSaveCustom = () => {
    ConsentAdapter.setConsent(adsConsent, analyticsConsent);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white rounded-2xl p-5 shadow-2xl z-50 animate-fade-in space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">개인정보 동의 및 쿠키 설정</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">편리하고 유용한 맞춤 운세 서비스 제공을 위함입니다.</p>
          </div>
        </div>
        <button 
          onClick={handleAcceptRequiredOnly}
          className="text-slate-400 hover:text-white transition-colors"
          title="닫기 (필수 항목만 적용)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        본 사이트는 서비스 개선(Google Analytics) 및 맞춤형 광고 게재(Google AdSense)를 위해 쿠키를 활용합니다. 
        자세한 내용은 <Link href="/privacy" className="text-indigo-400 hover:underline">개인정보처리방침</Link> 및 <Link href="/cookies" className="text-indigo-400 hover:underline">쿠키정책</Link>에서 확인하실 수 있습니다.
      </p>

      {showDetail ? (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3.5 text-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-200">1. 분석 및 측정 (선택)</span>
              <p className="text-[10px] text-slate-400 leading-normal">방문자 수, 트래픽 유입 경로 분석을 통한 서비스 개선 목적</p>
            </div>
            <input 
              type="checkbox" 
              checked={analyticsConsent}
              onChange={(e) => setAnalyticsConsent(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-700 bg-slate-800 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-start justify-between border-t border-slate-800 pt-3">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-200">2. 맞춤형 광고 게재 (선택)</span>
              <p className="text-[10px] text-slate-400 leading-normal">관심사에 유기적인 맞춤 광고 노출 및 광고 효과 보고 분석 목적</p>
            </div>
            <input 
              type="checkbox" 
              checked={adsConsent}
              onChange={(e) => setAdsConsent(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-700 bg-slate-800 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex space-x-2 pt-1">
            <Button 
              onClick={() => setShowDetail(false)} 
              variant="secondary"
              className="w-1/2 py-2 text-xxs font-bold"
            >
              이전으로
            </Button>
            <Button 
              onClick={handleSaveCustom} 
              variant="primary"
              className="w-1/2 py-2 text-xxs font-bold bg-indigo-600 hover:bg-indigo-500"
            >
              설정 저장
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Button 
              onClick={handleAcceptRequiredOnly} 
              variant="secondary"
              className="w-1/2 py-2.5 text-xxs font-bold border border-slate-800 hover:bg-slate-800 text-slate-300"
            >
              필수 기능만
            </Button>
            <Button 
              onClick={handleAcceptAll} 
              variant="primary"
              className="w-1/2 py-2.5 text-xxs font-bold bg-indigo-600 hover:bg-indigo-500"
            >
              모든 쿠키 허용
            </Button>
          </div>
          <button 
            onClick={() => setShowDetail(true)}
            className="w-full text-center text-[10px] text-slate-400 hover:text-white hover:underline flex items-center justify-center space-x-1 py-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>선택적 목적별 동의 설정하기</span>
          </button>
        </div>
      )}
    </div>
  );
}
