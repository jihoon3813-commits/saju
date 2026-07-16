"use server";

import { db } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * 클라이언트나 서버에서 유발된 비개인식별 행동 로그를 데이터베이스에 적재합니다.
 */
export async function logAnalyticsEvent(eventName: string, pageType: string, properties: any) {
  try {
    const cookieStore = await cookies();
    const sessionId = 
      cookieStore.get("session_token")?.value || 
      cookieStore.get("anonymous_session_id")?.value || 
      "unknown-session";

    const cleanProperties = typeof properties === "string" ? properties : JSON.stringify(properties || {});

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
