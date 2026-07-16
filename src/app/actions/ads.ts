"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

/**
 * 특정 슬롯 키에 매핑되는 광고 설정을 조회합니다.
 */
export async function getAdPlacementBySlotKey(slotKey: string) {
  try {
    return await db.adPlacements.findBySlotKey(slotKey);
  } catch (err) {
    console.error(`[getAdPlacementBySlotKey] Error for ${slotKey}:`, err);
    return null;
  }
}

/**
 * 모든 광고 슬롯 정보를 조회합니다 (어드민용).
 */
export async function getAllAdPlacements() {
  try {
    return await db.adPlacements.findAll();
  } catch (err) {
    console.error("[getAllAdPlacements] Error:", err);
    return [];
  }
}

/**
 * 광고 슬롯의 세부 설정을 변경하고 감사 로그를 적재합니다 (어드민용).
 */
export async function updateAdPlacement(
  id: string,
  fields: {
    enabled?: boolean;
    reserveHeight?: number;
    adFormat?: "banner" | "infeed" | "sidebar" | "native";
    deviceTarget?: "all" | "pc" | "mobile";
    consentRequired?: boolean;
  }
) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("어드민 권한이 필요합니다.");
    }

    const current = await db.adPlacements.findById(id);
    if (!current) {
      throw new Error("광고 배치를 찾을 수 없습니다.");
    }

    // 변경 사항 검출
    const changes: Record<string, any> = {};
    for (const [key, val] of Object.entries(fields)) {
      const curVal = current[key as keyof typeof fields];
      if (curVal !== val) {
        changes[key] = { from: curVal, to: val };
      }
    }

    if (Object.keys(changes).length === 0) {
      return { success: true, placement: current };
    }

    // 1. 광고 설정 업데이트
    const updated = await db.adPlacements.update(id, fields);

    // 2. 감사 로그 등록
    await db.adAuditLogs.create({
      placementId: id,
      slotKey: current.slotKey,
      action: fields.enabled !== undefined && fields.enabled !== current.enabled ? "toggle_enable" : "update",
      changedBy: adminUser.email,
      changes: JSON.stringify(changes)
    });

    revalidatePath("/admin/ads");
    return { success: true, placement: updated };
  } catch (err: any) {
    console.error("[updateAdPlacement] Error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 특정 슬롯 변경 로그 내역 조회 (어드민용)
 */
export async function getAdAuditLogs(placementId: string) {
  try {
    return await db.adAuditLogs.findByPlacementId(placementId);
  } catch (err) {
    console.error("[getAdAuditLogs] Error:", err);
    return [];
  }
}

/**
 * 전체 감사 로그 목록 조회 (어드민용)
 */
export async function getAllAdAuditLogs() {
  try {
    return await db.adAuditLogs.findAll();
  } catch (err) {
    console.error("[getAllAdAuditLogs] Error:", err);
    return [];
  }
}
