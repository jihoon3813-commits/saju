"use client";

import React, { useState } from "react";

interface Highlight {
  title: string;
  value: string;
  evidenceCodes: string[];
}

interface Section {
  id: string;
  title: string;
  summary: string;
  paragraphs: string[];
  evidenceCodes: string[];
  positiveSignals?: string[];
  cautionSignals?: string[];
  actions?: string[];
}

interface TimelineEntry {
  period: string;
  intensity: number;
  opportunity: string;
  caution: string;
  action: string;
  evidenceCodes: string[];
}

interface Uncertainty {
  code: string;
  message: string;
  affectedSections: string[];
}

interface PremiumResultClientProps {
  orderId: string;
  productTitle: string;
  productType: string;
  interpretation: {
    summary: string;
    highlights: Highlight[];
    sections: Section[];
    timeline: TimelineEntry[];
    uncertainty: Uncertainty[];
    safetyFlags?: string[];
    generatedAt: string;
  };
  chart: any;
  chart2?: any;
}

export default function PremiumResultClient({
  orderId,
  productTitle,
  productType,
  interpretation,
  chart,
  chart2
}: PremiumResultClientProps) {
  const { summary, highlights, sections, timeline, uncertainty, generatedAt } = interpretation;
  const [activeTab, setActiveTab] = useState(sections[0]?.id || "");

  // 오행별 색상 매핑 헬퍼
  const getElementColorClass = (hanja: string): { text: string; bg: string; border: string; name: string } => {
    const wood = ["甲", "乙", "寅", "卯"];
    const fire = ["丙", "丁", "巳", "午"];
    const earth = ["戊", "己", "辰", "戌", "丑", "未"];
    const metal = ["庚", "辛", "申", "酉"];
    const water = ["壬", "癸", "亥", "子"];

    if (wood.includes(hanja)) return { text: "text-emerald-400", bg: "bg-emerald-950/20", border: "border-emerald-900/60", name: "목(木)" };
    if (fire.includes(hanja)) return { text: "text-rose-400", bg: "bg-rose-950/20", border: "border-rose-900/60", name: "화(火)" };
    if (earth.includes(hanja)) return { text: "text-amber-400", bg: "bg-amber-950/20", border: "border-amber-900/60", name: "토(土)" };
    if (metal.includes(hanja)) return { text: "text-slate-300", bg: "bg-slate-800/30", border: "border-slate-700/60", name: "금(金)" };
    if (water.includes(hanja)) return { text: "text-sky-400", bg: "bg-sky-950/20", border: "border-sky-900/60", name: "수(水)" };

    return { text: "text-slate-400", bg: "bg-slate-900/20", border: "border-slate-800", name: "기타" };
  };

  const renderPillars = (c: any, titleSuffix: string = "") => {
    if (!c || !c.pillars) return null;
    const { year, month, day, hour } = c.pillars;

    const pillarItems = [
      { name: "시주", stem: hour?.stem || "시", branch: hour?.branch || "상", label: hour ? "" : "(미상)" },
      { name: "일주", stem: day.stem, branch: day.branch, label: "일간" },
      { name: "월주", stem: month.stem, branch: month.branch, label: "" },
      { name: "년주", stem: year.stem, branch: year.branch, label: "" }
    ];

    return (
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-md">
        <h4 className="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2">
          <span>☯</span> {c.normalizedInput.alias}의 사주 원국 명식표 {titleSuffix}
        </h4>
        <div className="grid grid-cols-4 gap-3 text-center">
          {pillarItems.map((item, idx) => {
            const stemColor = getElementColorClass(item.stem);
            const branchColor = getElementColorClass(item.branch);
            return (
              <div key={idx} className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold block">{item.name}</span>
                {/* 천간 */}
                <div className={`p-3 rounded-xl border ${stemColor.bg} ${stemColor.border} transition hover:scale-105 duration-300`}>
                  <span className={`text-2xl font-extrabold block ${stemColor.text}`}>{item.stem}</span>
                  <span className="text-[9px] text-slate-400 block mt-1">{stemColor.name}</span>
                </div>
                {/* 지지 */}
                <div className={`p-3 rounded-xl border ${branchColor.bg} ${branchColor.border} transition hover:scale-105 duration-300`}>
                  <span className={`text-2xl font-extrabold block ${branchColor.text}`}>{item.branch}</span>
                  <span className="text-[9px] text-slate-400 block mt-1">{branchColor.name}</span>
                </div>
                {item.label && (
                  <span className="text-[9px] text-indigo-400 font-semibold block">{item.label}</span>
                )}
                {item.label === "" && item.label !== undefined && (
                  <span className="h-3 block"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const activeSection = sections.find((s) => s.id === activeTab) || sections[0];

  return (
    <div className="space-y-8">
      {/* 리포트 상단 요약 카드 */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="space-y-3">
          <span className="text-indigo-400 font-bold text-xs tracking-wider uppercase bg-indigo-950 border border-indigo-900 px-3 py-1 rounded-full">
            {productTitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
            "{summary}"
          </h2>
          <p className="text-slate-400 text-xs font-mono">
            분석 완료 고유 주문번호: {orderId} | 발행일시: {new Date(generatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* 명식표 매핑 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderPillars(chart)}
        {chart2 ? renderPillars(chart2, "(상대방)") : (
          <div className="bg-slate-900/20 p-6 rounded-3xl border border-slate-950 flex flex-col justify-center items-center text-center">
            <span className="text-4xl mb-2">⚖️</span>
            <h5 className="font-bold text-slate-400 text-sm">오행 균형 지표</h5>
            <p className="text-xs text-slate-500 mt-2 max-w-xs">
              본인 사주 원국의 목·화·토·금·수 오행 쏠림 강도를 계산해 보완이 필요한 용희신 기운을 핵심 분석에 대입합니다.
            </p>
          </div>
        )}
      </div>

      {/* 하이라이트 지표 카드 그리드 */}
      {highlights && highlights.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {highlights.map((hl, idx) => (
            <div
              key={idx}
              className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-sm flex justify-between items-center group hover:border-indigo-500/30 transition-all duration-300"
            >
              <div>
                <span className="text-xs text-slate-400 font-medium block">{hl.title}</span>
                <span className="text-base font-extrabold text-indigo-400 mt-1 block group-hover:text-indigo-300">
                  {hl.value}
                </span>
              </div>
              <div className="flex gap-1">
                {hl.evidenceCodes.slice(0, 2).map((code) => (
                  <span
                    key={code}
                    className="text-[9px] font-mono font-bold bg-slate-950 text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 메인 대규모 2단 해석 렌더러 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* 왼쪽 목차 탭 사이드바 */}
        <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-1.5 sticky top-6 max-h-[80vh] overflow-y-auto">
          <span className="text-xs font-bold text-slate-500 px-2 block mb-3 uppercase tracking-wider">
            📜 리포트 목차 ({sections.length}대 분야)
          </span>
          {sections.map((sect) => (
            <button
              key={sect.id}
              onClick={() => setActiveTab(sect.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                activeTab === sect.id
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-950"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <span className="truncate mr-2">{sect.title}</span>
              {activeTab === sect.id && <span className="text-[10px]">▶</span>}
            </button>
          ))}
        </div>

        {/* 오른쪽 상세 해석 본문 */}
        {activeSection && (
          <div className="lg:col-span-3 space-y-6 bg-slate-900/20 border border-slate-900/80 rounded-3xl p-6 sm:p-8">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded">
                  상세 분석
                </span>
                {activeSection.evidenceCodes.map((code) => (
                  <span
                    key={code}
                    className="text-[9px] font-mono bg-slate-950 text-slate-500 border border-slate-900 px-1.5 py-0.5 rounded"
                  >
                    {code}
                  </span>
                ))}
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100">{activeSection.title}</h3>
              <p className="text-sm text-indigo-300 italic font-medium mt-2">
                "{activeSection.summary}"
              </p>
            </div>

            {/* 본문 문단 배열 */}
            <div className="space-y-4 text-slate-300 leading-relaxed text-sm pt-4 border-t border-slate-900">
              {activeSection.paragraphs.map((para, idx) => (
                <p key={idx} className="indent-2">
                  {para}
                </p>
              ))}
            </div>

            {/* 길흉 카드 및 행동 리스트 (있는 경우) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-900">
              {/* 긍정 기류 */}
              {activeSection.positiveSignals && activeSection.positiveSignals.length > 0 && (
                <div className="bg-emerald-950/10 p-5 rounded-2xl border border-emerald-900/30 space-y-3">
                  <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>🟢</span> 긍정적 기운 지표
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {activeSection.positiveSignals.map((sig, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-emerald-500 mr-2">•</span>
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 주의 기류 */}
              {activeSection.cautionSignals && activeSection.cautionSignals.length > 0 && (
                <div className="bg-rose-950/10 p-5 rounded-2xl border border-rose-900/30 space-y-3">
                  <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <span>🔴</span> 주의가 필요한 기류
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {activeSection.cautionSignals.map((sig, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-rose-500 mr-2">•</span>
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 실천 행동 과제 체크리스트 */}
            {activeSection.actions && activeSection.actions.length > 0 && (
              <div className="bg-indigo-950/10 p-5 rounded-2xl border border-indigo-900/30 space-y-4">
                <h5 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <span>🚀</span> 이 분야 개운(開運) 실천 체크리스트
                </h5>
                <div className="space-y-3">
                  {activeSection.actions.map((act, i) => (
                    <label key={i} className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 hover:text-slate-200">
                      <input type="checkbox" className="mt-0.5 text-indigo-600 focus:ring-0 rounded" />
                      <span>{act}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 시간선 / 대운 흐름 */}
      {timeline && timeline.length > 0 && (
        <div className="bg-slate-900/30 p-6 sm:p-8 rounded-3xl border border-slate-800/80 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100">📅 인생 대운(大運) 타임라인</h3>
            <p className="text-xs text-slate-500 mt-1">대운 연대표 주기에 따른 주요 기회와 주의 지표 조망</p>
          </div>

          <div className="space-y-4">
            {timeline.map((time, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-start gap-4 hover:border-slate-800 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-indigo-400">{time.period}</span>
                    <span className="text-[10px] text-slate-500">영향 강도 {time.intensity}/5</span>
                  </div>
                  <p className="text-xs text-slate-300"><span className="text-emerald-400 font-bold">기회:</span> {time.opportunity}</p>
                  <p className="text-xs text-slate-300"><span className="text-rose-400 font-bold">경계:</span> {time.caution}</p>
                  <p className="text-xs text-indigo-300"><span className="font-bold">행동지침:</span> {time.action}</p>
                </div>
                <div className="flex gap-1 self-end sm:self-auto">
                  {time.evidenceCodes.slice(0, 2).map((code) => (
                    <span
                      key={code}
                      className="text-[9px] font-mono bg-slate-900 text-slate-600 px-1.5 py-0.5 rounded border border-slate-800"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 시주 미상 등 불확실성 경고 카드 */}
      {uncertainty && uncertainty.length > 0 && (
        <div className="bg-amber-950/10 p-5 rounded-2xl border border-amber-900/30 space-y-3">
          <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <span>⚠️</span> 불확실 요소 분석 안내
          </h5>
          <div className="space-y-2">
            {uncertainty.map((u, i) => (
              <p key={i} className="text-xs text-slate-300 leading-relaxed">
                [{u.code}] {u.message} (관련 영향 분야: <span className="font-semibold text-amber-300">{u.affectedSections.join(", ")}</span>)
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
