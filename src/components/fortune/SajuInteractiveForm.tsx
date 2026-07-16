"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { calculateManseChart, STEM_ELEMENTS, BRANCH_ELEMENTS } from "@/lib/manse/fourPillarsCalculator";
import { ChartResult } from "@/lib/manse/types";
import { handleCreateProfile } from "@/app/actions/profile";

// 각 운세 하위 메뉴별 동적 메타 데이터 정의
const TYPE_METAS: Record<string, { title: string; desc: string; buttonText: string }> = {
  manse: { title: "무료 만세력 조회", desc: "나의 여덟 글자와 오행 분포 비율을 산출합니다.", buttonText: "만세력 조회하기" },
  pyungsaeng: { title: "평생 사주 종합", desc: "타고난 평생 격국과 가문, 직업의 종합 인생 로드맵을 도출합니다.", buttonText: "평생사주 분석하기" },
  daewun: { title: "10대 대운 흐름", desc: "일생을 지배하는 10년 단위 대세운의 거대한 파동 타이밍을 읽습니다.", buttonText: "대운흐름 분석하기" },
  tojung: { title: "신년 신수 비결", desc: "병오(丙午)년 한 해의 수려한 12개월 세운 비결서를 제작합니다.", buttonText: "신수비결 분석하기" },
  monthly: { title: "월간 종합 운세", desc: "달마다 변하는 길흉 기류와 31일 일자별 신살 및 운세 캘린더를 발행합니다.", buttonText: "월간운세 분석하기" },
  today: { title: "오늘의 일진 상세", desc: "오늘 하루 나를 이끄는 핵심 바이오리듬과 시간대별 행동 지침을 발행합니다.", buttonText: "오늘일진 분석하기" }
};

// 오행 한글 명칭 및 색상 테마 매핑
const ELEMENT_STYLES: Record<string, { bg: string; border: string; text: string; nameKo: string; progressColor: string }> = {
  wood: { bg: "bg-[#B3C9BE]/35", border: "border-sage/20", text: "text-emerald-500", nameKo: "목 (木)", progressColor: "bg-emerald-600" },
  fire: { bg: "bg-[#ECCAC4]/40", border: "border-red-200", text: "text-red-500", nameKo: "화 (火)", progressColor: "bg-red-500" },
  earth: { bg: "bg-[#EBC7A4]/35", border: "border-gold/20", text: "text-amber-600", nameKo: "토 (土)", progressColor: "bg-amber-500" },
  metal: { bg: "bg-slate-200/35", border: "border-slate-350/25", text: "text-slate-400", nameKo: "금 (金)", progressColor: "bg-slate-400" },
  water: { bg: "bg-[#B9D0F8]/35", border: "border-navy/15", text: "text-indigo-400", nameKo: "수 (水)", progressColor: "bg-indigo-900" }
};

const TIME_OPTIONS = [
  { value: "none", label: "시간 모름 (시주 제외)" },
  { value: "00:30", label: "子시 (23:30 ~ 01:29)" },
  { value: "02:00", label: "丑시 (01:30 ~ 03:29)" },
  { value: "04:00", label: "寅시 (03:30 ~ 05:29)" },
  { value: "06:00", label: "卯시 (05:30 ~ 07:29)" },
  { value: "08:00", label: "辰시 (07:30 ~ 09:29)" },
  { value: "10:00", label: "巳시 (09:30 ~ 11:29)" },
  { value: "12:00", label: "午시 (11:30 ~ 13:29)" },
  { value: "14:00", label: "未시 (13:30 ~ 15:29)" },
  { value: "16:00", label: "申시 (15:30 ~ 17:29)" },
  { value: "18:00", label: "酉시 (17:30 ~ 19:29)" },
  { value: "20:00", label: "戌시 (19:30 ~ 21:29)" },
  { value: "22:00", label: "亥시 (21:30 ~ 23:29)" }
];

