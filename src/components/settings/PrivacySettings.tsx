"use client";

import React, { useState, useEffect } from "react";
import { BirthProfile } from "@/schemas/fortune";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Download, Trash2, ShieldAlert, FileText, Check, Shield, Info, Undo2 } from "lucide-react";
import { ConsentAdapter } from "@/lib/consent/ConsentAdapter";

interface PrivacySettingsProps {
  initialProfiles: BirthProfile[];
  isLoggedIn: boolean;
}

export default function PrivacySettings({ initialProfiles }: PrivacySettingsProps) {
  const [profiles, setProfiles] = useState<BirthProfile[]>(initialProfiles);
  const [loading, setLoading] = useState<boolean>(false);
  const [cleared, setCleared] = useState<boolean>(false);

  const [adsConsent, setAdsConsent] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [consentHistory, setConsentHistory] = useState<any>(null);

  useEffect(() => {
    setAdsConsent(ConsentAdapter.hasAdConsent());
    setAnalyticsConsent(ConsentAdapter.hasAnalyticsConsent());
    setConsentHistory(ConsentAdapter.getConsent());
  }, []);

  // 1. 보관 데이터 내보내기 (JSON 다운로드 구현)
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(profiles, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `dream_fortune_privacy_export_${new Date().toISOString().split("T")[0]}.json`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch {
      alert("데이터 다운로드 생성 중 오류가 발생했습니다.");
    }
  };

  // 2. 보관함 내 전 프로필 일괄 물리 파기 (Hard Delete 시뮬레이션 및 실제 호출)
  const handleClearAllProfiles = async () => {
    const doubleCheck = window.confirm(
      "경고: 보관 중인 모든 사주 프로필 정보가 데이터베이스에서 흔적 없이 '물리 파기'됩니다. 계속하시겠습니까?"
    );
    if (!doubleCheck) return;

    setLoading(true);
    try {
      // 서버 프로필 삭제 API 모의/직접 제거 연동
      // (각 프로필별 삭제 액션 호출 또는 일괄 소유권 삭제)
      const { handleDeleteProfile } = await import("@/app/actions/profile");
      
      for (const p of profiles) {
        if (p.id) {
          await handleDeleteProfile(p.id);
        }
      }
      
      setProfiles([]);
      setCleared(true);
      alert("성공적으로 모든 사주 프로필 데이터가 파기되었습니다.");
    } catch {
      alert("일괄 데이터 파기 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAds = (val: boolean) => {
    setAdsConsent(val);
    const updated = ConsentAdapter.setConsent(val, analyticsConsent);
    setConsentHistory(updated);
  };

  const handleToggleAnalytics = (val: boolean) => {
    setAnalyticsConsent(val);
    const updated = ConsentAdapter.setConsent(adsConsent, val);
    setConsentHistory(updated);
  };

  const handleRevokeConsent = () => {
    ConsentAdapter.revokeConsent();
    setAdsConsent(false);
    setAnalyticsConsent(false);
    setConsentHistory(null);
    alert("모든 쿠키 수집 및 광고 개인화 동의 이력이 완전히 철회 및 거절 처리되었습니다.");
  };

  return (
    <div className="space-y-6">
      
      {/* 1. 개인정보 처리방침 요약 */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-navy border-b border-brand-border/60 pb-3 flex items-center space-x-1.5">
          <FileText className="w-5 h-5 text-gold" />
          <span>개인정보 보유 정책 및 활용 투명성</span>
        </h2>
        <div className="text-xxs text-navy/70 space-y-3.5 leading-relaxed">
          <p>
            꿈과 운의 사전은 최소화된 정보만을 기반으로 가치 있는 AI 운세 리포트를 산출하는 것을 최우선으로 합니다. 
            이에 따라 <strong>주민등록번호, 정확한 실명 및 상세 주소, 전화번호는 절대 수집하지 않으며</strong> 기입된 사주 정보(양/음력 생년월일시, 출생지 위경도)만을 격리하여 활용합니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-cream/20 border border-brand-border/40 p-3 rounded-lg">
              <strong className="text-navy block mb-1">회원 보유 데이터</strong>
              <span>회원 탈퇴 시점 혹은 사용자의 개별 삭제 요청 즉시 데이터베이스(Postgres) 테이블에서 지체 없이 즉각 영구 폐기됩니다.</span>
            </div>
            <div className="bg-cream/20 border border-brand-border/40 p-3 rounded-lg">
              <strong className="text-navy block mb-1">비회원 임시 데이터</strong>
              <span>쿠키 및 세션 보존 기간(30일) 만료 시 자동 파기되며, 영구 저장 동의하지 않은 데이터는 결과 분석 종료 후 즉각 서버에서 축출됩니다.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 프라이버시 자율 제어판 */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-navy border-b border-brand-border/60 pb-3 flex items-center space-x-1.5">
          <ShieldAlert className="w-5 h-5 text-gold" />
          <span>개인정보 통제 제어판 (Data Control Center)</span>
        </h2>

        <div className="space-y-4.5 text-xs">
          
          {/* 내보내기 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#EAE4D6]/20 border border-brand-border/60 rounded-xl">
            <div className="space-y-0.5 max-w-sm">
              <span className="font-bold text-navy">보관 데이터 일괄 내보내기 (Data Portability)</span>
              <p className="text-xxs text-navy/60 leading-normal">
                현재 보관함에 들어있는 {profiles.length}개 프로필 정보를 표준 JSON 구조의 백업 파일로 추출하여 다운로드합니다.
              </p>
            </div>
            <Button 
              type="button" 
              variant="secondary"
              disabled={profiles.length === 0}
              onClick={handleExportData}
              className="text-xxs font-bold shrink-0 min-h-[40px] flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>데이터 다운로드</span>
            </Button>
          </div>

          {/* 일괄 삭제 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#EAE4D6]/20 border border-brand-border/60 rounded-xl">
            <div className="space-y-0.5 max-w-sm">
              <span className="font-bold text-red-800">보관된 사주 정보 일괄 물리 파기</span>
              <p className="text-xxs text-navy/60 leading-normal">
                별도의 계정 탈퇴 없이도, 데이터베이스에 등록된 모든 지인 및 본인 사주 정보만을 복구 불가능한 상태로 완벽 영구 삭제합니다.
              </p>
            </div>
            <Button 
              type="button" 
              variant="secondary"
              disabled={profiles.length === 0 || loading}
              onClick={handleClearAllProfiles}
              className="text-xxs font-bold shrink-0 text-red-500 hover:bg-red-50 border-red-200 min-h-[40px] flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>일괄 데이터 삭제</span>
            </Button>
          </div>

        </div>

        {cleared && (
          <div className="bg-sage/10 border border-sage/35 text-sage p-3 rounded-lg text-xxs flex items-center space-x-1.5 animate-slideDown">
            <Check className="w-4.5 h-4.5" />
            <span>모든 보관 데이터가 완벽하게 격리 파기되었습니다.</span>
          </div>
        )}
      </div>

      {/* 3. 쿠키 수집 및 맞춤형 광고 개인화 제어판 */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-navy border-b border-brand-border/60 pb-3 flex items-center space-x-1.5">
          <Shield className="w-5 h-5 text-gold" />
          <span>쿠키 설정 및 서비스 행동 추적 통제</span>
        </h2>

        <p className="text-xxs text-navy/70 leading-relaxed">
          구글 애드센스(맞춤형 광고) 및 구글 애널리틱스(트래픽 수집 분석)에 제공할 브라우저 쿠키 승인 여부를 자율적으로 제어합니다.
        </p>

        <div className="space-y-4 text-xs">
          {/* 맞춤형 광고 동의 토글 */}
          <div className="flex items-center justify-between p-3.5 bg-[#EAE4D6]/20 border border-brand-border/60 rounded-xl">
            <div className="space-y-0.5 max-w-md">
              <span className="font-bold text-navy">구글 애드센스 맞춤형 광고 제공 동의</span>
              <p className="text-xxs text-navy/60 leading-normal">
                동의 거부 시 맞춤형 광고 송출 스크립트 연결이 완전히 차단되며, 비개인화된 일반 배너만 안전하게 지연 로드됩니다.
              </p>
            </div>
            <button
              onClick={() => handleToggleAds(!adsConsent)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                adsConsent ? "bg-sage text-white" : "bg-[#D3C7B2]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  adsConsent ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 트래픽 수집 분석 동의 토글 */}
          <div className="flex items-center justify-between p-3.5 bg-[#EAE4D6]/20 border border-brand-border/60 rounded-xl">
            <div className="space-y-0.5 max-w-md">
              <span className="font-bold text-navy">서비스 개선을 위한 통계 수집 동의 (Google Analytics)</span>
              <p className="text-xxs text-navy/60 leading-normal">
                이메일, 이름, 생일 등의 개인 식별 정보(PII)를 완전히 필터링하여 비식별화된 행동 트랙 로그만을 안전하게 집계합니다.
              </p>
            </div>
            <button
              onClick={() => handleToggleAnalytics(!analyticsConsent)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                analyticsConsent ? "bg-sage text-white" : "bg-[#D3C7B2]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  analyticsConsent ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 동의 철회 및 상태 진단 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-red-50/10 border border-red-200/30 rounded-xl text-xxs">
            <div className="space-y-1">
              <span className="font-bold text-navy flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-[#C45A5A]" />
                <span>현재 동의 상태 진단</span>
              </span>
              {consentHistory ? (
                <p className="text-navy/60 font-mono">
                  동의 시각: {new Date(consentHistory.timestamp).toLocaleString()} (v{consentHistory.version})
                </p>
              ) : (
                <p className="text-red-600/80 font-bold">
                  아직 동의 이력이 없거나 전면 거부(철회) 상태입니다.
                </p>
              )}
            </div>
            {consentHistory && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleRevokeConsent}
                className="text-xxs font-bold shrink-0 text-red-500 hover:bg-red-50 border-red-200 min-h-[40px] flex items-center space-x-1"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>모든 쿠키 동의 일괄 철회</span>
              </Button>
            )}
          </div>

        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-navy/40 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-sage" />
          <span>꿈과 운의 사전은 정보보호 및 개인정보 제어 권리를 철저히 보장합니다.</span>
        </p>
      </div>

    </div>
  );
}
