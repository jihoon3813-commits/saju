"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getPaymentProvider } from "@/lib/payment/MockPaymentProvider";
import crypto from "crypto";

export interface ValidateCouponResult {
  success: boolean;
  couponId?: string;
  discountType?: "amount" | "percent";
  discountValue?: number;
  discountAmount?: number;
  error?: string;
}

/**
 * 쿠폰 유효성을 검증하고 할인액을 산출합니다.
 */
export async function validateCouponAction(code: string, productId: string): Promise<ValidateCouponResult> {
  try {
    if (!code) {
      return { success: false, error: "쿠폰 코드를 입력해 주세요." };
    }

    const coupon = await db.coupons.findByCode(code);
    if (!coupon) {
      return { success: false, error: "존재하지 않거나 만료된 쿠폰입니다." };
    }

    if (!coupon.active) {
      return { success: false, error: "현재 활성화되지 않은 쿠폰입니다." };
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return { success: false, error: "이미 소진된 쿠폰입니다." };
    }

    if (coupon.expiresAt.getTime() < Date.now()) {
      return { success: false, error: "유효기간이 만료된 쿠폰입니다." };
    }

    // 대상 상품 제한 검사
    if (coupon.productRestrictions && coupon.productRestrictions.length > 0) {
      if (!coupon.productRestrictions.includes(productId)) {
        return { success: false, error: "이 상품에는 사용할 수 없는 쿠폰입니다." };
      }
    }

    const product = await db.products.findById(productId);
    if (!product) {
      return { success: false, error: "선택한 상품 정보를 찾을 수 없습니다." };
    }

    let discountAmount = 0;
    if (coupon.discountType === "percent") {
      discountAmount = Math.floor((product.price * coupon.discountValue) / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    // 할인액은 원래 가격을 넘을 수 없음
    discountAmount = Math.min(discountAmount, product.price);

    return {
      success: true,
      couponId: coupon.id,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount
    };
  } catch (err: any) {
    return { success: false, error: err.message || "쿠폰 검증 실패" };
  }
}

export interface CreateOrderParams {
  productId: string;
  couponCode?: string;
  chartInputs: Record<string, any>;
  idempotencyKey?: string;
}

/**
 * 주문 정보 원장을 생성하고 결제 제공자의 prepare 단계를 실행합니다.
 */
export async function createOrderAction(params: CreateOrderParams) {
  try {
    const { productId, couponCode, chartInputs, idempotencyKey } = params;

    const user = await getCurrentUser();
    const userId = user ? user.id : null;

    // 멱등성 검사 (동일 멱등키 주문이 있는지)
    if (idempotencyKey) {
      const existing = await db.orders.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        const provider = getPaymentProvider(existing.paymentProvider);
        const prep = await provider.prepare({
          orderId: existing.id,
          amount: existing.amount,
          currency: existing.currency,
          productTitle: (await db.products.findById(existing.productId))?.title || "프리미엄 운세",
          returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/success`,
          failUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/fail`
        });
        return {
          success: true,
          orderId: existing.id,
          amount: existing.amount,
          redirectUrl: prep.redirectUrl,
          paymentToken: prep.paymentToken
        };
      }
    }

    const product = await db.products.findById(productId);
    if (!product || !product.active) {
      return { success: false, error: "구매 가능한 상품이 아닙니다." };
    }

    const latestPrice = await db.priceVersions.findLatestByProductId(productId);
    if (!latestPrice) {
      return { success: false, error: "상품의 유효한 가격 정보가 존재하지 않습니다." };
    }

    // 쿠폰 적용 계산
    let finalAmount = latestPrice.price;
    let appliedCouponId = null;

    if (couponCode) {
      const couponCheck = await validateCouponAction(couponCode, productId);
      if (couponCheck.success && couponCheck.discountAmount) {
        finalAmount -= couponCheck.discountAmount;
        appliedCouponId = couponCheck.couponId || null;
      }
    }

    // 최종 결제금액 하한선 고정
    finalAmount = Math.max(0, finalAmount);

    // 주문서 입력 파라미터를 chartId 컬럼에 직렬화 저장
    const serializedInputs = JSON.stringify(chartInputs);

    const newOrder = await db.orders.create({
      userId,
      productId,
      priceVersionId: latestPrice.id,
      amount: finalAmount,
      currency: latestPrice.currency,
      status: "pending",
      paymentProvider: "mock", // mock 결제 강제 지정
      providerOrderId: null,
      idempotencyKey: idempotencyKey || crypto.randomUUID(),
      chartId: serializedInputs,
      interpretationId: null,
      policyVersion: product.refundPolicyVersion,
      couponId: appliedCouponId,
      refundReason: null,
      refundedAmount: null,
      refundedAt: null,
      paidAt: null,
      cancelledAt: null
    });

    // PG사 결제 준비 호출
    const provider = getPaymentProvider("mock");
    const prep = await provider.prepare({
      orderId: newOrder.id,
      amount: newOrder.amount,
      currency: newOrder.currency,
      productTitle: product.title,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/success`,
      failUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/fail`
    });

    return {
      success: true,
      orderId: newOrder.id,
      amount: newOrder.amount,
      redirectUrl: prep.redirectUrl,
      paymentToken: prep.paymentToken
    };
  } catch (err: any) {
    console.error("createOrderAction error:", err);
    return { success: false, error: err.message || "주문 생성에 실패했습니다." };
  }
}

/**
 * 가상 결제창(Mock Gateway)에서의 모의 사용자 액션을 원자적 수용 처리합니다.
 */
export async function processMockPaymentAction(
  orderId: string,
  token: string,
  actionType: "success" | "low_balance" | "cancel"
) {
  try {
    const order = await db.orders.findById(orderId);
    if (!order) {
      return { success: false, error: "주문 내역을 찾을 수 없습니다." };
    }

    if (order.status !== "pending") {
      return { success: false, error: "이미 결제 승인 처리가 실행된 주문건입니다." };
    }

    if (actionType === "cancel") {
      await db.orders.update(orderId, {
        status: "cancelled",
        cancelledAt: new Date()
      });
      return { success: true, redirectUrl: `/checkout/fail?orderId=${orderId}&reason=USER_CANCEL` };
    }

    if (actionType === "low_balance") {
      await db.orders.update(orderId, {
        status: "failed"
      });
      return { success: true, redirectUrl: `/checkout/fail?orderId=${orderId}&reason=LIMIT_EXCEEDED` };
    }

    // 성공 처리 시뮬레이션:
    // 실제 결제사의 승인을 요청하여 paid 상태로 변환하는 confirm 동작 모사
    const provider = getPaymentProvider("mock");
    const confirmRes = await provider.confirm({
      orderId: order.id,
      amount: order.amount,
      paymentToken: token
    });

    if (confirmRes.success) {
      // 결제 성공 시 웹훅에서도 비동기 생성되지만 브라우저 동기 흐름 보장을 위해 order 상태 변경
      await db.orders.update(orderId, {
        status: "report_generating",
        paidAt: confirmRes.paidAt || new Date(),
        providerOrderId: confirmRes.providerOrderId || null
      });

      return { success: true, redirectUrl: `/checkout/success?orderId=${orderId}` };
    } else {
      await db.orders.update(orderId, {
        status: "failed"
      });
      return { success: false, error: confirmRes.error || "결제 승인 과정에서 반려되었습니다." };
    }
  } catch (err: any) {
    console.error("processMockPaymentAction error:", err);
    return { success: false, error: err.message || "모의 결제 처리 실패" };
  }
}

/**
 * 결제 승인 후 비동기 생성되는 리포트의 생성 완료 여부를 감지하기 위해 상태를 조회합니다.
 */
export async function checkOrderStatusAction(orderId: string) {
  try {
    const order = await db.orders.findById(orderId);
    if (!order) {
      return { success: false, error: "주문 내역을 찾을 수 없습니다." };
    }
    return {
      success: true,
      status: order.status,
      interpretationId: order.interpretationId
    };
  } catch (err: any) {
    return { success: false, error: err.message || "주문 상태 조회 실패" };
  }
}

/**
 * 사용자 환불 요청을 처리합니다. 생성이 완료된 유료 해석 리포트는 환불이 거절됩니다.
 */
export async function requestRefundAction(orderId: string, reason: string) {
  try {
    const user = await getCurrentUser();

    const order = await db.orders.findById(orderId);
    if (!order) {
      return { success: false, error: "주문 내역을 찾을 수 없습니다." };
    }

    // 소유권 검증 (회원인 경우 본인 주문만 환불 가능)
    if (order.userId && (!user || order.userId !== user.id)) {
      return { success: false, error: "해당 주문을 수정할 권한이 없습니다." };
    }

    if (order.status === "refunded") {
      return { success: false, error: "이미 환불 승인 처리가 완료된 주문입니다." };
    }

    // [콘텐츠 환불 원칙]: 생성 완료된 리포트는 환불 불가
    if (order.status === "completed" && order.interpretationId) {
      return { success: false, error: "이미 결과 생성이 완료된 운세 리포트는 디지털 상품 특성상 환불이 불가합니다." };
    }

    const provider = getPaymentProvider(order.paymentProvider);
    const refundRes = await provider.refund({
      providerOrderId: order.providerOrderId || "mock_order_id",
      amount: order.amount,
      reason: reason || "사용자 요청 환불"
    });

    if (refundRes.success) {
      await db.orders.update(orderId, {
        status: "refunded",
        refundReason: reason,
        refundedAmount: refundRes.refundedAmount,
        refundedAt: refundRes.refundedAt
      });
      return { success: true };
    } else {
      return { success: false, error: refundRes.error || "가상 PG사 환불 승인에 실패했습니다." };
    }
  } catch (err: any) {
    console.error("requestRefundAction error:", err);
    return { success: false, error: err.message || "환불 처리 실패" };
  }
}
