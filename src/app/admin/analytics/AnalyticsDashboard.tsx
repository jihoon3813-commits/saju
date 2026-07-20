"use client";

import React, { useState, useTransition } from "react";
import { 
  BarChart3, 
  Users, 
  Eye, 
  FileText, 
  Search, 
  Trash2, 
  Globe, 
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock
} from "lucide-react";
import { clearAnalyticsLogs } from "@/app/actions/analytics";

interface SerializedLog {
  id: string;
  eventName: string;
  pageType: string;
  sessionId: string;
  properties: string;
  createdAt: number;
}

interface AnalyticsDashboardProps {
  initialLogs: SerializedLog[];
}

export function AnalyticsDashboard({ initialLogs }: AnalyticsDashboardProps) {
  const [logs, setLogs] = useState<SerializedLog[]>(initialLogs);
  const [filterType, setFilterType] = useState<"today" | "yesterday" | "week" | "month" | "last_month" | "custom">("today");
  
  // Custom date picker states
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Search state for referrer table
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // 1. 날짜 필터링 로직 KST 기준 설정
  const getFilteredLogs = () => {
    const now = new Date();
    
    const getStartOfDay = (d: Date) => {
      const res = new Date(d);
      res.setHours(0, 0, 0, 0);
      return res;
    };
    
    const getEndOfDay = (d: Date) => {
      const res = new Date(d);
      res.setHours(23, 59, 59, 999);
      return res;
    };

    let startBound = new Date(0);
    let endBound = new Date();

    if (filterType === "today") {
      startBound = getStartOfDay(now);
      endBound = getEndOfDay(now);
    } else if (filterType === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      startBound = getStartOfDay(yesterday);
      endBound = getEndOfDay(yesterday);
    } else if (filterType === "week") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      startBound = getStartOfDay(sevenDaysAgo);
      endBound = getEndOfDay(now);
    } else if (filterType === "month") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startBound = getStartOfDay(firstDayOfMonth);
      endBound = getEndOfDay(now);
    } else if (filterType === "last_month") {
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      startBound = getStartOfDay(firstDayOfLastMonth);
      endBound = getEndOfDay(lastDayOfLastMonth);
    } else if (filterType === "custom") {
      if (startDate) startBound = getStartOfDay(new Date(startDate));
      if (endDate) endBound = getEndOfDay(new Date(endDate));
    }

    return logs.filter(log => log.createdAt >= startBound.getTime() && log.createdAt <= endBound.getTime());
  };

  const filteredLogs = getFilteredLogs();

  // 2. 통계 지표 계산
  const totalPageViews = filteredLogs.filter(l => l.eventName === "page_view").length;
  
  // Unique Sessions
  const uniqueSessions = new Set(filteredLogs.map(l => l.sessionId)).size;

  // Extract IPs and Referrers from properties
  const logProperties = filteredLogs.map(l => {
    let ip = "-";
    let referrer = "direct";
    let url = "-";
    try {
      const props = JSON.parse(l.properties);
      ip = props.ip || "-";
      referrer = props.referrer || "direct";
      url = props.url || "-";
    } catch (e) {}
    return { ...l, ip, referrer, url };
  });

  // Unique IPs
  const uniqueIps = new Set(logProperties.map(l => l.ip).filter(ip => ip !== "-")).size;

  // Saju Info Input Count (eventName === "input_complete" && pageType !== "compatibility")
  const sajuInputCount = filteredLogs.filter(l => l.eventName === "input_complete").length;

  // 3. 서비스별 이용횟수
  const serviceCounts = {
    pyungsaeng: { name: "평생 사주 종합", count: 0, color: "bg-emerald-500" },
    daewun: { name: "10대 대운 흐름", count: 0, color: "bg-blue-500" },
    tojung: { name: "신년 신수 비결", count: 0, color: "bg-red-500" },
    monthly: { name: "월간 종합 운세", count: 0, color: "bg-amber-500" },
    today: { name: "오늘의 일진 상세", count: 0, color: "bg-purple-500" },
    manse: { name: "무료 만세력 조회", count: 0, color: "bg-slate-500" },
    compatibility: { name: "맞춤형 궁합", count: 0, color: "bg-pink-500" },
    tarot: { name: "AI 신비 타로", count: 0, color: "bg-indigo-500" },
    dreams: { name: "CMS 통합 꿈해몽", count: 0, color: "bg-teal-500" }
  };

  filteredLogs.forEach(l => {
    const type = l.pageType;
    if (type === "pyungsaeng") serviceCounts.pyungsaeng.count++;
    else if (type === "daewun") serviceCounts.daewun.count++;
    else if (type === "tojung") serviceCounts.tojung.count++;
    else if (type === "monthly") serviceCounts.monthly.count++;
    else if (type === "today") serviceCounts.today.count++;
    else if (type === "manse") serviceCounts.manse.count++;
    else if (type === "compatibility") serviceCounts.compatibility.count++;
    else if (type === "tarot") serviceCounts.tarot.count++;
    else if (type === "dreams") serviceCounts.dreams.count++;
  });

  const serviceData = Object.values(serviceCounts).sort((a, b) => b.count - a.count);
  const maxServiceCount = Math.max(...serviceData.map(s => s.count), 1);

  // 4. 날짜별 유입 경로 및 IP 정보
  const entryRoutes = logProperties
    .filter(l => l.eventName === "page_view")
    .map(l => {
      // 레퍼러 가독성 리팩토링 (내부 이동 정제)
      let displayReferrer = l.referrer;
      let isInternal = false;
      if (
        l.referrer.includes("localhost") || 
        l.referrer.includes("calm-quail-308") || 
        l.referrer.startsWith("/")
      ) {
        isInternal = true;
        try {
          const refUrl = new URL(l.referrer);
          displayReferrer = `내부이동 (${refUrl.pathname || "/"})`;
        } catch(e) {
          displayReferrer = "내부 이동";
        }
      }
      return {
        id: l.id,
        createdAt: l.createdAt,
        ip: l.ip,
        rawReferrer: l.referrer,
        referrer: displayReferrer,
        isInternal,
        pageType: l.pageType,
        url: l.url
      };
    })
    .filter(route => {
      if (!searchTerm) return true;
      const lower = searchTerm.toLowerCase();
      return (
        route.ip.toLowerCase().includes(lower) ||
        route.rawReferrer.toLowerCase().includes(lower) ||
        route.pageType.toLowerCase().includes(lower)
      );
    });

  // 데이터 초기화 동작
  const handleClearLogs = () => {
    if (!confirm("정말로 모든 방문 및 이용 통계 로그 데이터를 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
      return;
    }
    startTransition(async () => {
      const res = await clearAnalyticsLogs();
      if (res.success) {
        setLogs([]);
        alert("모든 통계 데이터가 초기화되었습니다.");
      } else {
        alert("데이터 초기화에 실패했습니다: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-8 font-semibold text-navy">
      {/* 헤더 및 데이터 초기화 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-border/60 pb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-pink-50 border border-pink-100 text-pink-600 rounded-2xl shadow-xxs">
            <BarChart3 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-navy">종합 행동 분석 및 유입 통계</h1>
            <p className="text-sm text-navy/60 mt-1">
              개인정보가 보호된 익명 로그를 활용하여 사이트 방문자 수, 서비스 이용률, 상세 유입 채널을 다각도로 분석합니다.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearLogs}
          disabled={isPending}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all shadow-xxs disabled:opacity-50 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>{isPending ? "데이터 초기화 중..." : "모든 로그 데이터 초기화"}</span>
        </button>
      </div>

      {/* 필터 툴바 */}
      <div className="bg-white border border-brand-border rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gold" />
            <span className="text-sm font-bold text-navy/80">분석 대상 기간 지정</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { type: "today", label: "당일" },
              { type: "yesterday", label: "전일" },
              { type: "week", label: "일주일" },
              { type: "month", label: "당월" },
              { type: "last_month", label: "전월" },
              { type: "custom", label: "기간선택" }
            ].map(btn => (
              <button
                key={btn.type}
                onClick={() => setFilterType(btn.type as any)}
                className={`px-4 py-2 text-xs rounded-xl font-bold border transition-all cursor-pointer ${
                  filterType === btn.type
                    ? "bg-navy border-navy text-white shadow-xxs"
                    : "bg-cream/10 border-brand-border/60 text-navy/60 hover:bg-cream/40"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* 기간 선택 입력폼 */}
        {filterType === "custom" && (
          <div className="flex items-center space-x-3 pt-3 border-t border-brand-border/40 animate-fade-in">
            <div className="flex items-center space-x-2 bg-cream/20 px-3 py-1.5 border border-brand-border rounded-xl">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-transparent border-none text-xs text-navy outline-none font-mono font-bold"
              />
            </div>
            <ArrowRight className="w-4 h-4 text-navy/40" />
            <div className="flex items-center space-x-2 bg-cream/20 px-3 py-1.5 border border-brand-border rounded-xl">
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-transparent border-none text-xs text-navy outline-none font-mono font-bold"
              />
            </div>
          </div>
        )}
      </div>

      {/* 핵심 분석 지표 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-brand-border rounded-3xl p-5 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-navy/55 text-xs">
            <span className="font-bold">고유 방문자수 (UV)</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-navy font-mono">{uniqueSessions.toLocaleString()}명</p>
          <span className="text-[10px] text-navy/40 block">고유 세션(쿠키) 식별자 집계 수치</span>
        </div>

        <div className="bg-white border border-brand-border rounded-3xl p-5 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-navy/55 text-xs">
            <span className="font-bold">누적 페이지 뷰 (PV)</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-navy font-mono">{totalPageViews.toLocaleString()}회</p>
          <span className="text-[10px] text-navy/40 block">기간 내 기록된 전체 페이지 요청량</span>
        </div>

        <div className="bg-white border border-brand-border rounded-3xl p-5 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-navy/55 text-xs">
            <span className="font-bold">고유 방문 IP 수</span>
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-navy font-mono">{uniqueIps.toLocaleString()}개</p>
          <span className="text-[10px] text-navy/40 block">접속 기기의 고유 IP 주소 개수</span>
        </div>

        <div className="bg-white border border-brand-border rounded-3xl p-5 space-y-2 shadow-sm bg-gradient-to-br from-white to-gold/5">
          <div className="flex justify-between items-center text-navy/55 text-xs">
            <span className="font-bold text-gold-dark font-black">사주정보 입력 횟수</span>
            <FileText className="w-4 h-4 text-gold" />
          </div>
          <p className="text-3xl font-black text-gold-dark font-mono">{sajuInputCount.toLocaleString()}건</p>
          <span className="text-[10px] text-navy/40 block">만세력/사주 정보 입력 완료 횟수</span>
        </div>
      </div>

      {/* 서비스별 이용률 & 점유 현황 */}
      <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 border-b border-brand-border/60 pb-3">
          <Layers className="w-5 h-5 text-gold" />
          <h3 className="text-base font-bold text-navy">서비스별 이용 횟수 분석</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {serviceData.map((s, idx) => {
              const percentage = Math.round((s.count / maxServiceCount) * 100) || 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-navy/70 flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span>{s.name}</span>
                    </span>
                    <span className="text-navy font-bold font-mono">{s.count}회</span>
                  </div>
                  <div className="w-full h-3 bg-cream/40 rounded-lg overflow-hidden border border-brand-border/40">
                    <div 
                      className={`h-full ${s.color} rounded-lg transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 서비스 요약 카드 */}
          <div className="bg-cream/10 border border-brand-border rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs text-navy/55 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5 text-gold" />
                <span>가장 높은 사용성 점유</span>
              </span>
              <h4 className="text-lg font-black text-navy">
                {serviceData[0]?.count > 0 ? serviceData[0].name : "이용 기록 없음"}
              </h4>
              <p className="text-xs text-navy/60 leading-relaxed">
                현재 분석 기간 동안 가장 활발히 사용된 인기 서비스입니다. 마케팅 기획 및 주력 콘텐츠 배치 시 해당 서비스의 비중을 우선 검토해 주세요.
              </p>
            </div>

            <div className="border-t border-brand-border/60 pt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-[10px] text-navy/40 block">최다 이용량</span>
                <p className="text-lg font-bold text-navy font-mono">{serviceData[0]?.count || 0}회</p>
              </div>
              <div>
                <span className="text-[10px] text-navy/40 block">최소 이용량</span>
                <p className="text-lg font-bold text-navy font-mono">
                  {serviceData[serviceData.length - 1]?.count || 0}회
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 날짜별 들어온 루트(IP 및 레퍼러) 상세 테이블 */}
      <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border/60 pb-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gold" />
            <h3 className="text-base font-bold text-navy">날짜별 유입 경로 및 IP 리스트</h3>
          </div>

          {/* 검색 기능 */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-navy/40 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="IP 주소 또는 유입 경로 검색"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs text-navy bg-cream/10 border border-brand-border rounded-xl outline-none focus:border-gold/60 focus:bg-white transition-all font-semibold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {entryRoutes.length === 0 ? (
            <div className="py-12 text-center text-xs text-navy/45 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-navy/20" />
              <p>해당 기간 동안 수집된 유입 경로 로그가 없거나 검색 조건에 부합하는 데이터가 없습니다.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs divide-y divide-brand-border/60">
              <thead>
                <tr className="text-navy/55 font-semibold">
                  <th className="pb-3 pl-2">진입 일시</th>
                  <th className="pb-3">방문자 IP 주소</th>
                  <th className="pb-3">유입 경로 (Referrer)</th>
                  <th className="pb-3">도착 지면 (Page Type)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-navy/80">
                {entryRoutes.map((route, i) => (
                  <tr key={route.id} className="hover:bg-cream/10 transition-colors">
                    <td className="py-3 pl-2 font-mono text-[11px] text-navy/60">
                      {new Date(route.createdAt).toLocaleString("ko-KR")}
                    </td>
                    <td className="py-3 font-mono font-bold text-navy flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-navy/35" />
                      <span>{route.ip}</span>
                    </td>
                    <td className="py-3 max-w-[280px] truncate font-mono" title={route.rawReferrer}>
                      {route.isInternal ? (
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/60 rounded text-slate-500 font-semibold text-[10px]">
                          {route.referrer}
                        </span>
                      ) : route.referrer === "direct" ? (
                        <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100/60 rounded text-indigo-600 font-bold text-[10px]">
                          직접 진입 (Direct)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100/60 rounded text-emerald-600 font-bold text-[10px] truncate max-w-[260px] inline-block align-middle">
                          {route.referrer}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="font-mono bg-cream/35 border border-brand-border/50 px-2.5 py-0.5 rounded-full text-gold-dark font-bold">
                        {route.pageType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
