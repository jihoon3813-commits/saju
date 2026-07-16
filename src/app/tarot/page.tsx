"use client";

import React, { useState } from "react";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Moon,
  Flame,
  GlassWater,
  Sword,
  Coins,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  Layers,
  Heart,
  Calendar,
  ArrowRightLeft,
  ArrowDownToLine
} from "lucide-react";
import { TAROT_SPREADS, SpreadConfig, TarotCard } from "@/lib/tarot/tarotEngine";
import { runTarotReadingAction, TarotReadingResponse } from "@/app/actions/tarot";

export default function TarotPage() {
  const breadcrumbs = [{ name: "AI 신비 타로", path: "/tarot" }];

  const [selectedSpreadId, setSelectedSpreadId] = useState<string>("today");
  const [question, setQuestion] = useState<string>("");
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [readingResult, setReadingResult] = useState<TarotReadingResponse | null>(null);

  const currentSpread: SpreadConfig = TAROT_SPREADS[selectedSpreadId] || TAROT_SPREADS.today;

  // 카드 덱 선택 제어
  const handleCardClick = (cardIndex: number) => {
    if (readingResult) return; // 결과가 나온 뒤엔 재선택 차단
    
    // 이미 선택된 카드면 해제
    if (selectedCards.includes(cardIndex)) {
      setSelectedCards(selectedCards.filter((id) => id !== cardIndex));
      return;
    }

    // 최대 선택 개수 제한 도달 여부 확인
    if (selectedCards.length >= currentSpread.cardCount) {
      setError(`이 스프레드는 최대 ${currentSpread.cardCount}장의 카드만 사용합니다.`);
      return;
    }

    setSelectedCards([...selectedCards, cardIndex]);
    setError(null);
  };

  // 타로 해석 신청 실행
  const handleStartReading = async () => {
    if (!question || question.trim().length < 3) {
      setError("해석받고 싶으신 구체적인 질문을 최소 3자 이상 입력해 주세요.");
      return;
    }
    if (selectedCards.length < currentSpread.cardCount) {
      setError(`카드를 총 ${currentSpread.cardCount}장 선택하셔야 합니다. (현재 ${selectedCards.length}장 선택됨)`);
      return;
    }

    setLoading(true);
    setError(null);

    const response = await runTarotReadingAction(selectedSpreadId, question, selectedCards);
    setLoading(false);

    if (response.success) {
      setReadingResult(response);
    } else {
      setError(response.error || "해석 도중 에러가 발생했습니다.");
    }
  };

  // 초기화 및 다시 뽑기
  const handleReset = () => {
    setSelectedCards([]);
    setQuestion("");
    setReadingResult(null);
    setError(null);
  };

  // 타로 슈트별 아이콘 및 테마 색상 반환
  const getSuitMeta = (suit: string | null, isMajor: boolean) => {
    if (isMajor) {
      return {
        icon: <Sparkles className="w-6 h-6 text-amber-400" />,
        bg: "from-indigo-950 via-purple-900 to-slate-900",
        label: "메이저 아르카나",
        border: "border-amber-400/50"
      };
    }
    switch (suit) {
      case "wands":
        return {
          icon: <Flame className="w-6 h-6 text-red-400 animate-pulse" />,
          bg: "from-amber-950 via-red-950 to-slate-900",
          label: "완즈 (지혜/열정)",
          border: "border-red-400/40"
        };
      case "cups":
        return {
          icon: <GlassWater className="w-6 h-6 text-blue-400" />,
          bg: "from-sky-950 via-indigo-950 to-slate-900",
          label: "컵 (감정/인간관계)",
          border: "border-blue-400/40"
        };
      case "swords":
        return {
          icon: <Sword className="w-6 h-6 text-slate-300" />,
          bg: "from-slate-950 via-zinc-900 to-neutral-900",
          label: "소드 (이성/갈등)",
          border: "border-slate-400/30"
        };
      case "pentacles":
        return {
          icon: <Coins className="w-6 h-6 text-emerald-400" />,
          bg: "from-emerald-950 via-teal-950 to-slate-900",
          label: "펜타클 (재물/물질)",
          border: "border-emerald-400/40"
        };
      default:
        return {
          icon: <Sparkles className="w-6 h-6 text-yellow-400" />,
          bg: "from-slate-900 to-slate-950",
          label: "마이너",
          border: "border-yellow-400/30"
        };
    }
  };

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center space-y-2 py-6">
          <span className="p-3 bg-gold/10 text-gold rounded-full inline-block border border-gold/20 mb-2 shadow-sm">
            <Moon className="w-6 h-6 text-gold animate-pulse" />
          </span>
          <h1 className="text-3xl font-extrabold text-navy tracking-tight">AI 신비 타로 운세</h1>
          <p className="text-sm text-navy/60 max-w-md mx-auto leading-relaxed font-medium">
            마음을 차분히 가라앉히고 고민 중인 한 가지 구체적인 질문을 정한 뒤 아래 타로 카드 중 끌리는 카드를 선택해 주세요.
          </p>
        </div>

        {/* 1. 설정 및 입력 영역 */}
        {!readingResult && (
          <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-md space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-navy flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-gold" />
                <span>어떤 고민이 있으신가요? (구체적으로 작성 시 해석 품질이 향상됩니다)</span>
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="예: 이번 주 이직 제안을 수락하는 것이 저의 금전 흐름에 긍정적일까요?"
                className="w-full px-4 py-3 text-sm text-navy border border-brand-border rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-gold/60 transition-all font-semibold"
              />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-navy/60 block">스프레드 종류 선택</span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(TAROT_SPREADS).map((spread) => {
                  const isActive = selectedSpreadId === spread.id;
                  return (
                    <button
                      key={spread.id}
                      onClick={() => {
                        setSelectedSpreadId(spread.id);
                        setSelectedCards([]);
                        setError(null);
                      }}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                        isActive
                          ? "border-gold bg-gold/5 text-gold shadow-sm shadow-gold/5"
                          : "border-brand-border text-navy/55 hover:bg-cream/40 hover:text-navy"
                      }`}
                    >
                      <span>{spread.name}</span>
                      <span className="text-[10px] text-navy/40 font-mono">({spread.cardCount} Cards)</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. 카드 배치 및 셔플 영역 */}
        {!readingResult && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-sm font-semibold text-navy/70">
                아래 78장의 카드 중 <span className="text-gold font-bold">{currentSpread.cardCount}장</span>을 차례대로 탭하세요.
              </h3>
              <span className="text-xs bg-white border border-brand-border px-3 py-1 rounded-full text-navy/65">
                선택됨: <span className="font-mono text-gold font-bold">{selectedCards.length}</span> / {currentSpread.cardCount}
              </span>
            </div>

            {/* 카드 덱 셔플링 그리드 */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-3 bg-cream/10 p-6 rounded-3xl border border-brand-border/60 max-h-[340px] overflow-y-auto custom-scrollbar">
              {Array.from({ length: 78 }).map((_, idx) => {
                const isSelected = selectedCards.includes(idx);
                const orderSelected = selectedCards.indexOf(idx) + 1;
                return (
                  <div
                    key={idx}
                    onClick={() => handleCardClick(idx)}
                    className={`group relative cursor-pointer aspect-[2/3.3] rounded-xl p-1.5 flex flex-col items-center justify-between text-center transition-all select-none border ${
                      isSelected
                        ? "bg-gold/15 border-gold shadow-md scale-95"
                        : "bg-white border-brand-border hover:border-gold/50 hover:-translate-y-1 hover:shadow-sm"
                    }`}
                  >
                    {/* 카드 장식 뒷면 */}
                    <div className="absolute inset-0.5 border border-gold/10 rounded-lg pointer-events-none flex flex-col justify-between p-1.5">
                      <div className="w-full flex justify-between">
                        <span className="text-[7px] text-gold/30">D&F</span>
                        <span className="text-[7px] text-gold/30">TAROT</span>
                      </div>
                      <div className="self-center">
                        <Moon className={`w-4 h-4 ${isSelected ? "text-gold animate-spin-slow" : "text-gold/25 group-hover:text-gold/45"}`} />
                      </div>
                      <span className="text-[7px] text-gold/30 tracking-widest uppercase">Mystery</span>
                    </div>

                    {/* 선택 순서 배지 */}
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gold text-white rounded-full flex items-center justify-center text-[10px] font-black z-20 shadow-md">
                        {orderSelected}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 에러 피드백 */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-600 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* CTA 버튼 */}
            <div className="flex justify-center pt-4">
              <Button
                variant="primary"
                onClick={handleStartReading}
                disabled={loading || selectedCards.length < currentSpread.cardCount}
                className="w-full sm:w-64 font-bold text-sm min-h-[46px] rounded-xl shadow-md bg-gold hover:bg-gold/95 text-white disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>무의식 주파수 분석 중...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>무의식 타로 분석 실행</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 3. 분석 결과 전시실 */}
        {readingResult && readingResult.success && readingResult.result && (
          <div className="space-y-8 animate-fade-in">
            {/* 상단 탭 헤더 및 질문 */}
            <div className="bg-white border border-brand-border p-6 rounded-3xl text-center space-y-3 shadow-md">
              <span className="text-[10px] text-gold font-bold tracking-widest uppercase">TAROT COUNSELING REPORT</span>
              <h2 className="text-xl font-bold text-navy">“ {question} ”</h2>
              <div className="text-xs text-navy/60">
                선택된 스프레드: <span className="text-navy font-semibold">{currentSpread.name} ({currentSpread.cardCount}장)</span>
              </div>
            </div>

            {/* 뽑힌 카드들의 물리적 구조 해설 (앞면 렌더링) */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-extrabold text-gold tracking-widest">Drawn Tarot Cards</h3>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 justify-center">
                {readingResult.drawn.map((item, idx) => {
                  const posName = currentSpread.positions[idx] || `${idx + 1}번 카드`;
                  const meta = getSuitMeta(item.card.suit, item.card.arcana === "major");
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-brand-border rounded-3xl p-5 flex flex-col space-y-4 shadow-sm relative overflow-hidden"
                    >
                      <div className="text-center bg-cream/50 py-1.5 px-3 rounded-full text-[10px] text-navy/70 border border-brand-border font-bold">
                        위치: {posName}
                      </div>

                      {/* CSS 기반 다이나믹 타로 카드 앞면 디자인 */}
                      <div className={`aspect-[2/3.4] rounded-2xl p-4 bg-gradient-to-br ${meta.bg} border-2 ${meta.border} shadow-2xl relative flex flex-col justify-between overflow-hidden`}>
                        {/* 카드 역방향 텍스트 회전 가이드 */}
                        <div className={`w-full h-full flex flex-col justify-between transition-transform duration-500 ${item.isReversed ? "rotate-180" : ""}`}>
                          {/* 상단 기호 */}
                          <div className="flex justify-between items-center text-[10px] text-gold/60 font-mono">
                            <span>No. {item.card.id}</span>
                            <span>{item.card.arcana === "major" ? "MAJOR" : "MINOR"}</span>
                          </div>

                          {/* 메인 아이콘 장식 */}
                          <div className="self-center p-4 bg-slate-900/60 rounded-full border border-gold/15 backdrop-blur-xs flex items-center justify-center">
                            {meta.icon}
                          </div>

                          {/* 하단 카드 정보 지표 */}
                          <div className="space-y-0.5 text-center">
                            <span className="text-[9px] text-gold/50 font-bold uppercase tracking-wider block">{meta.label}</span>
                            <span className="text-[11px] text-slate-100 font-extrabold tracking-tight block">
                              {item.card.name}
                            </span>
                            <span className="text-[9px] text-emerald-400 font-extrabold inline-block mt-0.5">
                              {item.isReversed ? "역방향 (Reversed)" : "정방향 (Upright)"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 카드 의미 해설 */}
                      <div className="space-y-1 text-center bg-cream/25 p-3 rounded-xl border border-brand-border/40">
                        <p className="text-[10px] text-navy/70 leading-relaxed font-semibold">
                          {item.isReversed ? item.card.meaningRev : item.card.meaningUp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI 심층 상담 보고서 본문 */}
            <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] text-gold font-bold tracking-widest uppercase">COUNSELOR'S SUMMARY</span>
                <h3 className="text-lg font-bold text-navy leading-snug">
                  {readingResult.result.summary}
                </h3>
              </div>

              {readingResult.result.sections.map((sect, sIdx) => (
                <div key={sIdx} className="space-y-4 border-t border-brand-border pt-6">
                  <h4 className="text-sm font-bold text-gold flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block"></span>
                    <span>{sect.title}</span>
                  </h4>
                  <p className="text-xs text-navy/60 leading-relaxed font-semibold">
                    {sect.summary}
                  </p>

                  <div className="space-y-3 pl-2.5">
                    {sect.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-xs text-navy/80 leading-relaxed font-medium">
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* 긍정적 조언 & 주의 지표 */}
                  <div className="grid gap-3 sm:grid-cols-2 pt-2 text-[11px]">
                    {sect.positiveSignals && sect.positiveSignals.length > 0 && (
                      <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl space-y-1.5">
                        <span className="font-bold text-emerald-600">💡 긍정적 조언 / 기회 지표</span>
                        <ul className="list-disc list-inside space-y-1 text-navy/85 font-medium pl-1">
                          {sect.positiveSignals.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}
                    {sect.cautionSignals && sect.cautionSignals.length > 0 && (
                      <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl space-y-1.5">
                        <span className="font-bold text-rose-600">⚠️ 조심해야 할 심리적 태도</span>
                        <ul className="list-disc list-inside space-y-1 text-navy/85 font-medium pl-1">
                          {sect.cautionSignals.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* 구체적 행동 강령 */}
                  {sect.actions && sect.actions.length > 0 && (
                    <div className="bg-indigo-50/75 border border-indigo-100 p-4 rounded-xl space-y-2 text-[11px]">
                      <span className="font-bold text-indigo-600">🎯 오늘 행동 가이드라인</span>
                      <ul className="list-decimal list-inside space-y-1.5 text-navy/90 font-medium pl-1">
                        {sect.actions.map((act, i) => <li key={i}>{act}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 재설정 버튼 */}
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full sm:w-64 font-bold text-xs py-3 border-slate-800 text-slate-300 hover:bg-slate-900 rounded-xl"
              >
                <span>고민 해결 완료 / 새로운 타로 뽑기</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
