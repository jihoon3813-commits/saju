"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  TrendingUp,
  Activity,
  Layers,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getManseChartAction } from "@/app/actions/manse";
import { ChartResult } from "@/lib/manse/types";

// 오행 한국어명 및 색상 매핑
const ELEMENT_MAP: Record<string, { ko: string; colorClass: string; textClass: string; bgClass: string }> = {
  wood: { ko: "목 (木)", colorClass: "border-emerald-500/30 text-emerald-400 bg-emerald-950/30", textClass: "text-emerald-400", bgClass: "bg-emerald-500/10" },
  fire: { ko: "화 (火)", colorClass: "border-rose-500/30 text-rose-400 bg-rose-950/30", textClass: "text-rose-400", bgClass: "bg-rose-500/10" },
  earth: { ko: "토 (土)", colorClass: "border-amber-600/30 text-amber-400 bg-amber-950/20", textClass: "text-amber-400", bgClass: "bg-amber-500/10" },
  metal: { ko: "금 (金)", colorClass: "border-slate-400/30 text-slate-300 bg-slate-900/60", textClass: "text-slate-300", bgClass: "bg-slate-500/10" },
  water: { ko: "수 (水)", colorClass: "border-blue-500/30 text-blue-400 bg-blue-950/30", textClass: "text-blue-400", bgClass: "bg-blue-500/10" }
};

type AnnualLuck = NonNullable<ChartResult["annualLuck"]>[number];

interface ManseDashboardClientProps {
  initialChart: ChartResult | null;
  profileId?: string;
}

