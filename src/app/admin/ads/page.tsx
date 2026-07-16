import React from "react";
import { db } from "@/lib/db";
import { AdManageClient } from "./AdManageClient";
import { Sliders } from "lucide-react";

export const metadata = {
  title: "광고 슬롯 제어판 - CMS 관리자 센터",
  robots: "noindex, nofollow"
};

export default async function AdminAdsPage() {
  // DB로부터 설정 및 감사로그 페칭
  const placements = await db.adPlacements.findAll();
  const auditLogs = await db.adAuditLogs.findAll();

  return (
    <div className="space-y-8">
      {/* 타이틀 및 헤더 */}
      <div className="flex items-center space-x-3 text-navy font-semibold">
        <div className="p-2.5 bg-purple-50 border border-purple-100 text-purple-600 rounded-2xl shadow-xxs">
          <Sliders className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black">광고 슬롯 배치 제어판</h1>
          <p className="text-sm text-navy/60 mt-1">
            홈, 매거진 목록, 기사 본문, 결과지의 구글 애드센스 슬롯별 송출 여부와 CLS 방지 예약 높이를 통제합니다.
          </p>
        </div>
      </div>

      <AdManageClient 
        initialPlacements={placements} 
        initialAuditLogs={auditLogs} 
      />
    </div>
  );
}
