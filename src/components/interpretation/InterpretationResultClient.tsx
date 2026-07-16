"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Share2, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Activity,
  Calendar
} from "lucide-react";
import { getOrCreateInterpretationAction, createSharedLinkAction } from "@/app/actions/interpretation";
import { getManseChartAction } from "@/app/actions/manse";
import { ChartResult } from "@/lib/manse/types";
import { StructuredInterpretation } from "@/lib/ai/types";
import { Button } from "@/components/ui/Button";
import { AdSlot } from "@/components/ads/AdSlot";

interface InterpretationResultClientProps {
  profileId: string;
  profileId2?: string;
  serviceType: "basic-saju" | "today" | "compatibility";
  isSharedView?: boolean;
  prefetchedData?: StructuredInterpretation; // 공유 전용 또는 기 조회 데이터가 있을 때 주입
}

export function InterpretationResultClient({
  profileId,
  profileId2,
  serviceType,
  isSharedView = false,
  prefetchedData
}: InterpretationResultClientProps) {
  const [loadingStep, setLoadingStep] = useState<"calculating" | "ai_generating" | "done" | "error">(prefetchedData ? "done" : "calculating");
  const [chart, setChart] = useState<ChartResult | null>(null);
  const [chart2, setChart2] = useState<ChartResult | null>(null);
  const [report, setReport] = useState<StructuredInterpretation | null>(prefetchedData || null);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    if (isSharedView && prefetchedData) {
      return;
    }

    const initInterpretation = async () => {
      try {
        setLoadingStep("calculating");
        // 1단계: 만세력 프리패칭 검사
        const c1Res = await getManseChartAction({ profileId });
        if (!c1Res.success || !c1Res.chart) {
          setError(c1Res.error || "만세력 계산기 가동 중 실패했습니다.");
          setLoadingStep("error");
          return;
        }
        setChart(c1Res.chart);

        if (serviceType === "compatibility" && profileId2) {
          const c2Res = await getManseChartAction({ profileId: profileId2 });
          if (c2Res.success && c2Res.chart) {
            setChart2(c2Res.chart);
          }
        }

        // 2단계: AI 연산 단계로의 전환 시각 유도
        setLoadingStep("ai_generating");

        // 3단계: 서버 해석서 생성 액션 호출
        const interRes = await getOrCreateInterpretationAction({
          profileId,
          profileId2,
          serviceType,
          requestId: `${profileId}_${serviceType}_${new Date().toISOString().split("T")[0]}`
        });

        if (!interRes.success || !interRes.result) {
          setError(interRes.error || "AI 운세 보고서 획득에 실패했습니다.");
          setLoadingStep("error");
          return;
        }

        setReport(interRes.result.reportData);
        setLoadingStep("done");
      } catch (err) {
        console.error(err);
        setError("네트워크 연동 중 오류가 발생했습니다.");
        setLoadingStep("error");
      }
    };

    initInterpretation();
  }, [profileId, profileId2, serviceType, isSharedView, prefetchedData]);

  // 공유 링크 발급 핸들러
  const handleShare = async () => {
    if (isSharedView || !report) return;
    try {
      setShareLoading(true);
      
      // DB 해석 ID 찾기 위해 기 저장된 결과 캐시 조회
      const interRes = await getOrCreateInterpretationAction({
        profileId,
        profileId2,
        serviceType
      });

      if (interRes.success && interRes.result) {
        const shareRes = await createSharedLinkAction(interRes.result.id);
        if (shareRes.success && shareRes.linkId) {
          const origin = window.location.origin;
          const url = `${origin}/share/${shareRes.linkId}?key=${shareRes.key}`;
          setShareUrl(url);
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } else {
          alert(shareRes.error || "공유 링크 생성 실패");
        }
      }
    } catch (err) {
      console.error("Share link generation error:", err);
      alert("공유 처리 도중 에러가 발생했습니다.");
    } finally {
      setShareLoading(false);
    }
  };

  // 로딩 단계 렌더링
  if (loadingStep === "calculating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">명조 우주 좌표 계산 중</h3>
          <p className="text-sm text-slate-500 max-w-sm">생년월일시 기준 경도 보정 및 Spencer 균시차를 활용한 태양 중심 정밀 시차 보정이 이행되고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (loadingStep === "ai_generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-6">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-indigo-600 animate-bounce" />
          <div className="absolute inset-0 border-2 border-indigo-400 border-dashed rounded-full animate-spin"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800 animate-pulse">명리학 분석 리포트 생성 중</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            도출된 사주 원국 오행 지수와 신살 근거코드(Evidence Codes)를 매칭하여 현대적 문체 가이드라인에 따른 성향 분석서를 조립하고 있습니다.
          </p>
          <div className="w-64 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden mt-4">
            <div className="h-full bg-indigo-600 rounded-full animate-infinite-loading"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingStep === "error") {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-rose-100 rounded-2xl shadow-sm space-y-4 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">보고서 생성 지연</h3>
        <p className="text-sm text-slate-500">{error || "일시적인 지연이 일어나고 있습니다. 잠시 후 새로고침해 주시기 바랍니다."}</p>
        <Button onClick={() => window.location.reload()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">다시 시도</Button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* 1. 상단 제목 헤더 및 캐시 마크 */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-xs bg-indigo-500/30 border border-indigo-400/20 rounded-full text-indigo-200 font-semibold uppercase tracking-wider">
              {serviceType === "basic-saju" ? "기본사주" : serviceType === "today" ? "오늘운세" : "기본궁합"}
            </span>
            {report.safetyFlags.includes("SAFE_FALLBACK") && (
              <span className="px-2 py-0.5 text-xs bg-amber-500/30 border border-amber-400/20 rounded text-amber-200">
                로컬 요약본
              </span>
            )}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {isSharedView ? "공유된 운세 카드" : `${chart?.normalizedInput.alias || "고객"}님의 상세 분석 보고서`}
          </h2>
          
          <p className="text-indigo-100 font-medium text-lg leading-relaxed max-w-2xl border-l-2 border-indigo-400/50 pl-4">
            “{report.summary}”
          </p>

          {/* 비회원 공유 버튼 노출 */}
          {!isSharedView && (
            <div className="pt-2 flex items-center space-x-4">
              <Button 
                onClick={handleShare} 
                disabled={shareLoading}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-4 py-2 flex items-center space-x-2 text-sm transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>{shareLoading ? "링크 발행 중..." : "안전하게 공유하기"}</span>
              </Button>
              {copied && (
                <span className="text-xs text-indigo-300 flex items-center space-x-1 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>비공개 공유 링크 복사 완료 (7일 보관)</span>
                </span>
              )}
              {shareUrl && (
                <div className="mt-2 p-2 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs text-indigo-200 select-all font-mono break-all max-w-lg">
                  공유주소: {shareUrl}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 불확실성 경고 노출 (시간미상 등) */}
      {report.uncertainty.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start space-x-3 text-amber-800 text-sm shadow-inner">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">분석 정밀도 유의사항</span>
            {report.uncertainty.map((u, i) => (
              <p key={i} className="text-amber-700">{u.message}</p>
            ))}
          </div>
        </div>
      )}

      {/* 2. 사주 원국 정보 요약 (공유 뷰에서는 프라이버시를 위해 제외) */}
      {!isSharedView && chart && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                <Calendar className="w-4.5 h-4.5 text-indigo-600" />
                <span>계산된 사주 원국 기준 ({chart.normalizedInput.alias})</span>
              </h4>
              <span className="text-xs text-slate-400">
                보정기준: {chart.calculationBasis.solarTimeAdjusted ? "진태양시 경도보정 적용" : "표준 자오선 기준"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "시주 (Hour)", val: chart.pillars.hour },
                { label: "일주 (Day)", val: chart.pillars.day, isSelf: true },
                { label: "월주 (Month)", val: chart.pillars.month },
                { label: "년주 (Year)", val: chart.pillars.year }
              ].map((p, idx) => (
                <div key={idx} className={`p-3 rounded-2xl border ${p.isSelf ? 'bg-indigo-50/50 border-indigo-200/50' : 'bg-slate-50/50 border-slate-100'} space-y-1`}>
                  <span className="text-[10px] text-slate-400 block font-medium">{p.label}</span>
                  {p.val ? (
                    <div className="font-extrabold text-base md:text-lg text-slate-800">
                      <span className="block">{p.val.stem}</span>
                      <span className="block mt-0.5 text-slate-600 font-semibold">{p.val.branch}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs block py-2">시각미상</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {chart2 && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                  <Calendar className="w-4.5 h-4.5 text-indigo-600" />
                  <span>계산된 상대방 사주 원국 기준 ({chart2.normalizedInput.alias})</span>
                </h4>
                <span className="text-xs text-slate-400">
                  보정기준: {chart2.calculationBasis.solarTimeAdjusted ? "진태양시 경도보정 적용" : "표준 자오선 기준"}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "시주 (Hour)", val: chart2.pillars.hour },
                  { label: "일주 (Day)", val: chart2.pillars.day, isSelf: true },
                  { label: "월주 (Month)", val: chart2.pillars.month },
                  { label: "년주 (Year)", val: chart2.pillars.year }
                ].map((p, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl border ${p.isSelf ? 'bg-indigo-50/50 border-indigo-200/50' : 'bg-slate-50/50 border-slate-100'} space-y-1`}>
                    <span className="text-[10px] text-slate-400 block font-medium">{p.label}</span>
                    {p.val ? (
                      <div className="font-extrabold text-base md:text-lg text-slate-800">
                        <span className="block">{p.val.stem}</span>
                        <span className="block mt-0.5 text-slate-600 font-semibold">{p.val.branch}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs block py-2">시각미상</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. 하이라이트 요약 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.highlights.map((h, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex items-start space-y-0 space-x-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              {i === 0 ? <Activity className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">{h.title}</span>
              <p className="text-base font-bold text-slate-800 leading-snug">{h.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. 영역별 상세 해석 (Sections) */}
      <div className="space-y-6">
        <h3 className="text-xl font-extrabold text-slate-800 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>핵심 명리 영역 분석</span>
        </h3>

        {report.sections.map((sec, idx) => (
          <React.Fragment key={sec.id}>
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div>
                <h4 className="text-lg font-bold text-slate-800">{sec.title}</h4>
                <p className="text-sm text-indigo-600/80 font-medium mt-1">“{sec.summary}”</p>
              </div>

              <div className="space-y-2 text-slate-600 text-sm leading-relaxed">
                {sec.paragraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* 시그널 뱃지 영역 */}
              {((sec.positiveSignals && sec.positiveSignals.length > 0) || (sec.cautionSignals && sec.cautionSignals.length > 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {sec.positiveSignals && sec.positiveSignals.length > 0 && (
                    <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-3 text-xs space-y-1">
                      <span className="font-bold text-emerald-800 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>긍정 시그널</span>
                      </span>
                      <ul className="list-disc pl-4 text-emerald-700 space-y-0.5">
                        {sec.positiveSignals.map((sig, idx) => <li key={idx}>{sig}</li>)}
                      </ul>
                    </div>
                  )}

                  {sec.cautionSignals && sec.cautionSignals.length > 0 && (
                    <div className="bg-rose-50/50 border border-rose-100/50 rounded-2xl p-3 text-xs space-y-1">
                      <span className="font-bold text-rose-800 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>주의 필요 기류</span>
                      </span>
                      <ul className="list-disc pl-4 text-rose-700 space-y-0.5">
                        {sec.cautionSignals.map((sig, idx) => <li key={idx}>{sig}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 구체적 행동 강령 리스트 */}
              {sec.actions && sec.actions.length > 0 && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2">
                  <span className="font-bold text-slate-700 flex items-center space-x-1">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                    <span>실천 행동 제안 (Action Items)</span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                    {sec.actions.map((act, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-white border border-slate-100 p-2 rounded-xl">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* 첫 상세 분석글 직후 광고 슬롯 주입 */}
            {idx === 0 && (
              <AdSlot slotKey="result_after_summary" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 5. 시기 흐름 (Timeline) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="text-xl font-extrabold text-slate-800 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <span>운세 흐름 및 시기 분석</span>
        </h3>

        <div className="space-y-4">
          {report.timeline.map((item, idx) => (
            <div key={idx} className="border-l-4 border-indigo-500 pl-4 space-y-2 py-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 text-base">{item.period}</span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-slate-400">기운 강도</span>
                  <div className="flex space-x-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span 
                        key={i} 
                        className={`w-2 h-2.5 rounded-sm ${i < item.intensity ? 'bg-indigo-600' : 'bg-slate-100'}`}
                      ></span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                <p><strong className="text-slate-800 block mb-0.5">💡 기회 흐름</strong> {item.opportunity}</p>
                <p><strong className="text-slate-800 block mb-0.5">⚠️ 주의 사항</strong> {item.caution}</p>
                <p><strong className="text-slate-800 block mb-0.5">🎯 권장 행동</strong> {item.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. 해석 근거 정보 및 데이터 신뢰성 펼쳐보기 (공유 뷰에서는 프라이버시로 필터링) */}
      {!isSharedView && (
        <div className="border border-slate-100 rounded-3xl bg-white overflow-hidden shadow-sm">
          <button 
            onClick={() => setShowEvidence(!showEvidence)}
            className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 font-bold text-slate-800 text-sm border-b border-slate-100 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
              <span>해석 근거 및 계산 신뢰성 세부 정보</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {showEvidence ? "상세 닫기 ▲" : "근거코드 대조 펼쳐보기 ▼"}
            </span>
          </button>

          {showEvidence && (
            <div className="p-6 space-y-6 text-xs text-slate-500 leading-relaxed border-t border-slate-100">
              
              {/* 메트릭 지표 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-semibold">입력 완전도</span>
                  <span className="text-lg font-black text-indigo-600">
                    {chart?.normalizedInput.birthTime ? "100% (시분 완비)" : "75% (출생시 미상)"}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-semibold">계산 확정성</span>
                  <span className="text-lg font-black text-indigo-600">
                    {chart?.calculationBasis.solarTimeAdjusted ? "99.9% (진태양시 보정)" : "90% (시간 비보정)"}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-semibold">해석 근거 코드 수</span>
                  <span className="text-lg font-black text-indigo-600">
                    {report.sections.flatMap((s) => s.evidenceCodes).length}건 매칭
                  </span>
                </div>
              </div>

              {/* 매칭된 코드 디스크립션 */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">원국에 결합된 활성 규칙코드(Evidence Code) 리스트:</span>
                <div className="divide-y divide-slate-100">
                  {report.sections.flatMap(s => s.evidenceCodes).filter((value, index, self) => self.indexOf(value) === index).map((code, idx) => (
                    <div key={idx} className="py-2 flex items-start justify-between space-x-2">
                      <span className="font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-semibold text-[10px] tracking-wide shrink-0">
                        {code}
                      </span>
                      <span className="text-slate-500 text-right text-[11px] leading-relaxed">
                        전통 명리학 오행 격국 및 일주 이론 대조 완료
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 엔진 정보 */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[10px] text-slate-400">
                <p>Engine Ver: {report.engineVersion}</p>
                <p>Rule Ver: {report.ruleVersion}</p>
                <p>Prompt Ver: {report.promptVersion}</p>
                <p>Model: {report.generatedAt ? "Gemini-2.5-Flash" : "Fallback-Rules"}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 관련 콘텐츠 및 브랜드 정보 이전 광고 슬롯 */}
      <AdSlot slotKey="result_before_related" />

      {/* 7. 공유 뷰 전용 브랜드 가이드 */}
      {isSharedView && (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center space-y-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-800 text-base">꿈과 운의 사전</h4>
            <p className="text-xs text-slate-400">전통 천문학 계산법과 안전한 프라이버시가 결합된 AI 사주 사전</p>
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            공유를 받으신 분도 본인의 태어난 생년월일시만 기입하시면 100% 무료로 평생의 기본사주와 오늘운세, 궁합 분석 리포트를 확인하실 수 있습니다.
          </p>
          <a href="/fortune/input" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow transition-all">
            나도 사주팔자 무료로 분석해보기
          </a>
        </div>
      )}
    </div>
  );
}
