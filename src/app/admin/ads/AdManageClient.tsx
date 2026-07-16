"use client";

import React, { useState, useTransition } from "react";
import { updateAdPlacement } from "@/app/actions/ads";
import { AdPlacement, AdAuditLog } from "@/lib/db/types";
import { Sliders, CheckCircle2, AlertTriangle, Eye, ShieldAlert, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AdManageClientProps {
  initialPlacements: AdPlacement[];
  initialAuditLogs: AdAuditLog[];
}

export function AdManageClient({ initialPlacements, initialAuditLogs }: AdManageClientProps) {
  const [placements, setPlacements] = useState<AdPlacement[]>(initialPlacements);
  const [auditLogs, setAuditLogs] = useState<AdAuditLog[]>(initialAuditLogs);
  const [activeTab, setActiveTab] = useState<"slots" | "logs">("slots");
  const [previewSlot, setPreviewSlot] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    setUpdatingId(id);
    const res = await updateAdPlacement(id, { enabled: !currentEnabled });
    setUpdatingId(null);
    
    if (res.success && res.placement) {
      // 로컬 상태 갱신
      setPlacements(prev =>
        prev.map(p => (p.id === id ? { ...p, enabled: res.placement!.enabled } : p))
      );
      // 최근 감사 로그 갱신을 위해 페이지 리로드 유도 또는 수동 갱신 시도
      window.location.reload();
    } else {
      alert(res.error || "수정에 실패했습니다.");
    }
  };

  const handleFormatChange = async (id: string, format: any) => {
    setUpdatingId(id);
    const res = await updateAdPlacement(id, { adFormat: format });
    setUpdatingId(null);
    if (res.success && res.placement) {
      setPlacements(prev =>
        prev.map(p => (p.id === id ? { ...p, adFormat: res.placement!.adFormat } : p))
      );
    } else {
      alert(res.error || "수정에 실패했습니다.");
    }
  };

  const handleHeightChange = async (id: string, height: number) => {
    setUpdatingId(id);
    const res = await updateAdPlacement(id, { reserveHeight: height });
    setUpdatingId(null);
    if (res.success && res.placement) {
      setPlacements(prev =>
        prev.map(p => (p.id === id ? { ...p, reserveHeight: res.placement!.reserveHeight } : p))
      );
    } else {
      alert(res.error || "수정에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-6 font-semibold">
      {/* 탭 네비게이션 */}
      <div className="flex space-x-2 border-b border-brand-border pb-px">
        <button
          onClick={() => setActiveTab("slots")}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "slots"
              ? "border-gold text-gold"
              : "border-transparent text-navy/55 hover:text-navy"
          }`}
        >
          광고 슬롯 제어 맵
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "logs"
              ? "border-gold text-gold"
              : "border-transparent text-navy/55 hover:text-navy"
          }`}
        >
          감사 로그 (Audit Log)
        </button>
      </div>

      {activeTab === "slots" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* 광고 슬롯 관리 리스트 */}
          <div className="xl:col-span-2 space-y-4">
            {placements.map((p) => (
              <div 
                key={p.id} 
                className={`bg-white border ${
                  p.enabled ? "border-brand-border" : "border-brand-border/40 opacity-70"
                } rounded-3xl p-5 space-y-4 transition-all shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-gold font-bold bg-gold/10 border border-gold/20 px-2.5 py-0.5 rounded-full">
                        {p.slotKey}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                        p.deviceTarget === "all" ? "bg-cream text-navy/60" : p.deviceTarget === "pc" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                      }`}>
                        {p.deviceTarget} 타겟
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-navy mt-1.5">
                      위치: {p.pageType} 지면 / {p.position}
                    </h3>
                  </div>

                  {/* 활성화 토글 스위치 */}
                  <div className="flex items-center space-x-2">
                    {updatingId === p.id && (
                      <RefreshCw className="w-4 h-4 text-gold animate-spin" />
                    )}
                    <button
                      onClick={() => handleToggle(p.id, p.enabled)}
                      disabled={updatingId !== null}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        p.enabled ? "bg-gold" : "bg-navy/20"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          p.enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 상세 제어 컨트롤 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-brand-border/60 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-navy/55 font-semibold block">광고 포맷</span>
                    <select
                      value={p.adFormat}
                      onChange={(e) => handleFormatChange(p.id, e.target.value)}
                      disabled={updatingId !== null}
                      className="w-full bg-white border border-brand-border text-navy rounded-lg px-2.5 py-1.5 outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="banner">banner (배너)</option>
                      <option value="infeed">infeed (인피드)</option>
                      <option value="sidebar">sidebar (사이드바)</option>
                      <option value="native">native (네이티브)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-navy/55 font-semibold block">CLS 예약 높이 (px)</span>
                    <input
                      type="number"
                      value={p.reserveHeight}
                      onChange={(e) => handleHeightChange(p.id, parseInt(e.target.value) || 0)}
                      disabled={updatingId !== null}
                      className="w-full bg-white border border-brand-border text-navy rounded-lg px-2.5 py-1.5 outline-none focus:border-gold font-mono"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <button
                      onClick={() => setPreviewSlot(previewSlot === p.slotKey ? null : p.slotKey)}
                      className="flex items-center space-x-1.5 text-navy/50 hover:text-gold transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{previewSlot === p.slotKey ? "미리보기 닫기" : "슬롯 디자인 검증"}</span>
                    </button>
                  </div>
                </div>

                {/* 슬롯 디자인 실체 테스트 */}
                {previewSlot === p.slotKey && (
                  <div className="bg-cream/40 border border-brand-border/60 rounded-2xl p-4 mt-2">
                    <span className="text-[10px] text-navy/40 font-bold block mb-2">프론트엔드 모의 렌더링 미리보기</span>
                    <div 
                      className="w-full bg-white border border-dashed border-brand-border flex items-center justify-center text-navy/60 text-xxs rounded-xl"
                      style={{ minHeight: `${p.reserveHeight}px` }}
                    >
                      <div className="text-center py-4">
                        <p className="font-extrabold tracking-wide text-navy">광고 영역 테스트</p>
                        <p className="text-[10px] text-navy/40 mt-1">Slot Key: {p.slotKey} ({p.reserveHeight}px)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 설명 및 정책 리마인더 */}
          <div className="space-y-6">
            <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-navy flex items-center space-x-1.5">
                <ShieldAlert className="w-5 h-5 text-gold" />
                <span>배치 정책 자가 진단</span>
              </h4>
              <p className="text-xs text-navy/60 leading-relaxed">
                구글 애드센스 프로그램 정책에 위배되는 행동 유도 버튼 근처 배치(운세 입력 결과 CTA, 뒤로가기 버튼 등)를 방지하는 구조로 프론트엔드가 설계되어 있습니다.
              </p>
              <ul className="text-xxs text-navy/50 space-y-1.5 list-disc pl-4 leading-normal">
                <li>비회원 입력 마법사 10단계 화면에는 광고를 원천 차단합니다.</li>
                <li>광고 크기 사전예약(Reserve Height)을 통해 CLS 수치를 0.05 미만으로 유지해야 합니다.</li>
                <li>쿠키 동의 배너에서 광고 추적 거절 시 해당 슬롯은 외부 스크립트 연결이 완전히 차단됩니다.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* 감사 로그 리스트 */
        <div className="bg-white border border-brand-border rounded-3xl p-6 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-4">
            <h3 className="font-bold text-navy flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gold" />
              <span>설정 변경 감사 내역 (Audit Logs)</span>
            </h3>
            <span className="text-xxs text-navy/40 font-mono">Total {auditLogs.length}건 기록</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-12 text-navy/40 text-sm">
              기록된 변경 감사 내역이 존재하지 않습니다.
            </div>
          ) : (
            <div className="divide-y divide-brand-border/60 max-h-[60vh] overflow-y-auto pr-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-navy">{log.changedBy}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-gold/10 text-gold font-bold rounded-full">{log.action}</span>
                      <span className="font-mono text-navy/60 text-xxs bg-cream px-2 py-0.5 rounded">Slot: {log.slotKey}</span>
                    </div>
                    <p className="font-mono text-[10px] text-navy/50 max-w-xl break-all">
                      변동사항: {log.changes}
                    </p>
                  </div>
                  <span className="text-[10px] text-navy/40 shrink-0 self-end sm:self-center font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
