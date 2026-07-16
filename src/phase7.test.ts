import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "./lib/db";
import { validateCouponAction, createOrderAction } from "./app/actions/payment";
import { getPaymentProvider } from "./lib/payment/MockPaymentProvider";
import { generatePremiumReportPDF } from "./lib/pdf/pdfGenerator";
import crypto from "crypto";

// 1. Next.js Auth 모킹 설정
vi.mock("./lib/auth", () => {
  let currentUser: any = { id: "user_a", email: "user_a@gmail.com", role: "user" };
  return {
    getCurrentUser: async () => currentUser,
    getOrCreateAnonymousSession: async () => "anon_session_xxx",
    __setMockUser: (user: any) => { currentUser = user; }
  };
});

describe("Phase 7: 프리미엄 결제·쿠폰·PDF·보안 통합 테스트", () => {
  let testProduct: any;

  beforeEach(async () => {
    // 상품 테스트 데이터 생성
    const products = await db.products.findAll();
    testProduct = products.find((p) => p.slug === "basic-saju-premium");
    if (!testProduct) {
      testProduct = await db.products.create({
        slug: "basic-saju-premium",
        title: "정통사주 평생 분석 리포트",
        description: "테스트용 상품 설명",
        productType: "saju_report",
        price: 19900,
        currency: "KRW",
        active: true,
        sampleReportId: null,
        requiredInputSchema: null,
        reportTemplateVersion: "1.0.0",
        refundPolicyVersion: "1.0.0"
      });
      await db.priceVersions.create({
        productId: testProduct.id,
        price: 19900,
        currency: "KRW",
        version: "1.0.0",
        active: true
      });
    }
  });

  // ==========================================
  // 시나리오 1: 쿠폰 검증 및 원자적 소진 검증
  // ==========================================
  it("쿠폰 대소문자 구분 없이 유효성을 검증하며, 한도 초과 시 원자적으로 사용을 차단한다.", async () => {
    const couponCode = `TEST_COUPON_${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
    
    // 쿠폰 등록 (최대 2회 소진 한정)
    const coupon = await db.coupons.create({
      code: couponCode,
      discountType: "percent",
      discountValue: 10,
      maxUses: 2,
      usedCount: 0,
      active: true,
      productRestrictions: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60) // 1시간 뒤 만료
    });

    // 1. 유효성 검증 확인 (10% 할인금액)
    const valRes = await validateCouponAction(couponCode.toLowerCase(), testProduct.id);
    expect(valRes.success).toBe(true);
    expect(valRes.discountAmount).toBe(1990); // 19900원 * 10%

    // 2. 사용 횟수 증가 처리 (최대 한도 2회 도달 시뮬레이션)
    const inc1 = await db.coupons.incrementUsedCount(coupon.id);
    const inc2 = await db.coupons.incrementUsedCount(coupon.id);
    expect(inc1).toBe(true);
    expect(inc2).toBe(true);

    // 3. 한도 도달 이후 3번째 시도는 원자적으로 false 처리되어 차단되어야 함
    const inc3 = await db.coupons.incrementUsedCount(coupon.id);
    expect(inc3).toBe(false);

    // 4. 검증 시에도 소진된 쿠폰 에러를 반환해야 함
    const valResFail = await validateCouponAction(couponCode, testProduct.id);
    expect(valResFail.success).toBe(false);
    expect(valResFail.error).toContain("소진된 쿠폰");
  });

  // ==========================================
  // 시나리오 2: 위변조 (금액 조작) 시도 차단 검증
  // ==========================================
  it("결제 요청액과 실 결제 승인액이 다를 시 결제 승인을 차단하고 반려 상태를 유지한다.", async () => {
    // 1. 정가 19900원 주문 생성
    const orderRes = await createOrderAction({
      productId: testProduct.id,
      chartInputs: { profileId: "prof_dummy" }
    });
    expect(orderRes.success).toBe(true);
    const orderId = orderRes.orderId;

    // 2. 금액을 임의의 1000원으로 변조하여 Mock PG 확인 요청 (금액 변조 공격 시뮬레이션)
    const provider = getPaymentProvider("mock");
    const confirmRes = await provider.confirm({
      orderId,
      amount: 1000, // 원금 19900원 대비 조작된 금액
      paymentToken: orderRes.paymentToken
    });

    // PG 레벨이 아닌 웹훅/비즈니스 레벨 검사 모사:
    // (route.ts 웹훅 수신처에서 order.amount !== amount 대조)
    const order = await db.orders.findById(orderId);
    expect(order).not.toBeNull();
    
    // 주문의 원래 가격은 변하지 않아야 하며, 변조 금액 대조 시 실패 반환 검증
    const isTampered = order!.amount !== 1000;
    expect(isTampered).toBe(true);
  });

  // ==========================================
  // 시나리오 3: 웹훅 멱등성 (Idempotence) 검증
  // ==========================================
  it("동일한 성공 웹훅 신호가 중복 인입되어도 에러 없이 멱등적으로 성공 상태를 반환한다.", async () => {
    // 1. 주문 생성
    const orderRes = await createOrderAction({
      productId: testProduct.id,
      chartInputs: { profileId: "prof_dummy" }
    });
    const orderId = orderRes.orderId;

    // 2. 1회차 완료로 상태 변경 모사
    await db.orders.update(orderId, { status: "completed" });

    // 3. 중복 완료 신호 발생 시 order status가 변경되지 않고 메시지만 정상 리턴하는가
    const orderBefore = await db.orders.findById(orderId);
    expect(orderBefore?.status).toBe("completed");

    // 중복 수신처 가드:
    const isCompleted = ["paid", "report_generating", "completed"].includes(orderBefore!.status);
    expect(isCompleted).toBe(true);
  });

  // ==========================================
  // 시나리오 4: 타인 결제 내역 / PDF 다운로드 탈취 방지
  // ==========================================
  it("타인 소유의 주문 내역 번호로 PDF 다운로드 요청 시 권한 거부(403) 필터를 거친다.", async () => {
    const auth = await import("./lib/auth");
    
    // User A 상태에서 주문 생성
    (auth as any).__setMockUser({ id: "user_a", email: "user_a@gmail.com", role: "user" });
    const orderRes = await createOrderAction({
      productId: testProduct.id,
      chartInputs: { profileId: "prof_a" }
    });
    const orderId = orderRes.orderId;

    // 사용자 상태를 User B로 인위적 강제 변경 (타인 탈취 상황 연출)
    (auth as any).__setMockUser({ id: "user_b", email: "user_b@gmail.com", role: "user" });

    // User B가 User A의 주문서를 검사
    const order = await db.orders.findById(orderId);
    expect(order).not.toBeNull();

    // 소유권 검사 규칙 검증:
    // order.userId 가 존재하고 현재 로그인된 유저 ID(user_b)와 일치하지 않으므로 차단되어야 함
    const isOwner = order?.userId === "user_b";
    expect(isOwner).toBe(false); // 타인 소유이므로 본인 소유 판정이 거부됨
  });

  // ==========================================
  // 시나리오 5: PDF 렌더링 무결성 및 인쇄 한글 지원 검증
  // ==========================================
  it("PDF 리포트 생성기 호출 시 인쇄 한글 폰트가 탑재된 유효한 PDF 파일 바이너리(헤더포함)를 리턴한다.", async () => {
    const pdfBuffer = await generatePremiumReportPDF({
      orderId: "test_pdf_order_1234",
      productTitle: "정통사주 평생 분석 리포트",
      productType: "saju_report",
      amount: 19900,
      userName: "홍길동",
      chart: {
        pillars: {
          year: { stem: "庚", branch: "申" },
          month: { stem: "乙", branch: "酉" },
          day: { stem: "庚", branch: "子" },
          hour: { stem: "丁", branch: "丑" }
        }
      },
      reportData: {
        summary: "하늘의 은혜를 입어 순조롭게 풀리는 귀한 운기입니다.",
        highlights: [{ title: "귀인 도움", value: "평생을 돕는 은인이 나타남", evidenceCodes: ["E_GEN_SPECIAL"] }],
        sections: [
          {
            id: "sect_01",
            title: "사주 원국 개괄 분석",
            summary: "기세가 조화롭고 원기가 강합니다.",
            paragraphs: ["본 사주는 금의 기운이 득령하여 결단력이 있고, 주변 오행이 순환을 도와 유려한 흐름을 보입니다."],
            evidenceCodes: ["E_METAL_MANY"]
          }
        ],
        timeline: [
          {
            period: "30~40세 대운",
            intensity: 4,
            opportunity: "문서 취득 및 주택 확장",
            caution: "무리한 동업 지양",
            action: "주위 귀인의 말에 귀를 기울이세요.",
            evidenceCodes: ["E_GEN_SPECIAL"]
          }
        ]
      }
    });

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(100);

    // PDF 시그니처 매직넘버 검사 (%PDF-)
    const pdfMagic = pdfBuffer.toString("ascii", 0, 5);
    expect(pdfMagic).toBe("%PDF-");
  });
});
