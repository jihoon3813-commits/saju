"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getPaymentProvider } from "@/lib/payment/MockPaymentProvider";
import { triggerPremiumReportGeneration } from "@/app/api/payment/webhook/route";

/**
 * 어드민 권한 소유 유무를 최종 검증합니다.
 */
async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("관리자 권한이 필요합니다.");
  }
}

/**
 * 보안 감사 추적용 로그 기록 유틸리티
 */
async function recordAuditLog(action: string) {
  try {
    const user = await getCurrentUser();
    if (user) {
      await db.auditLogs.create({
        adminId: user.id,
        adminEmail: user.email || "admin@dreamfortune.com",
        action,
        ipAddress: "127.0.0.1",
        userAgent: "Admin Dashboard Console"
      });
    }
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

/**
 * 할인 쿠폰 신규 생성
 */
export async function createCouponAction(params: {
  code: string;
  discountType: "amount" | "percent";
  discountValue: number;
  maxUses: number;
  expiresAtStr: string;
}) {
  await ensureAdmin();
  const { code, discountType, discountValue, maxUses, expiresAtStr } = params;

  try {
    const existing = await db.coupons.findByCode(code);
    if (existing) {
      return { success: false, error: "이미 동일한 코드를 가진 쿠폰이 존재합니다." };
    }

    await db.coupons.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      maxUses,
      usedCount: 0,
      active: true,
      productRestrictions: null,
      expiresAt: new Date(expiresAtStr)
    });

    await recordAuditLog(`쿠폰 생성: 코드 ${code}, 할인율/할인액: ${discountValue}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "쿠폰 생성 실패" };
  }
}

/**
 * 쿠폰 활성화 토글
 */
export async function toggleCouponActiveAction(id: string) {
  await ensureAdmin();
  try {
    const coupon = await db.coupons.findById(id);
    if (!coupon) return { success: false, error: "쿠폰을 찾을 수 없습니다." };

    const newActiveState = !coupon.active;
    await db.coupons.update(id, { active: newActiveState });

    await recordAuditLog(`쿠폰 활성화 상태 토글: ID ${id}, 변경된 상태: ${newActiveState}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 상품 노출 여부 토글
 */
export async function toggleProductActiveAction(id: string) {
  await ensureAdmin();
  try {
    const product = await db.products.findById(id);
    if (!product) return { success: false, error: "상품을 찾을 수 없습니다." };

    const newActiveState = !product.active;
    await db.products.update(id, { active: newActiveState });

    await recordAuditLog(`상품 노출 상태 토글: ID ${id}, 변경된 상태: ${newActiveState}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 상품에 새로운 가격 버전 등록
 */
export async function createPriceVersionAction(params: {
  productId: string;
  price: number;
  version: string;
}) {
  await ensureAdmin();
  const { productId, price, version } = params;

  try {
    const product = await db.products.findById(productId);
    if (!product) return { success: false, error: "상품을 찾을 수 없습니다." };

    await db.priceVersions.create({
      productId,
      price,
      currency: "KRW",
      version,
      active: true
    });

    await db.products.update(productId, { price });

    await recordAuditLog(`가격 버전 신설: 상품 ID ${productId}, 신 가격: ${price}, 버전: ${version}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "가격 변경 등록 실패" };
  }
}

/**
 * 관리자 강제 환불 (소유권 검증 우회 및 PG 환불 연계)
 */
export async function triggerAdminRefundAction(orderId: string, reason: string) {
  await ensureAdmin();
  try {
    const order = await db.orders.findById(orderId);
    if (!order) return { success: false, error: "주문을 찾을 수 없습니다." };

    if (order.status === "refunded") {
      return { success: false, error: "이미 환불이 승인 완료된 주문입니다." };
    }

    const provider = getPaymentProvider(order.paymentProvider);
    const refundRes = await provider.refund({
      providerOrderId: order.providerOrderId || "mock_order_id",
      amount: order.amount,
      reason: reason || "어드민 강제 환불"
    });

    if (refundRes.success) {
      await db.orders.update(orderId, {
        status: "refunded",
        refundReason: reason,
        refundedAmount: refundRes.refundedAmount,
        refundedAt: refundRes.refundedAt
      });

      await recordAuditLog(`관리자 강제 환불 조치: 주문 ID ${orderId}, 사유: ${reason}`);
      return { success: true };
    } else {
      return { success: false, error: refundRes.error || "가상 결제사 API 환불 요청이 거절되었습니다." };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * AI 프리미엄 해석 보고서 강제 재생성 트리거
 */
export async function triggerAdminReportRegenerationAction(orderId: string) {
  await ensureAdmin();
  try {
    const order = await db.orders.findById(orderId);
    if (!order) return { success: false, error: "주문을 찾을 수 없습니다." };

    await db.orders.update(orderId, {
      status: "report_generating"
    });

    triggerPremiumReportGeneration(orderId).catch((err) => {
      console.error("어드민 강제 재생성 중 백그라운드 연산 오류:", err);
    });

    await recordAuditLog(`AI 리포트 강제 재생성 유도: 주문 ID ${orderId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * ------------------------------------------
 * Phase 8 추가 어드민 전용 통계 및 제어 액션들
 * ------------------------------------------
 */

// 감사로그 목록 취득
export async function handleGetAuditLogsAction() {
  await ensureAdmin();
  try {
    const list = await db.auditLogs.findAll();
    return { success: true, list };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

// 종합 운영 지표/통계 연산 (확장 버전)
export async function handleGetSystemStatisticsAction() {
  await ensureAdmin();
  try {
    const allOrders = await db.orders.findAll();
    const allCoupons = await db.coupons.findAll();
    const allReports = await db.userReports.findAll();
    const allProducts = await db.products.findAll();
    const allInterpretations = await db.interpretations.findAll();

    const totalSales = allOrders
      .filter((o) => o.status === "completed" || o.status === "paid")
      .reduce((sum, o) => sum + o.amount, 0);

    const paidOrdersCount = allOrders.filter((o) => o.status === "completed" || o.status === "paid").length;
    const activeCouponsCount = allCoupons.filter((c) => c.active).length;
    const pendingReportsCount = allReports.filter((r) => r.status === "pending").length;

    // 1. 상품별 판매량 및 매출 분석
    const productSalesBreakdown = allProducts.map((p) => {
      const pOrders = allOrders.filter((o) => o.productId === p.id && (o.status === "completed" || o.status === "paid"));
      const revenue = pOrders.reduce((sum, o) => sum + o.amount, 0);
      return {
        id: p.id,
        title: p.title,
        productType: p.productType,
        salesCount: pOrders.length,
        revenue
      };
    });

    // 2. AI 분석 성공률 및 폴백 통계
    const totalInterpretations = allInterpretations.length;
    const fallbackCount = allInterpretations.filter((r) => r.fallback).length;
    const aiSuccessCount = totalInterpretations - fallbackCount;
    const fallbackRate = totalInterpretations > 0 ? Math.round((fallbackCount / totalInterpretations) * 100) : 0;

    return {
      success: true,
      statistics: {
        totalSales,
        paidOrdersCount,
        activeCouponsCount,
        pendingReportsCount,
        totalOrdersCount: allOrders.length,
        productSalesBreakdown,
        aiStats: {
          total: totalInterpretations,
          aiCount: aiSuccessCount,
          fallbackCount,
          fallbackRate
        }
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Gemini API 연결 상태 테스트 액션
export async function handleTestApiConnectionAction() {
  await ensureAdmin();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다." };
  }

  const startTime = Date.now();
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "연결 테스트" }] }]
      })
    });

    const latency = Date.now() - startTime;
    if (res.ok) {
      return { success: true, latency, model: "gemini-2.5-flash" };
    } else {
      const errText = await res.text();
      return { success: false, error: `Gemini API 오류 (HTTP ${res.status}): ${errText.substring(0, 150)}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "네트워크 통신 중 연결 시간 초과 또는 오류가 발생했습니다." };
  }
}

// 6자리 가상 MFA OTP 인증 가드 액션
// (실 출시 대비 시뮬레이터로써 동작하며 고정 테스트 모드 코드 '123456'을 사용합니다)
export async function handleMfaVerifyAction(otpCode: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "관리자 세션이 아닙니다." };
    }

    if (otpCode === "123456") {
      await recordAuditLog("관리자 MFA OTP 가상 인증 완료");
      return { success: true };
    }
    return { success: false, error: "잘못된 6자리 OTP 난수입니다. 다시 시도해 주세요." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 사용자 오류 신고 목록 및 상태 업데이트
export async function handleGetUserReportsAction() {
  await ensureAdmin();
  try {
    const list = await db.userReports.findAll();
    return { success: true, list };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function handleUpdateUserReportStatusAction(
  reportId: string,
  status: "resolved" | "ignored"
) {
  await ensureAdmin();
  try {
    const updated = await db.userReports.update(reportId, {
      status,
      resolvedAt: new Date()
    });
    await recordAuditLog(`사용자 신고 상태 변경: ID ${reportId}, 변경상태: ${status}`);
    return { success: true, report: updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 약관 및 정책 버전 관리 액션
export async function handleGetPolicyVersionsAction() {
  try {
    const list = await db.policyVersions.findAll();
    return { success: true, list };
  } catch (err: any) {
    return { success: false, error: err.message, list: [] };
  }
}

export async function handleUpdatePolicyVersionAction(id: string, content: string) {
  await ensureAdmin();
  try {
    const updated = await db.policyVersions.update(id, { content });
    await recordAuditLog(`정책 동의 본문 개정: ID ${id}`);
    return { success: true, policy: updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