export default function ManseDashboardClient({ initialChart, profileId }: ManseDashboardClientProps) {
  const router = useRouter();
  const [chart, setChart] = useState<ChartResult | null>(initialChart);
  const [loading, setLoading] = useState<boolean>(!initialChart);
  const [error, setError] = useState<string | null>(null);

  // 연도별 세운 돋보기 필터 상태
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());
  const selectedAnnualLuck: AnnualLuck | null = chart?.annualLuck?.find((al) => al.year === Number(targetYear)) || chart?.annualLuck?.[0] || null;

  // 컴포넌트 로드 시, initialChart가 없으면 로컬 스토리지의 드래프트를 활용해 기동
  useEffect(() => {
    if (chart) return;

    const loadDraftChart = async () => {
      const raw = localStorage.getItem("fortune_input_draft");
      if (!raw) {
        setError("조회할 사주 정보가 없습니다. 생년월일을 먼저 기입해 주세요.");
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        // Zod Transform 규격 정형화와 매칭
        const res = await getManseChartAction({
          guestInput: {
            alias: parsed.alias || "비회원(임시)",
            genderRuleOption: parsed.genderRuleOption || "unspecified",
            calendarType: parsed.calendarType || "solar",
            lunarLeapMonth: parsed.calendarType === "lunar" ? !!parsed.lunarLeapMonth : null,
            birthDate: parsed.birthDate,
            birthTime: parsed.unknownBirthTime ? null : parsed.birthTime,
            unknownBirthTime: !!parsed.unknownBirthTime,
            birthCountry: parsed.birthCountry || "대한민국",
            birthCity: parsed.birthCity || "서울",
            timezone: parsed.timezone || "Asia/Seoul",
            latitude: parsed.latitude ?? 37.5665,
            longitude: parsed.longitude ?? 126.9780,
            useTrueSolarTime: parsed.calculationPreference?.useTrueSolarTime ?? false,
            borderTimeRule: parsed.calculationPreference?.borderTimeRule || "23"
          }
        });

        if (res.success && res.chart) {
          setChart(res.chart);
        } else {
          setError(res.error || "만세력을 도출하는 중 연산 에러가 발생했습니다.");
        }
      } catch {
        setError("임시 데이터를 읽는 중 에러가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadDraftChart();
  }, [chart]);



  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-10 h-10 text-gold animate-spin" />
        <p className="text-xs text-navy/60 font-serif">결정론적 우주 주기율 계산 엔진 가동 중...</p>
      </div>
    );
  }

  if (error || !chart) {
    return (
      <div className="bg-surface border border-brand-border rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-navy">만세력 조회 실패</h3>
        <p className="text-xs text-navy/60 leading-relaxed">{error || "알 수 없는 계산 결함이 생겼습니다."}</p>
        <Button variant="primary" onClick={() => router.push("/fortune/input")} className="w-full">
          생년월일 입력하러 가기
        </Button>
      </div>
    );
  }

  const { normalizedInput, calculationBasis, pillars, elementsDistribution, yinYang, hiddenStems, tenGods, relations, luckCycles } = chart;

  // 천간 오행 색상 뱃지 도우미
  const getStemElementBadge = (stem: string) => {
    const STEM_ELEMENTS: Record<string, string> = {
      甲: "wood", 乙: "wood", 丙: "fire", 丁: "fire", 戊: "earth", 己: "earth", 庚: "metal", 辛: "metal", 壬: "water", 癸: "water"
    };
    const el = STEM_ELEMENTS[stem];
    const styles = ELEMENT_MAP[el] || { ko: "미상", colorClass: "border-brand-border text-navy bg-surface" };
    return (
      <div className={`border rounded px-2.5 py-1 text-center font-bold text-base shadow-sm ${styles.colorClass}`}>
        <div className="text-2xl font-serif mb-0.5">{stem}</div>
        <div className="text-[10px] font-sans opacity-80">{styles.ko.split(" ")[0]}</div>
      </div>
    );
  };

  // 지지 오행 색상 뱃지 도우미
  const getBranchElementBadge = (branch: string) => {
    const BRANCH_ELEMENTS: Record<string, string> = {
      寅: "wood", 卯: "wood", 巳: "fire", 午: "fire", 辰: "earth", 戌: "earth", 丑: "earth", 未: "earth", 申: "metal", 酉: "metal", 亥: "water", 子: "water"
    };
    const el = BRANCH_ELEMENTS[branch];
    const styles = ELEMENT_MAP[el] || { ko: "미상", colorClass: "border-brand-border text-navy bg-surface" };
    return (
      <div className={`border rounded px-2.5 py-1 text-center font-bold text-base shadow-sm ${styles.colorClass}`}>
        <div className="text-2xl font-serif mb-0.5">{branch}</div>
        <div className="text-[10px] font-sans opacity-80">{styles.ko.split(" ")[0]}</div>
      </div>
    );
  };

  // 경계선 태어남 경고 로직 (23시 자시 경계 구간 검사)
  const isBoundaryTime = () => {
    if (normalizedInput.unknownBirthTime || !normalizedInput.birthTime) return false;
    const [h] = normalizedInput.birthTime.split(":").map(Number);
    return h === 23 || h === 0;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-8">
      
      {/* AI 상세 분석 보고서 링크 배너 */}
      {profileId && (
        <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-gold mr-1" />
              <span>정밀분석 해설서 준비 완료</span>
            </span>
            <h4 className="text-sm font-bold text-white mt-1">
              AI가 작성한 장문의 정밀 운세 보고서가 대기 중입니다.
            </h4>
            <p className="text-[10px] text-slate-400">
              오행 십성 분포 분석을 넘어 성향, 조언, 행동 지표 등 자세한 설명글을 읽어보세요.
            </p>
          </div>
          <Button
            onClick={() => router.push(`/result/basic-saju/${profileId}`)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-md shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span>AI 정밀분석 해설서 읽기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* 1. 최상단: 타이틀 및 입력 기준 현황 카드 */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border/60 pb-4 gap-2">
          <div>
            <span className="text-[10px] bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              {profileId ? "보관 프로필 차트" : "비회원 가상 만세력"}
            </span>
            <h1 className="text-xl font-bold text-navy mt-1 font-serif">
              {normalizedInput.alias} 님의 사주 명조분석
            </h1>
          </div>
          <div className="text-xxs text-navy/40 font-mono">
            엔진 v{calculationBasis.engineVersion} / 기준법 {calculationBasis.ruleSetVersion}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xxs text-navy/80">
          <div className="flex items-center space-x-2 bg-[#EAE4D6]/20 p-2.5 rounded-lg border border-brand-border/40">
            <Calendar className="w-4 h-4 text-gold flex-shrink-0" />
            <div>
              <div className="text-navy/40">생년월일 (구분)</div>
              <div className="font-bold">
                {normalizedInput.birthDate} ({normalizedInput.calendarType === "solar" ? "양력" : "음력"})
                {normalizedInput.lunarLeapMonth && " [윤달]"}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#EAE4D6]/20 p-2.5 rounded-lg border border-brand-border/40">
            <Clock className="w-4 h-4 text-gold flex-shrink-0" />
            <div>
              <div className="text-navy/40">태어난 시각</div>
              <div className="font-bold">
                {normalizedInput.unknownBirthTime ? "시간 미상 (정오 가집계)" : normalizedInput.birthTime}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#EAE4D6]/20 p-2.5 rounded-lg border border-brand-border/40">
            <MapPin className="w-4.5 h-4.5 text-gold flex-shrink-0" />
            <div>
              <div className="text-navy/40">적용 타임존</div>
              <div className="font-bold truncate max-w-[120px]" title={normalizedInput.timezone}>
                {normalizedInput.timezone} (UTC{calculationBasis.utcOffsetMinutes >= 0 ? "+" : ""}{Math.round(calculationBasis.utcOffsetMinutes/60)})
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#EAE4D6]/20 p-2.5 rounded-lg border border-brand-border/40">
            <Sparkles className="w-4 h-4 text-gold flex-shrink-0" />
            <div>
              <div className="text-navy/40">진태양시 보정</div>
              <div className="font-bold">
                {calculationBasis.solarTimeAdjusted ? "적용 완료 (진태양시)" : "미적용 (표준시 기준)"}
              </div>
            </div>
          </div>
        </div>

        {/* 23시/0시 및 시간미상 경고 문구 노출 */}
        {(isBoundaryTime() || normalizedInput.unknownBirthTime) && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start space-x-2.5 text-xxs text-amber-800 leading-relaxed">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-950">조정 경계선 출생 유의 사항</span>
              {normalizedInput.unknownBirthTime ? (
                <p>
                  태어난 시간을 모르는 &apos;시간 미상&apos; 사주입니다. 시주 기둥(시간/시지) 및 시주에 의존하는 십신/지장간 조합은 가상 대조값(정오 12시)으로 산정되었으며, 실제 대운 해석 시 시주가 배제되어 다르게 풀이될 수 있습니다.
                </p>
              ) : (
                <p>
                  23시~01시 사이의 &apos;자시(子時)&apos; 경계 출생자입니다. 본 분석은 설정하신 기준({calculationBasis.dayBoundaryRule === "23" ? "야자시/조자시 분할 적용" : "23시 경계 일주 교체"}) 및 진태양시 정밀 경도차 보정을 통해 연산되었습니다. 학파 및 가치관에 따라 일간의 간지가 다르게 구성될 수 있으니 참고 바랍니다.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. 사주 4주 8자 보드 (전통 우측->좌측 배열) */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center space-x-1.5 font-serif">
          <Layers className="w-4 h-4 text-gold" />
          <span>사주 원국 (四柱八字)</span>
        </h3>

        <div className="grid grid-cols-4 gap-2.5 md:gap-4 md:max-w-2xl mx-auto">
          
          {/* 시주 기둥 (가장 왼쪽) */}
          <div className={`space-y-3 rounded-xl p-3 border text-center ${!pillars.hour ? "bg-[#EAE4D6]/10 border-brand-border/40 opacity-40" : "bg-[#EAE4D6]/30 border-brand-border/80"}`}>
            <span className="text-[10px] text-navy/40 font-bold block">시주 (時柱)</span>
            {pillars.hour ? (
              <>
                <div className="text-[10px] text-gold font-bold">{tenGods.hour?.stem}</div>
                {getStemElementBadge(pillars.hour.stem)}
                {getBranchElementBadge(pillars.hour.branch)}
                <div className="text-[10px] text-gold font-bold">{tenGods.hour?.branch}</div>
                <div className="text-[9px] text-navy/50 font-mono mt-1 border-t border-brand-border/20 pt-1 leading-tight">
                  {hiddenStems.hour?.join(", ")}
                </div>
              </>
            ) : (
              <div className="py-12 text-xxs text-navy/30 font-serif leading-relaxed">
                시간<br/>미상
              </div>
            )}
          </div>

          {/* 일주 기둥 */}
          <div className="space-y-3 bg-[#EAE4D6]/30 border border-brand-border/80 rounded-xl p-3 text-center ring-1 ring-gold/40">
            <span className="text-[10px] text-navy/40 font-bold block flex items-center justify-center space-x-0.5">
              <span className="w-1.5 h-1.5 bg-gold rounded-full inline-block animate-pulse"></span>
              <span>일주 (日柱)</span>
            </span>
            <div className="text-[10px] text-gold font-bold">본인 (日干)</div>
            {getStemElementBadge(pillars.day.stem)}
            {getBranchElementBadge(pillars.day.branch)}
            <div className="text-[10px] text-gold font-bold">{tenGods.day.branch}</div>
            <div className="text-[9px] text-navy/50 font-mono mt-1 border-t border-brand-border/20 pt-1 leading-tight">
              {hiddenStems.day.join(", ")}
            </div>
          </div>

          {/* 월주 기둥 */}
          <div className="space-y-3 bg-[#EAE4D6]/30 border border-brand-border/80 rounded-xl p-3 text-center">
            <span className="text-[10px] text-navy/40 font-bold block">월주 (月柱)</span>
            <div className="text-[10px] text-gold font-bold">{tenGods.month.stem}</div>
            {getStemElementBadge(pillars.month.stem)}
            {getBranchElementBadge(pillars.month.branch)}
            <div className="text-[10px] text-gold font-bold">{tenGods.month.branch}</div>
            <div className="text-[9px] text-navy/50 font-mono mt-1 border-t border-brand-border/20 pt-1 leading-tight">
              {hiddenStems.month.join(", ")}
            </div>
          </div>

          {/* 연주 기둥 (가장 오른쪽) */}
          <div className="space-y-3 bg-[#EAE4D6]/30 border border-brand-border/80 rounded-xl p-3 text-center">
            <span className="text-[10px] text-navy/40 font-bold block">연주 (年柱)</span>
            <div className="text-[10px] text-gold font-bold">{tenGods.year.stem}</div>
            {getStemElementBadge(pillars.year.stem)}
            {getBranchElementBadge(pillars.year.branch)}
            <div className="text-[10px] text-gold font-bold">{tenGods.year.branch}</div>
            <div className="text-[9px] text-navy/50 font-mono mt-1 border-t border-brand-border/20 pt-1 leading-tight">
              {hiddenStems.year.join(", ")}
            </div>
          </div>

        </div>
      </div>

      {/* 3. 오행 분포 및 음양 균형 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 오행 개수 시각화 */}
        <div className="bg-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center space-x-1.5 font-serif">
            <TrendingUp className="w-4 h-4 text-gold" />
            <span>원국 오행 분포 (五行)</span>
          </h3>

          <div className="space-y-3.5">
            {Object.entries(elementsDistribution).map(([elName, count]) => {
              const styles = ELEMENT_MAP[elName];
              const maxCount = pillars.hour ? 8 : 6;
              const percent = Math.round((count / maxCount) * 100);

              return (
                <div key={elName} className="space-y-1">
                  <div className="flex justify-between text-xxs font-bold text-navy">
                    <span>{styles.ko}</span>
                    <span>{count}개 ({percent}%)</span>
                  </div>
                  <div className="h-2 bg-[#EAE4D6]/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${percent}%`, 
                        backgroundColor: elName === "wood" ? "#10b981" : elName === "fire" ? "#f43f5e" : elName === "earth" ? "#d97706" : elName === "metal" ? "#64748b" : "#3b82f6" 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 음양 조화 시각화 */}
        <div className="bg-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center space-x-1.5 font-serif">
              <Activity className="w-4.5 h-4.5 text-gold" />
              <span>음양 조화 (陰陽)</span>
            </h3>
            
            <div className="py-6 flex items-center justify-between gap-4 max-w-xs mx-auto">
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold font-serif text-rose-500">{yinYang.yang}</div>
                <div className="text-[10px] text-navy/60 font-bold">양 (陽) 성향</div>
              </div>
              <div className="flex-1 h-3 bg-blue-500 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-rose-400" 
                  style={{ width: `${(yinYang.yang / (yinYang.yang + yinYang.yin)) * 100}%` }}
                ></div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold font-serif text-blue-600">{yinYang.yin}</div>
                <div className="text-[10px] text-navy/60 font-bold">음 (陰) 성향</div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-navy/60 leading-relaxed border-t border-brand-border/40 pt-4 text-center">
            {yinYang.yang > yinYang.yin 
              ? "양의 기운이 강하여 적극적이고 외향적인 행동력이 돋보이는 명조 구조입니다." 
              : yinYang.yang < yinYang.yin 
              ? "음의 기운이 발달하여 수용적이고 내면 성찰과 사유에 깊이가 있는 명조 구조입니다." 
              : "음양의 균형이 치우침 없이 조화를 이루어 감정 조율과 안정적 생활을 영위하기 좋은 균형 명조입니다."
            }
          </p>
        </div>
      </div>

      {/* 4. 합충형해파 관계 해석 결과 */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center space-x-1.5 font-serif">
          <Layers className="w-4 h-4 text-gold" />
          <span>신살 및 형충회합 (刑衝會合) 관계</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xxs">
          <div className="bg-[#EAE4D6]/20 p-4 rounded-xl border border-brand-border/40 space-y-2.5">
            <span className="font-bold text-navy block font-serif">천간합 / 천간충</span>
            <div className="flex flex-wrap gap-1.5">
              {relations.stemCombinations.map((c, i) => (
                <span key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{c}</span>
              ))}
              {relations.stemClashes.map((c, i) => (
                <span key={i} className="bg-rose-500/10 border border-rose-500/20 text-rose-700 px-2 py-0.5 rounded-full font-bold">{c}</span>
              ))}
              {relations.stemCombinations.length === 0 && relations.stemClashes.length === 0 && (
                <span className="text-navy/40 italic">성립하는 천간 관계가 없습니다.</span>
              )}
            </div>
          </div>

          <div className="bg-[#EAE4D6]/20 p-4 rounded-xl border border-brand-border/40 space-y-2.5">
            <span className="font-bold text-navy block font-serif">지지 합 (삼합·방합·육합)</span>
            <div className="flex flex-wrap gap-1.5">
              {relations.branchCombinations.map((c, i) => (
                <span key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{c}</span>
              ))}
              {relations.branchCombinations.length === 0 && (
                <span className="text-navy/40 italic">성립하는 지지 합 국(局)이 없습니다.</span>
              )}
            </div>
          </div>

          <div className="bg-[#EAE4D6]/20 p-4 rounded-xl border border-brand-border/40 space-y-2.5">
            <span className="font-bold text-navy block font-serif">지지 충 (支支衝)</span>
            <div className="flex flex-wrap gap-1.5">
              {relations.branchClashes.map((c, i) => (
                <span key={i} className="bg-rose-500/10 border border-rose-500/20 text-rose-700 px-2 py-0.5 rounded-full font-bold">{c}</span>
              ))}
              {relations.branchClashes.length === 0 && (
                <span className="text-navy/40 italic">성립하는 지지 충이 없습니다.</span>
              )}
            </div>
          </div>

          <div className="bg-[#EAE4D6]/20 p-4 rounded-xl border border-brand-border/40 space-y-2.5">
            <span className="font-bold text-navy block font-serif">형(刑) · 해(害) · 파(破)</span>
            <div className="flex flex-wrap gap-1.5">
              {relations.punishments.map((c, i) => (
                <span key={i} className="bg-amber-600/10 border border-amber-600/20 text-amber-700 px-2 py-0.5 rounded-full font-bold">{c}</span>
              ))}
              {relations.harms.map((c, i) => (
                <span key={i} className="bg-amber-600/10 border border-amber-600/20 text-amber-700 px-2 py-0.5 rounded-full font-bold">{c}</span>
              ))}
              {relations.destructions.map((c, i) => (
                <span key={i} className="bg-amber-600/10 border border-amber-600/20 text-amber-700 px-2 py-0.5 rounded-full font-bold">{c}</span>
              ))}
              {relations.punishments.length === 0 && relations.harms.length === 0 && relations.destructions.length === 0 && (
                <span className="text-navy/40 italic">성립하는 지지 형해파 관계가 없습니다.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. 대운 타임라인 (가로 스크롤 카드 구조) */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-brand-border/40 pb-3">
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center space-x-1.5 font-serif">
            <TrendingUp className="w-4 h-4 text-gold" />
            <span>인생 대운 흐름 (大運)</span>
          </h3>
          <span className="text-[10px] text-gold font-bold">
            대운수: {luckCycles.startAge} (만 나이 기준)
          </span>
        </div>

        {/* 모바일 가로 스크롤 처리뷰 */}
        <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-brand-border">
          {luckCycles.cycles.map((cycle, idx) => {
            // STEM_ELEMENTS 복사해 오행 구함
            const STEM_ELEMENTS: Record<string, string> = {
              甲: "wood", 乙: "wood", 丙: "fire", 丁: "fire", 戊: "earth", 己: "earth", 庚: "metal", 辛: "metal", 壬: "water", 癸: "water"
            };
            const elStyles = ELEMENT_MAP[STEM_ELEMENTS[cycle.stem]];
            return (
              <div 
                key={idx} 
                className="bg-[#EAE4D6]/20 border border-brand-border/60 rounded-xl p-4 min-w-[110px] text-center space-y-1.5 flex-shrink-0"
              >
                <div className="text-[10px] text-navy/40 font-bold">만 {cycle.age}세~</div>
                <div className="text-xl font-bold font-serif text-navy">
                  {cycle.stem}{cycle.branch}
                </div>
                <div className={`text-[10px] px-1.5 py-0.5 rounded font-bold inline-block ${elStyles?.colorClass}`}>
                  {cycle.tenGod}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. 연도별 세운 돋보기 뷰어 */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center space-x-1.5 font-serif">
          <Layers className="w-4 h-4 text-gold" />
          <span>연도별 세운 돋보기 (歲運)</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xxs text-navy/60 font-bold shrink-0">조회할 연도 선택:</span>
            <div className="relative">
              <select 
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="bg-surface border border-brand-border text-navy text-xxs rounded-lg px-8 py-1.5 appearance-none focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - 10 + i).map((y) => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-navy/40 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {selectedAnnualLuck && (
            <div className="bg-[#EAE4D6]/20 border border-brand-border/40 p-3 rounded-xl flex-1 flex items-center justify-between text-xxs gap-2">
              <div>
                <span className="text-navy/40 block font-sans">해당년도 간지</span>
                <strong className="text-navy text-base font-serif font-bold">
                  {selectedAnnualLuck.stem}{selectedAnnualLuck.branch} ({selectedAnnualLuck.year}년)
                </strong>
              </div>
              <div className="text-right">
                <span className="text-navy/40 block font-sans">십신 해설</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] inline-block ${ELEMENT_MAP[selectedAnnualLuck.stem ? "wood" : "wood"]?.colorClass}`}>
                  {selectedAnnualLuck.tenGod}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7. 계산 근거와 용어 설명 */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center space-x-1.5 font-serif">
          <Info className="w-4.5 h-4.5 text-gold" />
          <span>계산 근거와 용어 가이드</span>
        </h3>

        <div className="space-y-3 text-xxs text-navy/60 leading-relaxed font-sans">
          <div>
            <strong className="text-navy block mb-0.5 font-serif">절입점 기준 연/월주 산정</strong>
            <p>
              사주의 해(년)와 달(월)은 음력 1월 1일이나 양력 1월 1일로 나뉘지 않고, 태양의 황도각 절입 시점인 24절기 기준으로 교체됩니다. 따라서 2월 4~5일 입춘(立春) 절입 시각 이전에 태어난 경우 연주(띠)는 이전 해의 간지를 따르며, 매달 절입일자 시각(경칩, 청명 등) 이전 출생 여부에 따라 월주가 교체됩니다.
            </p>
          </div>
          
          <div>
            <strong className="text-navy block mb-0.5 font-serif">진태양시(眞太陽時)와 자연 시각</strong>
            <p>
              대한민국 표준시는 동경 135도를 기준으로 사용하지만 실제 국토 경도상 서울(동경 126.97도)은 태양 중천이 표준시 대비 약 32분 늦습니다. 진태양시 적용 옵션은 이 경도 차이와 함께 지구 공전 타원 궤도 이심률(균시차 EoT)을 수학적으로 반영하여 오차 없는 고유 사주 명조를 산출합니다.
            </p>
          </div>

          <div>
            <strong className="text-navy block mb-0.5 font-serif">대운수(大運數) 적용</strong>
            <p>
              대운은 10년 단위로 유입되는 환경 운의 흐름을 뜻하며, 대운수는 대운이 시작하는 한국식 만 나이(1~9)를 의미합니다. 본 만세력은 남녀성별에 따른 순행/역행 절입일과의 잔여일수 계산 방식을 적용해 대운 시작 연도를 도출합니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-brand-border/40 justify-between items-center">
          <span className="text-[10px] text-navy/40 font-mono">
            엔진 계산 도장: {calculationBasis.calculationTimestamp}
          </span>
          <Button variant="outline" onClick={() => router.push("/my/profiles")} className="text-xxs">
            내 프로필 보관함 가기
          </Button>
        </div>
      </div>

    </div>
  );
}