// 연도 범위 생성 (1930년 ~ 2026년)
const YEAR_OPTIONS = Array.from({ length: 2026 - 1930 + 1 }, (_, i) => 2026 - i);
// 월 범위 생성
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
// 일 범위 생성
const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function SajuInteractiveForm() {
  const router = useRouter();
  const [serviceType, setServiceType] = useState<string>("pyungsaeng");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const t = searchParams.get("type") || "pyungsaeng";
      setServiceType(t);
    }
  }, []);

  // 1. 입력 폼 상태 (기본값: 이미지와 동일하게 1995년 10월 24일 세팅)
  const [inputs, setInputs] = useState({
    year: 1995,
    month: 10,
    day: 24,
    birthTime: "none",
    calendarType: "solar" as "solar" | "lunar",
    gender: "male" as "male" | "female"
  });

  const [chart, setChart] = useState<ChartResult | null>(null);

  // 2. 실시간 만세력 연산 트리거
  useEffect(() => {
    try {
      const formattedMonth = String(inputs.month).padStart(2, "0");
      const formattedDay = String(inputs.day).padStart(2, "0");
      const birthDateStr = `${inputs.year}-${formattedMonth}-${formattedDay}`;

      const res = calculateManseChart({
        alias: "미리보기",
        genderRuleOption: inputs.gender,
        calendarType: inputs.calendarType,
        lunarLeapMonth: false,
        birthDate: birthDateStr,
        birthTime: inputs.birthTime === "none" ? null : inputs.birthTime,
        unknownBirthTime: inputs.birthTime === "none",
        birthCountry: "대한민국",
        birthCity: "서울",
        timezone: "Asia/Seoul",
        latitude: 37.5665,
        longitude: 126.9780,
        useTrueSolarTime: false,
        borderTimeRule: "23"
      });
      setChart(res);
    } catch (e) {
      console.error("실시간 명식 산출 실패:", e);
    }
  }, [inputs]);

  // 3. 동적 조언 생성기
  const getDynamicAdvice = () => {
    if (!chart) return "데이터 분석 중...";
    const dist = chart.elementsDistribution;
    const elements = ["wood", "fire", "earth", "metal", "water"] as const;
    const labelsKo = { wood: "목(木)", fire: "화(火)", earth: "토(토)", metal: "금(金)", water: "수(水)" };

    let strongest = elements[0] as "wood" | "fire" | "earth" | "metal" | "water";
    let weakest = elements[0] as "wood" | "fire" | "earth" | "metal" | "water";

    for (const el of elements) {
      if (dist[el] > dist[strongest]) strongest = el;
      if (dist[el] < dist[weakest]) weakest = el;
    }

    const remedyKo = {
      wood: "행동력과 시작 기운을 북돋는 초록색 의류나 실내 식물 배치를 권장합니다.",
      fire: "열정적 동력과 밝은 에너지를 일깨우는 붉은색 계열 소품 활용이 좋습니다.",
      earth: "심리적 안정감을 안착시키는 황토색/베이지색 패션 조화가 도움이 됩니다.",
      metal: "결단력과 과단성을 수혈해 주는 단정한 흰색 패션이나 메탈 악세사리 보충이 유익합니다.",
      water: "지혜로운 통찰과 차분한 마음 정돈을 돕는 블랙/네이비 조화가 이롭습니다."
    };

    return `현재 명식에는 **${labelsKo[weakest]}** 기운이 부족하고 **${labelsKo[strongest]}** 기운이 가장 강하게 관측됩니다. 부족한 에너지를 조율하기 위해 ${remedyKo[weakest]}`;
  };

  // 4. 간소화된 다이렉트 분석 프로필 제출 및 결과 즉시 이동
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formattedMonth = String(inputs.month).padStart(2, "0");
      const formattedDay = String(inputs.day).padStart(2, "0");
      const birthDateStr = `${inputs.year}-${formattedMonth}-${formattedDay}`;

      const profilePayload = {
        alias: "사주 분석 대상자",
        relationship: "self" as const,
        genderRuleOption: inputs.gender,
        calendarType: inputs.calendarType,
        lunarLeapMonth: false,
        birthDate: birthDateStr,
        birthTime: inputs.birthTime === "none" ? "12:00" : inputs.birthTime,
        unknownBirthTime: inputs.birthTime === "none",
        birthCountry: "대한민국",
        birthCity: "서울",
        selectedCityIndex: "0",
        timezone: "Asia/Seoul",
        latitude: 37.5665,
        longitude: 126.9780,
        calculationPreference: {
          useTrueSolarTime: false,
          borderTimeRule: "23" as const
        },
        saveConsent: true,
        topicPriority: ["종합"]
      };

      const dbResult = await handleCreateProfile(profilePayload);
      if (dbResult.success && dbResult.profile) {
        // 성공 시 즉각 4단계 건너뛰고 결과 뷰로 리다이렉트!
        router.push(`/result/basic-saju/${dbResult.profile.id}?type=${serviceType}`);
      } else {
        setErrorMsg(dbResult.error || "분석 대상 정보 등록 중 오류가 발생했습니다.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("제출 프로세스 실패:", err);
      setErrorMsg(err.message || "서버 통신 중 장애가 일어났습니다.");
      setIsSubmitting(false);
    }
  };

  const dist = chart?.elementsDistribution || { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;

  const renderPillarCard = (pillar: any, label: string, tenGod: any) => {
    if (!pillar) {
      return (
        <div className="bg-slate-900/40 text-slate-500 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-center items-center min-h-[140px]">
          <span className="text-[10px] text-slate-600 font-bold mb-1">{label}</span>
          <span className="text-sm font-semibold">-</span>
          <span className="text-[10px] mt-1 text-slate-600">시간 미입력</span>
        </div>
      );
    }

    const stemEl = STEM_ELEMENTS[pillar.stem] || "wood";
    const branchEl = BRANCH_ELEMENTS[pillar.branch] || "wood";

    const stemStyle = ELEMENT_STYLES[stemEl];
    const branchStyle = ELEMENT_STYLES[branchEl];

    return (
      <div className="space-y-2">
        <span className="text-xs text-navy/40 font-bold block">{label}</span>
        
        {/* 천간 */}
        <div className={`${stemStyle.bg} ${stemStyle.border} border rounded-xl p-3`}>
          <span className="text-[9px] block font-semibold text-navy/50">{tenGod?.stem || "일주"}</span>
          <span className="text-lg font-bold text-navy">{pillar.stem}</span>
          <span className="text-[9px] block text-navy/55 mt-0.5">{stemStyle.nameKo}</span>
        </div>

        {/* 지지 */}
        <div className={`${branchStyle.bg} ${branchStyle.border} border rounded-xl p-3`}>
          <span className="text-[9px] block font-semibold text-navy/50">{tenGod?.branch || "비견"}</span>
          <span className="text-lg font-bold text-navy">{pillar.branch}</span>
          <span className="text-[9px] block text-navy/55 mt-0.5">{branchStyle.nameKo}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* 1. 입력부 (5열) */}
      <div className="lg:col-span-5 bg-surface border border-brand-border rounded-2xl p-6 shadow-xs space-y-5">
        <div className="border-b border-brand-border/60 pb-3 space-y-1">
          <h2 className="text-lg font-bold text-navy">
            {TYPE_METAS[serviceType]?.title || "사주 분석 정보 입력"}
          </h2>
          <p className="text-xxs text-navy/60 leading-relaxed font-semibold">
            {TYPE_METAS[serviceType]?.desc || "태어난 생년월일시를 절기 기준으로 환산하여 해석을 제공합니다."}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 성별 선택 드롭다운 */}
          <div>
            <label className="text-xxs font-bold text-navy/55 block mb-1">성별</label>
            <select
              value={inputs.gender}
              onChange={(e) => setInputs((prev) => ({ ...prev, gender: e.target.value as "male" | "female" }))}
              className="w-full px-2.5 py-2 text-sm border border-brand-border rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
            >
              <option value="male">남자</option>
              <option value="female">여자</option>
            </select>
          </div>

          {/* 달력 양음력 선택 드롭다운 */}
          <div>
            <label className="text-xxs font-bold text-navy/55 block mb-1">달력 유형</label>
            <select
              value={inputs.calendarType}
              onChange={(e) => setInputs((prev) => ({ ...prev, calendarType: e.target.value as "solar" | "lunar" }))}
              className="w-full px-2.5 py-2 text-sm border border-brand-border rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
            >
              <option value="solar">양력</option>
              <option value="lunar">음력</option>
            </select>
          </div>

          {/* 년, 월, 일 드롭다운 레이아웃 */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xxs font-bold text-navy/55 block mb-1">년도</label>
              <select
                value={inputs.year}
                onChange={(e) => setInputs((prev) => ({ ...prev, year: parseInt(e.target.value) || 1995 }))}
                className="w-full px-2.5 py-2 text-sm border border-brand-border rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xxs font-bold text-navy/55 block mb-1">월</label>
              <select
                value={inputs.month}
                onChange={(e) => setInputs((prev) => ({ ...prev, month: parseInt(e.target.value) || 10 }))}
                className="w-full px-2.5 py-2 text-sm border border-brand-border rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xxs font-bold text-navy/55 block mb-1">일</label>
              <select
                value={inputs.day}
                onChange={(e) => setInputs((prev) => ({ ...prev, day: parseInt(e.target.value) || 24 }))}
                className="w-full px-2.5 py-2 text-sm border border-brand-border rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}일</option>
                ))}
              </select>
            </div>
          </div>

          {/* 태어난 시간 드롭다운 */}
          <div>
            <label className="text-xxs font-bold text-navy/55 block mb-1">태어난 시간</label>
            <select
              value={inputs.birthTime}
              onChange={(e) => setInputs((prev) => ({ ...prev, birthTime: e.target.value }))}
              className="w-full px-2.5 py-2 text-sm border border-brand-border rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
            >
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {errorMsg && (
            <p className="text-xxs font-bold text-red-500 bg-red-50 border border-red-150 p-2.5 rounded-lg">
              ⚠️ {errorMsg}
            </p>
          )}

          <Button type="submit" variant="primary" fullWidth disabled={isSubmitting} className="font-bold min-h-[44px]">
            {isSubmitting ? (
              <span className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>정교한 사주 분석 분석중...</span>
              </span>
            ) : (
              TYPE_METAS[serviceType]?.buttonText || "운세보기"
            )}
          </Button>
        </form>
      </div>

      {/* 2. 출력 및 실시간 명식 피드백부 (7열) */}
      <div className="lg:col-span-7 bg-surface border border-brand-border rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <h2 className="text-base font-bold text-navy">만세력 명식 분석 (샘플)</h2>
          <span className="text-xxs text-navy/55 font-semibold">
            {inputs.year}년 {inputs.month}월 {inputs.day}일{" "}
            {inputs.birthTime === "none" ? "시간 모름" : TIME_OPTIONS.find((t) => t.value === inputs.birthTime)?.label.split(" ")[0]} ({inputs.calendarType === "solar" ? "양력" : "음력"})
          </span>
        </div>

        {/* 4주 팔자 표 */}
        {chart ? (
          <div className="grid grid-cols-4 gap-2 text-center">
            {renderPillarCard(chart.pillars.hour, "시주 (Hour)", chart.tenGods.hour)}
            {renderPillarCard(chart.pillars.day, "일주 (Day)", { stem: "일간 (나)", branch: chart.tenGods.day.branch })}
            {renderPillarCard(chart.pillars.month, "월주 (Month)", chart.tenGods.month)}
            {renderPillarCard(chart.pillars.year, "년주 (Year)", chart.tenGods.year)}
          </div>
        ) : (
          <div className="text-center py-12 text-xxs text-navy/40">데이터 로딩 중...</div>
        )}

        {/* 오행 그래프 */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-navy/70 block">내 사주 속 오행 오각형 균형</span>
          {(["wood", "fire", "earth", "metal", "water"] as const).map((el) => {
            const style = ELEMENT_STYLES[el];
            const count = dist[el];
            const pct = Math.round((count / total) * 100);
            return (
              <div key={el} className="flex items-center space-x-2 text-xxs font-semibold">
                <span className={`w-14 text-left ${style.text}`}>{style.nameKo} ({count})</span>
                <span className="w-8 text-navy/60 font-mono text-right">{pct}%</span>
                <div className="flex-grow bg-brand-border h-2 rounded-full overflow-hidden">
                  <div className={`${style.progressColor} h-full transition-all duration-300`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 동적 AI 조언 */}
        <div className="bg-cream/40 border border-brand-border/60 p-4 rounded-xl flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-gold mt-0.5 shrink-0" />
          <p className="text-xxs text-navy/75 leading-relaxed">
            {chart ? getDynamicAdvice() : "조언 생성 중..."}
          </p>
        </div>
      </div>

    </div>
  );
}
