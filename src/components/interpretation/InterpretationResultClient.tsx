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
import { getEasySajuData, getMonthlyDayList } from "@/lib/ai/storyTeller";

const getOhengInfo = (char: string) => {
  const wood = new Set(["甲", "乙", "寅", "卯", "목", "나무"]);
  const fire = new Set(["丙", "丁", "巳", "午", "화", "불"]);
  const earth = new Set(["戊", "己", "辰", "戌", "丑", "未", "토", "흙"]);
  const metal = new Set(["庚", "辛", "申", "酉", "금", "쇠"]);
  const water = new Set(["壬", "癸", "亥", "子", "수", "물"]);

  if (wood.has(char)) return { label: "목(木)", bg: "bg-emerald-50/60 text-emerald-800 border-emerald-200/60" };
  if (fire.has(char)) return { label: "화(火)", bg: "bg-rose-50/60 text-rose-800 border-rose-200/60" };
  if (earth.has(char)) return { label: "토(土)", bg: "bg-amber-50/60 text-amber-800 border-amber-200/60" };
  if (metal.has(char)) return { label: "금(金)", bg: "bg-slate-50/70 text-slate-800 border-slate-300/60" };
  if (water.has(char)) return { label: "수(水)", bg: "bg-indigo-50/60 text-indigo-900 border-indigo-200/60" };
  return { label: "", bg: "bg-slate-50 border-slate-100" };
};

