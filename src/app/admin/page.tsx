"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  ShieldCheck,
  TrendingUp,
  FolderLock,
  History,
  AlertOctagon,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Activity,
  Lock,
  RefreshCw,
  Mail,
  UserCheck,
  Sparkles,
  Server,
  Network
} from "lucide-react";
import {
  handleMfaVerifyAction,
  handleGetSystemStatisticsAction,
  handleGetAuditLogsAction,
  handleGetUserReportsAction,
  handleUpdateUserReportStatusAction,
  handleGetPolicyVersionsAction,
  handleUpdatePolicyVersionAction,
  handleTestApiConnectionAction
} from "@/app/actions/admin";

export default function AdminPage() {
  const [mfaVerified, setMfaVerified] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [mfaError, setMfaError] = useState<string | null>(null);

  // 대시보드 데이터 상태
  const [activeTab, setActiveTab] = useState<"stats" | "api" | "audit" | "reports" | "policy">("stats");
  const [loading, setLoading] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  // API 테스트 상태
  const [testingApi, setTestingApi] = useState<boolean>(false);
  const [apiTestResult, setApiTestResult] = useState<any | null>(null);

  const breadcrumbs = [
    { name: "홈", path: "/" },
    { name: "관리자 센터", path: "/admin" }
  ];

  // MFA OTP 입력 검증
  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setMfaError("6자리 숫자를 입력하세요.");
      return;
    }

    setLoading(true);
    setMfaError(null);
    const res = await handleMfaVerifyAction(otp);
    setLoading(false);

    if (res.success) {
      setMfaVerified(true);
      loadDashboardData();
    } else {
      setMfaError(res.error || "MFA 인증 실패");
    }
  };

  // 대시보드 모든 정보 비동기 로드
  const loadDashboardData = async () => {
    setLoading(true);
    const [statsRes, auditRes, reportsRes, policyRes] = await Promise.all([
      handleGetSystemStatisticsAction(),
      handleGetAuditLogsAction(),
      handleGetUserReportsAction(),
      handleGetPolicyVersionsAction()
    ]);
    setLoading(false);

    if (statsRes.success) setStatistics(statsRes.statistics);
    if (auditRes.success) setAuditLogs(auditRes.list || []);
    if (reportsRes.success) setUserReports(reportsRes.list || []);
    if (policyRes.success) setPolicies(policyRes.list || []);
  };

  // API 실시간 연결성 테스트
  const handleTestApiConnection = async () => {
    setTestingApi(true);
    setApiTestResult(null);
    const res = await handleTestApiConnectionAction();
    setTestingApi(false);
    setApiTestResult(res);
  };

  // 신고 상태 변경
  const handleUpdateReport = async (id: string, status: "resolved" | "ignored") => {
    const res = await handleUpdateUserReportStatusAction(id, status);
    if (res.success) {
      setUserReports(userReports.map((r) => (r.id === id ? { ...r, status, resolvedAt: new Date() } : r)));
    }
  };

  // 정책 업데이트 제출
  const handleSavePolicy = async (id: string) => {
    const res = await handleUpdatePolicyVersionAction(id, editingContent);
    if (res.success) {
      setPolicies(policies.map((p) => (p.id === id ? { ...p, content: editingContent } : p)));
      setEditingPolicyId(null);
    }
  };

  // 1. MFA 인증 가드 화면 (라이트 테마)
  if (!mfaVerified) {
    return (
      <main className="min-h-screen bg-cream text-navy flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-brand-border rounded-3xl p-8 space-y-6 shadow-md text-center">
          <div className="inline-block p-4 rounded-full bg-gold/10 border border-gold/20 text-gold mb-2 shadow-sm">
            <Lock className="w-8 h-8 text-gold" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-navy">관리자 통제 MFA 인증</h1>
            <p className="text-navy/60 text-xs leading-relaxed font-semibold">
              정보보호 정책에 따라 본 시스템 진입 전 모바일 OTP 인증이 요구됩니다. 
              <br />
              <span className="text-gold font-mono font-bold mt-1.5 block">* 가상 테스트 OTP 번호: 123456</span>
            </p>
          </div>

          <form onSubmit={handleVerifyMfa} className="space-y-4 pt-2">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="000000"
              className="w-full tracking-[1.2rem] text-center text-2xl font-black py-3 border border-brand-border rounded-xl bg-white text-navy focus:outline-none focus:ring-1 focus:ring-gold/60 font-semibold"
            />

            {mfaError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center space-x-1.5 justify-center font-bold">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                <span>{mfaError}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full font-bold bg-gold hover:bg-gold/95 text-white py-3 rounded-xl shadow-sm transition active:scale-95"
            >
              {loading ? "MFA 검증 연산 중..." : "OTP 인증 완료"}
            </Button>
          </form>
        </div>
      </main>
    );
  }

  // 2. 어드민 운영 감사 대시보드 본 화면 (로열블루 & 라이트 테마)
  return (
    <main className="min-h-screen bg-cream text-navy py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Breadcrumb items={breadcrumbs} />

        {/* 헤더 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-5">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-navy tracking-tight flex items-center space-x-2.5">
              <ShieldCheck className="w-8 h-8 text-gold" />
              <span>DREAM & FORTUNE 운영 제어 대시보드</span>
            </h1>
            <p className="text-xs text-navy/55 font-semibold">
              MFA 통제 세션 활성화 완료 | 관리자 권한 쓰기 행위 전량이 감사 로그에 영구 원장 기록됩니다.
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadDashboardData}
              className="p-2.5 bg-white hover:bg-cream/40 border border-brand-border text-navy/70 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link href="/admin/orders">
              <Button variant="outline" className="text-xs border-brand-border hover:bg-cream/40 text-navy/70 font-bold">
                주문/환불 대장 관리
              </Button>
            </Link>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-3 border-b border-brand-border pb-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab("stats")}
            className={`pb-3 px-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "stats" ? "border-gold text-gold" : "border-transparent text-navy/50 hover:text-navy"
            }`}
          >
            운영 통계 (Metrics)
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`pb-3 px-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "api" ? "border-gold text-gold" : "border-transparent text-navy/50 hover:text-navy"
            }`}
          >
            API 및 엔진 설정 (Settings)
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 px-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "audit" ? "border-gold text-gold" : "border-transparent text-navy/50 hover:text-navy"
            }`}
          >
            감사로그 원장 (Audit Log)
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`pb-3 px-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "reports" ? "border-gold text-gold" : "border-transparent text-navy/50 hover:text-navy"
            }`}
          >
            오류/의견 신고 접수 큐
          </button>
          <button
            onClick={() => setActiveTab("policy")}
            className={`pb-3 px-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "policy" ? "border-gold text-gold" : "border-transparent text-navy/50 hover:text-navy"
            }`}
          >
            동의 및 정책 버전 관리
          </button>
        </div>

        {/* 탭 1: 운영 지표 */}
        {activeTab === "stats" && statistics && (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm">
                <span className="text-[10px] text-navy/50 font-bold block">누적 확정 매출액</span>
                <strong className="text-2xl font-black text-gold tracking-tight">
                  ₩{statistics.totalSales.toLocaleString()}
                </strong>
                <span className="text-[9px] text-navy/40 block mt-1">Paid / Completed 주문 집계</span>
              </div>

              <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm">
                <span className="text-[10px] text-navy/50 font-bold block">유효 결제 거래량</span>
                <strong className="text-2xl font-black text-navy tracking-tight">
                  {statistics.paidOrdersCount}건
                </strong>
                <span className="text-[9px] text-navy/40 block mt-1">총 주문 인입: {statistics.totalOrdersCount}건</span>
              </div>

              <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm">
                <span className="text-[10px] text-navy/50 font-bold block">활성 할인 쿠폰 코드</span>
                <strong className="text-2xl font-black text-navy tracking-tight">
                  {statistics.activeCouponsCount}개
                </strong>
                <span className="text-[9px] text-navy/40 block mt-1">쿠폰 관리 지면 연동 완료</span>
              </div>

              <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm border-l-gold/30">
                <span className="text-[10px] text-navy/50 font-bold block">미해결 오류/의견 신고</span>
                <strong className="text-2xl font-black text-amber-500 tracking-tight">
                  {statistics.pendingReportsCount}건
                </strong>
                <span className="text-[9px] text-navy/40 block mt-1">사용자 권한/오류 의견 신고 큐 대기</span>
              </div>
            </div>

            {/* AI 정상 성공율 vs 폴백 통계 */}
            {statistics.aiStats && (
              <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-navy flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gold" />
                  <span>AI 분석 성공율 vs 룰 기반 로컬 폴백 전환 통계</span>
                </h3>
                <div className="grid gap-4 sm:grid-cols-4 text-xs font-semibold">
                  <div className="bg-cream/40 p-4 rounded-xl border border-brand-border/60">
                    <span className="text-[10px] text-navy/50 block">누적 분석 시도 건수</span>
                    <strong className="text-navy text-lg font-black block mt-1">{statistics.aiStats.total}건</strong>
                  </div>
                  <div className="bg-cream/40 p-4 rounded-xl border border-brand-border/60">
                    <span className="text-[10px] text-emerald-600 block">AI 정상 상세 해설 건수</span>
                    <strong className="text-emerald-600 text-lg font-black block mt-1">{statistics.aiStats.aiCount}건</strong>
                  </div>
                  <div className="bg-cream/40 p-4 rounded-xl border border-brand-border/60">
                    <span className="text-[10px] text-amber-600 block">룰기반 요약서 폴백 전환</span>
                    <strong className="text-amber-600 text-lg font-black block mt-1">{statistics.aiStats.fallbackCount}건</strong>
                  </div>
                  <div className="bg-cream/40 p-4 rounded-xl border border-brand-border/60">
                    <span className="text-[10px] text-rose-500 block">AI 오류 폴백 전환율</span>
                    <strong className="text-rose-500 text-lg font-black block mt-1">{statistics.aiStats.fallbackRate}%</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 상품별 매출 분해 표 */}
            {statistics.productSalesBreakdown && (
              <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-navy flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-gold" />
                  <span>상품별 정밀 매출 및 누적 거래량 분해표</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-navy/80">
                    <thead className="bg-cream/50 text-navy/60 font-bold uppercase text-[10px] border-b border-brand-border">
                      <tr>
                        <th className="py-3 px-4">상품명</th>
                        <th className="py-3 px-4">상품 고유 식별 코드 (slug)</th>
                        <th className="py-3 px-4 text-right">누적 판매량</th>
                        <th className="py-3 px-4 text-right">정적 확정 매출액</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60 font-semibold">
                      {statistics.productSalesBreakdown.map((prod: any, idx: number) => (
                        <tr key={idx} className="hover:bg-cream/10">
                          <td className="py-3.5 px-4 font-bold text-navy">{prod.title}</td>
                          <td className="py-3.5 px-4 text-navy/50 font-mono text-[10px]">{prod.productType}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-navy/80">{prod.salesCount}건</td>
                          <td className="py-3.5 px-4 text-right font-mono font-extrabold text-gold">₩{prod.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 탭 1.5: API 및 엔진 설정 */}
        {activeTab === "api" && (
          <div className="space-y-6">
            <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
              <div className="border-b border-brand-border pb-4">
                <h3 className="text-md font-bold text-navy flex items-center space-x-2">
                  <Server className="w-5 h-5 text-gold" />
                  <span>Google Gemini AI API 설정 및 엔진 가드</span>
                </h3>
                <p className="text-xs text-navy/50 mt-1 font-semibold">
                  본 서비스가 실시간 사주/타로 해석을 위해 참조하는 백엔드 환경 변수 및 AI 호출 사양 정보입니다.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 text-xs font-semibold">
                <div className="bg-cream/40 p-5 rounded-2xl border border-brand-border/60 space-y-3">
                  <span className="text-[10px] text-navy/40 font-bold uppercase block">API 및 프롬프트 환경설정</span>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-brand-border/30 pb-1.5">
                      <span className="text-navy/60">Target Model (타겟 모델):</span>
                      <strong className="text-navy">gemini-2.5-flash</strong>
                    </div>
                    <div className="flex justify-between border-b border-brand-border/30 pb-1.5">
                      <span className="text-navy/60">Temperature (창의성/안정도):</span>
                      <strong className="text-navy">0.15 (안정값 강제 지침)</strong>
                    </div>
                    <div className="flex justify-between border-b border-brand-border/30 pb-1.5">
                      <span className="text-navy/60">Fallback Mode (폴백 활성):</span>
                      <strong className="text-emerald-600">Auto (AI 실패 시 요약 룰셋 자동 전환)</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-cream/40 p-5 rounded-2xl border border-brand-border/60 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-navy/40 font-bold uppercase block">Gemini API 키 및 네트워크 진단</span>
                    <p className="text-[11px] text-navy/60 mt-1.5 leading-relaxed font-semibold">
                      API 연동 테스트 버튼 클릭 시, 현재 로드된 구글 개발자 키(`GEMINI_API_KEY`)를 기반으로 구글 서버에 통신 진단을 요청합니다.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <Button
                      onClick={handleTestApiConnection}
                      disabled={testingApi}
                      className="text-xs font-bold px-4 py-2.5 bg-gold hover:bg-gold/95 text-white rounded-lg shadow-sm"
                    >
                      {testingApi ? "연결 진단 중..." : "API 연결 상태 진단"}
                    </Button>
                    {apiTestResult && (
                      <span className={`text-xs font-bold flex items-center space-x-1 ${apiTestResult.success ? "text-emerald-600" : "text-rose-600"}`}>
                        {apiTestResult.success ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span>정상 ({apiTestResult.latency}ms)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-500" />
                            <span>연결 실패</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {apiTestResult && !apiTestResult.success && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600 space-y-1.5 font-semibold">
                  <span className="font-bold flex items-center space-x-1">
                    <AlertOctagon className="w-4 h-4 text-rose-500" />
                    <span>Gemini API 진단 오류 피드백:</span>
                  </span>
                  <p className="font-mono bg-white p-3 rounded-lg border border-rose-100 text-[10px] leading-relaxed">
                    {apiTestResult.error}
                  </p>
                  <span className="text-[9px] text-rose-500/70 block">
                    ※ .env에 등록된 `GEMINI_API_KEY` 환경변수가 올바르게 설정되어 있는지 및 만료되지 않았는지 재확인 하십시오.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 탭 2: 감사 로그 */}
        {activeTab === "audit" && (
          <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-4 shadow-md">
            <h3 className="text-sm font-bold text-navy flex items-center space-x-2">
              <History className="w-4 h-4 text-gold" />
              <span>영구 감사 로깅 대장 (Audit Trails)</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-navy/80">
                <thead className="bg-cream/50 text-navy/60 font-bold uppercase text-[10px] border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4">시간 (KST)</th>
                    <th className="py-3 px-4">관리자 이메일</th>
                    <th className="py-3 px-4">수행 행위 (Action)</th>
                    <th className="py-3 px-4">접속 IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60 font-semibold">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-navy/40">
                        기록된 운영 조작 감사 로그가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-cream/10">
                        <td className="py-3.5 px-4 font-mono text-navy/45">
                          {new Date(log.createdAt).toLocaleString("ko-KR")}
                        </td>
                        <td className="py-3.5 px-4 text-navy">
                          {log.adminEmail}
                        </td>
                        <td className="py-3.5 px-4 text-gold font-bold">
                          {log.action}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-navy/45">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 탭 3: 오류 신고 큐 */}
        {activeTab === "reports" && (
          <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-4 shadow-md">
            <h3 className="text-sm font-bold text-navy flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-gold" />
              <span>사용자 피드백 및 오류 신고 모니터링 큐</span>
            </h3>

            <div className="space-y-4">
              {userReports.length === 0 ? (
                <div className="text-center py-10 text-xs text-navy/40 font-semibold">
                  접수된 사용자 오류/민감권한 의견 보고가 존재하지 않습니다.
                </div>
              ) : (
                userReports.map((rep) => (
                  <div key={rep.id} className="bg-cream/20 border border-brand-border p-5 rounded-2xl space-y-3 font-semibold">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-black uppercase px-2.5 py-0.5 bg-gold/15 border border-gold/30 rounded-full text-gold">
                          신고 종류: {rep.reportType}
                        </span>
                        <div className="text-[10px] text-navy/40">
                          접수 시간: {new Date(rep.createdAt).toLocaleString("ko-KR")} | 엔진: {rep.versionInfo}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {rep.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleUpdateReport(rep.id, "resolved")}
                              className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-emerald-100/50 flex items-center space-x-1"
                            >
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <span>처리 완료</span>
                            </button>
                            <button
                              onClick={() => handleUpdateReport(rep.id, "ignored")}
                              className="px-3 py-1 bg-slate-100 text-navy/50 border border-brand-border rounded-lg text-[10px] font-bold cursor-pointer hover:bg-cream/40 flex items-center space-x-1"
                            >
                              <XCircle className="w-3 h-3 text-navy/30" />
                              <span>의견 반려/무시</span>
                            </button>
                          </>
                        ) : (
                          <span className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border ${
                            rep.status === "resolved" ? "border-emerald-100 text-emerald-600 bg-emerald-50/50" : "border-brand-border text-navy/40"
                          }`}>
                            {rep.status === "resolved" ? "해결 완수" : "처리 완료(반려)"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-navy/85 bg-white p-3 rounded-xl border border-brand-border leading-relaxed">
                      {rep.content}
                    </div>

                    {rep.orderId && (
                      <div className="text-[10px] text-navy/40">
                        연관 주문번호: <span className="font-mono text-navy/55">{rep.orderId}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 탭 4: 이용 약관 및 개인정보 처리방침 CMS */}
        {activeTab === "policy" && (
          <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-5 shadow-md">
            <h3 className="text-sm font-bold text-navy flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-gold" />
              <span>동의 규정 및 법적 고지 문서 관리 CMS</span>
            </h3>

            <div className="space-y-6">
              {policies.map((p) => {
                const isEditing = editingPolicyId === p.id;
                return (
                  <div key={p.id} className="bg-cream/20 border border-brand-border p-5 rounded-2xl space-y-3 font-semibold">
                    <div className="flex justify-between items-center border-b border-brand-border/60 pb-2">
                      <strong className="text-sm text-navy">{p.title} <span className="text-xs text-navy/40 font-medium">(버전: {p.version})</span></strong>
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingPolicyId(p.id);
                            setEditingContent(p.content);
                          }}
                          className="text-[10px] text-gold font-bold hover:underline cursor-pointer"
                        >
                          본문 개정(수정)
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          rows={6}
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full p-4 border border-brand-border rounded-xl bg-white text-xs text-navy focus:outline-none focus:ring-1 focus:ring-gold/60"
                        />
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => setEditingPolicyId(null)}
                            className="px-3.5 py-1.5 bg-white hover:bg-cream/40 text-navy/60 rounded-lg text-xs font-bold cursor-pointer border border-brand-border"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleSavePolicy(p.id)}
                            className="px-3.5 py-1.5 bg-gold hover:bg-gold/95 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                          >
                            개정 발행 (감사로그 등록)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-navy/60 font-medium leading-relaxed truncate-3-lines">
                        {p.content}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
