"use server";

import { db } from "@/lib/db";
import { cookies, headers } from "next/headers";

/**
 * 클라이언트나 서버에서 유발된 비개인식별 행동 로그를 데이터베이스에 적재합니다.
 */
export async function logAnalyticsEvent(eventName: string, pageType: string, properties: any) {
  try {
    const cookieStore = await cookies();
    let sessionId = 
      cookieStore.get("session_token")?.value || 
      cookieStore.get("anonymous_session_id")?.value;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      const expires = new Date();
      expires.setDate(expires.getDate() + 30); // 30일 만료
      cookieStore.set("anonymous_session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires,
        path: "/"
      });
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "127.0.0.1";

    let propsObj: Record<string, any> = {};
    if (properties) {
      if (typeof properties === "string") {
        try {
          propsObj = JSON.parse(properties);
        } catch (e) {}
      } else {
        propsObj = { ...properties };
      }
    }

    // IP 및 레퍼러 기록 추가
    propsObj.ip = ip;
    propsObj.referrer = propsObj.referrer || headersList.get("referer") || "direct";

    const cleanProperties = JSON.stringify(propsObj);

    await db.analyticsLogs.create({
      eventName,
      pageType,
      sessionId,
      properties: cleanProperties
    });

    return { success: true };
  } catch (err: any) {
    console.error("[logAnalyticsEvent] Failed to write log:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 데이터베이스의 모든 분석 로그 데이터를 전체 삭제합니다.
 */
export async function clearAnalyticsLogs() {
  try {
    await db.analyticsLogs.clearAll();
    return { success: true };
  } catch (err: any) {
    console.error("[clearAnalyticsLogs] Failed to clear logs:", err);
    return { success: false, error: err.message };
  }
}
