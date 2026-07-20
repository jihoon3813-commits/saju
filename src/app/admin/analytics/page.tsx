import React from "react";
import { db } from "@/lib/db";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

export const metadata = {
  title: "서비스 분석 통계 - CMS 관리자 센터",
  robots: "noindex, nofollow"
};

export default async function AdminAnalyticsPage() {
  // DB로부터 분석 로그 데이터 전원 획득
  const logs = await db.analyticsLogs.findAll();

  // Next.js Server Component에서 Client Component로 데이터를 전달할 수 있도록 Date 객체를 timestamp 숫자로 직렬화
  const serializedLogs = logs.map(l => {
    let ts = Date.now();
    if (l.createdAt) {
      if (l.createdAt instanceof Date) {
        ts = l.createdAt.getTime();
      } else if (typeof l.createdAt === "number") {
        ts = l.createdAt;
      } else {
        ts = new Date(l.createdAt).getTime();
      }
    }
    return {
      id: l.id,
      eventName: l.eventName,
      pageType: l.pageType,
      sessionId: l.sessionId,
      properties: l.properties,
      createdAt: ts
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AnalyticsDashboard initialLogs={serializedLogs} />
    </div>
  );
}