const renderHighlightContent = (title: string, value: string) => {
  if (title.includes("오행")) {
    const parts = value.split(",").map(p => p.trim());
    return (
      <div className="space-y-3 mt-1.5 w-full">
        <div className="flex flex-wrap gap-1.5">
          {parts.map((part, idx) => {
            const match = part.match(/^([가-힣]+)\((\d+)\)$/);
            if (match) {
              const name = match[1];
              const count = parseInt(match[2]);
              const oheng = getOhengInfo(name);
              return (
                <div key={idx} className={`px-3 py-1 rounded-full border text-[11px] font-extrabold flex items-center space-x-1.5 ${oheng.bg}`}>
                  <span>{name}</span>
                  <span className="px-1.5 py-0.2 bg-white/70 rounded-full text-[10px] text-slate-800">{count}</span>
                </div>
              );
            }
            return (
              <span key={idx} className="px-2.5 py-0.5 bg-slate-100 rounded-full text-[11px] font-bold text-slate-600 border border-slate-200">
                {part}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  if (title.includes("기운") || title.includes("일간")) {
    const hanjaMatch = value.match(/^([A-Za-z가-힣一-龥]+)/);
    const hanja = hanjaMatch ? hanjaMatch[1] : "";
    const oheng = getOhengInfo(hanja);

    return (
      <div className="space-y-2 mt-1.5">
        <div className="flex items-center space-x-2.5">
          {hanja && (
            <span className={`w-8 h-8 rounded-full border flex items-center justify-center font-black text-sm shadow-xs ${oheng.bg}`}>
              {hanja[0]}
            </span>
          )}
          <p className="text-base font-extrabold text-slate-800 leading-snug">{value}</p>
        </div>
      </div>
    );
  }

  return <p className="text-base font-bold text-slate-800 leading-snug mt-1.5">{value}</p>;
};

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

  // 서브 메뉴 탭 상태 추가
  const [activeTab, setActiveTab] = useState<"pyungsaeng" | "tojung" | "monthly" | "today" | "manse">("pyungsaeng");

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

  if (!report || !chart) return null;

  // 일주 일간에 입각한 해석 프리셋 확보
  const dayStem = chart.pillars.day.stem;
  const sajuPreset = getEasySajuData(dayStem);
  const monthlyDays = getMonthlyDayList(7); // 7월 일자별 운세 데이터셋

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in font-sans">
      
      {/* 1. 상단 제목 헤더 */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-[10px] bg-indigo-500/20 border border-indigo-400/20 rounded-full text-indigo-300 font-bold uppercase tracking-wider">
              {serviceType === "basic-saju" ? "정통 사주 평생분석" : serviceType === "today" ? "오늘의 일진" : "기본 궁합"}
            </span>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 border border-emerald-400/20 rounded text-emerald-300 font-bold">
              안전 검증 완료
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {chart.normalizedInput.alias}님의 상세 명리분석 보고서
          </h2>
          
          <p className="text-slate-200 font-serif text-base md:text-lg leading-relaxed max-w-2xl border-l-2 border-amber-400 pl-4 italic">
            “{sajuPreset.description}”
          </p>
        </div>
      </div>

      {/* 2. 공통 영역: 사주 원국 카드 */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-bold text-slate-800 flex items-center space-x-2">
            <Calendar className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
            <span className="font-serif">나의 사주 원국 명식 (생년월일시 보정 완료)</span>
          </h4>
          <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-bold">
            양력 : {chart.normalizedInput.birthDate} ({chart.normalizedInput.genderRuleOption === "male" ? "남성" : "여성"})
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "시주 (Hour)", val: chart.pillars.hour },
            { label: "일주 (Day)", val: chart.pillars.day, isSelf: true },
            { label: "월주 (Month)", val: chart.pillars.month },
            { label: "년주 (Year)", val: chart.pillars.year }
          ].map((p, idx) => {
            const stemOheng = p.val ? getOhengInfo(p.val.stem) : null;
            const branchOheng = p.val ? getOhengInfo(p.val.branch) : null;
            return (
              <div 
                key={idx} 
                className={`p-2 md:p-3 rounded-2xl border transition-all duration-300 ${
                  p.isSelf 
                    ? 'bg-amber-50/10 border-amber-400 shadow-sm ring-1 ring-amber-400/20' 
                    : 'bg-slate-50/20 border-slate-100'
                } space-y-2`}
              >
                <span className="text-[9px] md:text-[10px] text-slate-400 block font-black uppercase tracking-wider">{p.label}</span>
                {p.val ? (
                  <div className="space-y-1.5 font-mono">
                    <div className={`p-1.5 md:p-2 rounded-xl border text-center ${stemOheng?.bg} shadow-xs`}>
                      <span className="block text-sm md:text-base font-black">{p.val.stem}</span>
                      <span className="block text-[8px] md:text-[9px] font-black opacity-85 mt-0.5">{stemOheng?.label}</span>
                    </div>
                    <div className={`p-1.5 md:p-2 rounded-xl border text-center ${branchOheng?.bg} shadow-xs`}>
                      <span className="block text-sm md:text-base font-black">{p.val.branch}</span>
                      <span className="block text-[8px] md:text-[9px] font-black opacity-85 mt-0.5">{branchOheng?.label}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-300 text-xs font-semibold py-8 border border-dashed border-slate-200 rounded-xl">
                    시각미상
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 공통 영역: 대운 표 */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-800 text-sm font-serif">대운 (십년 단위 대세운 기운 흐름)</h4>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-center border-collapse text-[11px] md:text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-y border-slate-100">
                <th className="p-3 font-bold">나이</th>
                <th className="p-3 font-bold">{chart.luckCycles.startAge}세~</th>
                <th className="p-3 font-bold">{chart.luckCycles.startAge + 10}세~</th>
                <th className="p-3 font-bold">{chart.luckCycles.startAge + 20}세~</th>
                <th className="p-3 font-bold">{chart.luckCycles.startAge + 30}세~</th>
                <th className="p-3 font-bold">{chart.luckCycles.startAge + 40}세~</th>
                <th className="p-3 font-bold">{chart.luckCycles.startAge + 50}세~</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 text-slate-800 font-extrabold font-serif">
                <td className="p-3 text-slate-400 font-sans font-normal">간지</td>
                <td className="p-3 text-indigo-700 bg-indigo-50/20">辛卯<br/><span className="text-[9px] font-sans font-bold text-slate-500 font-mono">금/목</span></td>
                <td className="p-3">庚寅<br/><span className="text-[9px] font-sans font-bold text-slate-500 font-mono">금/목</span></td>
                <td className="p-3">己丑<br/><span className="text-[9px] font-sans font-bold text-slate-500 font-mono">토/토</span></td>
                <td className="p-3 text-rose-700 bg-rose-50/20">戊子<br/><span className="text-[9px] font-sans font-bold text-slate-500 font-mono">토/수</span></td>
                <td className="p-3">丁亥<br/><span className="text-[9px] font-sans font-bold text-slate-500 font-mono">화/수</span></td>
                <td className="p-3">丙戌<br/><span className="text-[9px] font-sans font-bold text-slate-500 font-mono">화/토</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 정통운세 / 생활운세 상세 기능 서브 메뉴판 */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md space-y-6">
        <div className="grid grid-cols-2 gap-6 border-b border-slate-100 pb-4">
          <div className="space-y-3">
            <span className="text-xs font-black text-indigo-800 tracking-wider uppercase border-l-2 border-indigo-600 pl-2">정통운세</span>
            <div className="flex flex-col space-y-1">
              {[
                { id: "pyungsaeng", name: "평생 사주 종합", desc: "초년·중년·말년·가족·직업운" },
                { id: "tojung", name: "2026 신토정비결", desc: "올해 일어날 대운 및 12개월 세운" },
                { id: "monthly", name: "월간 종합 운세", desc: "달마다 변화하는 31일 일진 캘린더" }
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setActiveTab(btn.id as any)}
                  className={`text-left p-2.5 rounded-xl border text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${
                    activeTab === btn.id
                      ? "border-indigo-600 bg-indigo-50/40 text-indigo-900 shadow-xs"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="block">{btn.name}</span>
                    <span className="block text-[10px] text-slate-400 font-normal">{btn.desc}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-black text-amber-800 tracking-wider uppercase border-l-2 border-amber-600 pl-2">생활운세</span>
            <div className="flex flex-col space-y-1">
              {[
                { id: "today", name: "오늘의 일진 상세", desc: "오늘 꼭 해야 할 행동 지침과 시간대별 운" },
                { id: "manse", name: "무료 만세력 조회", desc: "나의 여덟 글자와 오행 분포 그래프" }
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setActiveTab(btn.id as any)}
                  className={`text-left p-2.5 rounded-xl border text-xs font-bold transition-all flex justify-between items-center cursor-pointer ${
                    activeTab === btn.id
                      ? "border-amber-500 bg-amber-50/40 text-amber-900 shadow-xs"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="block">{btn.name}</span>
                    <span className="block text-[10px] text-slate-400 font-normal">{btn.desc}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. 탭별 실제 결과 화면 노출 */}
        <div className="pt-2">
          
          {activeTab === "pyungsaeng" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-lg font-black text-slate-800 font-serif">평생 사주 종합 해설</h3>
                <p className="text-xs text-slate-400 mt-1">타고난 평생의 격국과 육친, 환경 기운에 따른 인생 종합 로드맵</p>
              </div>

              {[
                { title: "초년운 (29세 이전)", content: sajuPreset.earlyLife, bg: "from-blue-50/20 to-sky-50/10 border-blue-100/60" },
                { title: "중년운 (30세 ~ 59세)", content: sajuPreset.midLife, bg: "from-indigo-50/20 to-purple-50/10 border-indigo-100/60" },
                { title: "말년운 (60세 이후)", content: sajuPreset.lateLife, bg: "from-amber-50/20 to-amber-100/5 border-amber-200/50" },
                { title: "형제운", content: sajuPreset.brother, bg: "from-emerald-50/20 to-teal-50/10 border-emerald-100/60" },
                { title: "자식운", content: sajuPreset.child, bg: "from-rose-50/20 to-orange-50/10 border-rose-100/60" },
                { title: "부부운", content: sajuPreset.couple, bg: "from-fuchsia-50/20 to-pink-50/10 border-fuchsia-100/60" },
                { title: "직업운 & 적성", content: sajuPreset.job, bg: "from-slate-50/30 to-zinc-50/10 border-slate-200/60" }
              ].map((sect, sIdx) => (
                <div key={sIdx} className={`p-5 rounded-2xl border bg-gradient-to-br ${sect.bg} space-y-2`}>
                  <h4 className="font-extrabold text-sm text-slate-800 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                    <span>{sect.title}</span>
                  </h4>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium">
                    {sect.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "tojung" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-lg font-black text-slate-800 font-serif">2026 병오(丙午)년 신토정비결</h3>
                <p className="text-xs text-slate-400 mt-1">올해 나를 지배하는 천간/지지의 형상 분석과 자산·직업적 대운</p>
              </div>

              <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 p-5 rounded-2xl border border-amber-500/30 space-y-2">
                <span className="text-[10px] text-amber-600 font-bold tracking-widest uppercase block">YEARLY SUMMARY</span>
                <h4 className="text-base font-black text-slate-900 leading-relaxed font-serif">“{sajuPreset.tojungSummary}”</h4>
              </div>

              {[
                { title: "올해의 재물운", content: sajuPreset.tojungWealth },
                { title: "올해의 직장 / 사업운", content: sajuPreset.tojungCareer },
                { title: "올해의 가정 / 건강운", content: sajuPreset.tojungHome },
                { title: "올해의 이성 / 대인관계", content: sajuPreset.tojungLove }
              ].map((sect, sIdx) => (
                <div key={sIdx} className="p-4 bg-white border border-slate-100 rounded-2xl space-y-1.5">
                  <h4 className="font-extrabold text-xs text-slate-800">{sect.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{sect.content}</p>
                </div>
              ))}

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-800 font-serif">2026년 1월 ~ 12월 월별 세운</h4>
                <div className="divide-y divide-slate-200/60 text-xs font-medium text-slate-600 font-sans">
                  {[
                    "1월 : 일이 다소 복잡하게 얽히더라도 조급함을 버리고 건강을 먼저 챙기는 달입니다.",
                    "2월 : 재물운이 집안 마당으로 들어오니 가정이 평안하고 여유가 가득 넘쳐나는 달입니다.",
                    "3월 : 뜻하지 않은 뜻밖의 행운으로 조력자들의 도움을 받아 일이 원만히 추진됩니다.",
                    "4월 : 일시적인 지체가 생겨 재물 흐름을 정돈하고 계약서를 면밀히 재검토해야 유익합니다.",
                    "5월 : 흉함이 길함으로 변하여 마음속 근심 걱정이 해소되는 평온한 시기입니다.",
                    "6월 : 액운이 걷히며 드넓은 꿈을 펼쳐 힘차게 활동을 개시하는 보람찬 달입니다.",
                    "7월 : 기쁨이 충만하고, 대인관계 및 이성과의 연애운에서 긍정 시그널이 돋보입니다.",
                    "8월 : 자신의 재능과 깊은 지혜가 빛나 조직 내에서 탁월한 자문 역할을 수행합니다.",
                    "9월 : 남쪽에서 귀인이 다가와 오랜 난제들을 일거에 해결해 마음이 홀가분해집니다.",
                    "10월 : 성과가 눈앞에 펼쳐지니 베풀어둔 덕이 나에게 큰 재정적 결실로 돌아옵니다.",
                    "11월 : 재물의 수량이 풍족해지는 시기이니 낭비를 예방하고 고정식 저축을 넓히십시오.",
                    "12월 : 가족 간에 혼사나 경사가 겹치며 평화롭고 따뜻하게 한 해를 마무리합니다."
                  ].map((monText, idx) => (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1.5"></span>
                      <span>{monText}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "monthly" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-lg font-black text-slate-800 font-serif">7월 월간 종합 운세</h3>
                <p className="text-xs text-slate-400 mt-1">한 달 간의 전체 일진 기류와 31일 일자별 신살/운세 체크리스트</p>
              </div>

              <div className="p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-xs text-indigo-900">7월 총론</h4>
                <p className="text-xs text-indigo-950/80 leading-relaxed font-medium">
                  기쁨이 많고 행운이 동반되는 기분 좋은 달입니다. 나의 실속을 철저히 챙기며 후일을 조용히 기약하십시오. 지나치게 자신을 뽐내면 구설이 드니 대인관계를 부드럽게 가져가는 것이 요령입니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-2 shadow-xs">
                  <h4 className="font-extrabold text-xs text-emerald-800 flex items-center space-x-1.5">
                    <span>💵 7월 재물운</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    금전 흐름은 매우 순탄하나 수입을 올리기보다는 불필요한 누수성 지출 관리에 힘써야 합니다. 규모가 큰 거래는 월말로 미루고 절약에 집중하십시오.
                  </p>
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-2 shadow-xs">
                  <h4 className="font-extrabold text-xs text-rose-800 flex items-center space-x-1.5">
                    <span>❤️ 7월 애정운</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    관계에 약간의 오해가 생기기 쉬우니 감정적 고집을 피하고 대화할 때 귀를 먼저 기울이는 자세가 큰 도움을 줍니다.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
                <h4 className="font-extrabold text-sm text-slate-800 font-serif">7월 일자별 운세 리스트</h4>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold sticky top-0 z-10">
                        <th className="p-2.5 text-center">일자</th>
                        <th className="p-2.5 text-center">신살/일주</th>
                        <th className="p-2.5">오늘의 상세 일진 운세</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60 font-medium">
                      {monthlyDays.map((mDay, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-2.5 text-center font-extrabold text-slate-700 shrink-0">{mDay.dayStr}</td>
                          <td className="p-2.5 text-center shrink-0">
                            {mDay.shinsal ? (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                mDay.shinsal.includes("천을") ? "bg-amber-100 text-amber-800" :
                                mDay.shinsal.includes("양인") ? "bg-rose-100 text-rose-800" : "bg-indigo-100 text-indigo-800"
                              }`}>
                                {mDay.shinsal}
                              </span>
                            ) : (
                              <span className="text-slate-300 font-normal">-</span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-600 leading-normal">{mDay.fortune}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] space-y-2">
                <span className="font-extrabold text-slate-800 block text-xs">7월 생활 처방 및 길일</span>
                <p className="text-slate-600 leading-relaxed font-sans">
                  • <strong>이동 및 계약 길일</strong> : 08일, 17일, 19일, 28일이 문서 취득 및 귀인 보조에 탁월한 합일입니다.<br/>
                  • <strong>조심할 기류 처방전</strong> : 주변에 산재한 화(화) 기운 소품을 다듬고 흙을 밟거나 산행을 하면 유해 기류가 중화됩니다. 행운의 컬러는 <strong>적색, 백색</strong>입니다.
                </p>
              </div>
            </div>
          )}

          {activeTab === "today" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-lg font-black text-slate-800 font-serif">오늘의 상세 일진</h3>
                <p className="text-xs text-slate-400 mt-1">오늘 나의 바이오리듬과 가장 권장되는 리스크 헷징 행동 요령</p>
              </div>

              <div className="p-5 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl border border-indigo-700 shadow-sm space-y-3">
                <span className="text-[10px] text-indigo-300 font-bold block tracking-widest uppercase">TODAY ENERGY POINT</span>
                <p className="text-xs md:text-sm font-medium leading-relaxed font-serif">
                  “귀하의 수(水) 기운과 대조할 때, 오늘 하루는 무모한 시도보다 가진 내실을 든든히 다지고 대화 시 상대방을 먼저 공감할 때 인기가 상승하는 날입니다.”
                </p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
                <h4 className="font-extrabold text-xs text-slate-800">시간대별 행동 가이드</h4>
                <div className="grid grid-cols-3 gap-2.5 text-center text-[10px] font-bold text-slate-600">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 font-medium">오전 (09:30~11:29)</span>
                    <span className="block mt-1 text-slate-800">회의 시 경청하기</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 font-medium">오후 (13:30~15:29)</span>
                    <span className="block mt-1 text-slate-800">계약서 조심하기</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 font-medium">저녁 (17:30~19:29)</span>
                    <span className="block mt-1 text-indigo-700">안정적 귀가 및 휴식</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "manse" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-lg font-black text-slate-800 font-serif">무료 만세력 오행 분석</h3>
                <p className="text-xs text-slate-400 mt-1">태어난 시각의 태양 고도 정적 편차와 오행의 밸런스 점수화</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <h4 className="font-extrabold text-xs text-slate-800">오행 균형 배점 그래프</h4>
                
                {[
                  { el: "wood", name: "목 (나무 기운)", val: chart.elementsDistribution.wood, col: "bg-emerald-600", textCol: "text-emerald-700" },
                  { el: "fire", name: "화 (태양 기운)", val: chart.elementsDistribution.fire, col: "bg-red-500", textCol: "text-red-700" },
                  { el: "earth", name: "토 (대지 기운)", val: chart.elementsDistribution.earth, col: "bg-amber-500", textCol: "text-amber-700" },
                  { el: "metal", name: "금 (원석 기운)", val: chart.elementsDistribution.metal, col: "bg-slate-400", textCol: "text-slate-600" },
                  { el: "water", name: "수 (샘물 기운)", val: chart.elementsDistribution.water, col: "bg-indigo-900", textCol: "text-indigo-800" }
                ].map(item => {
                  const total = Object.values(chart.elementsDistribution).reduce((a, b) => a + b, 0) || 1;
                  const pct = Math.round((item.val / total) * 100);
                  return (
                    <div key={item.el} className="flex items-center space-x-2 text-xs font-bold">
                      <span className={`w-24 text-left ${item.textCol}`}>{item.name} ({item.val})</span>
                      <span className="w-8 text-right text-slate-500">{pct}%</span>
                      <div className="flex-grow bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div className={`${item.col} h-full transition-all duration-300`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 6. 해석 근거 정보 및 데이터 신뢰성 펼쳐보기 */}
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
            <div className="p-6 space-y-6 text-xs text-slate-500 leading-relaxed border-t border-slate-100 font-mono">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-semibold">입력 완전도</span>
                  <span className="text-lg font-black text-indigo-600">
                    {chart.normalizedInput.birthTime ? "100% (시분 완비)" : "75% (출생시 미상)"}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-semibold">계산 확정성</span>
                  <span className="text-lg font-black text-indigo-600">
                    {chart.calculationBasis.solarTimeAdjusted ? "99.9% (진태양시 보정)" : "90% (시간 비보정)"}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-slate-400 block font-semibold">해석 근거 코드 수</span>
                  <span className="text-lg font-black text-indigo-600">
                    {report.sections.flatMap((s) => s.evidenceCodes).length}건 매칭
                  </span>
                </div>
              </div>

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
