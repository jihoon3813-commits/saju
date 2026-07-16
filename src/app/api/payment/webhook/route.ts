import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payment/MockPaymentProvider";
import { getManseChartAction } from "@/app/actions/manse";
import { InterpretationRuleRepository } from "@/lib/ai/rules";
import { InterpretationRequestBuilder } from "@/lib/ai/prompts";
import { AIProviderAdapter } from "@/lib/ai/provider";
import { StructuredOutputParser } from "@/lib/ai/validator";
import { RuleBasedFallback } from "@/lib/ai/fallback";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  let webhookLogId = "";
  try {
    const rawBody = await req.text();
    const headers = req.headers;
    const signature = headers.get("x-webhook-signature") || "";

    const payload = JSON.parse(rawBody);
    const { orderId, providerOrderId, amount, status } = payload;

    // 1. 웹훅 수신 로그 기록 (미처리 상태)
    const createdLog = await db.webhookLogs.create({
      provider: "mock",
      payload: rawBody,
      signature,
      processed: false,
      errorMessage: null
    });
    webhookLogId = createdLog.id;

    // 2. 가상 PG 웹훅 서명 검증
    const provider = getPaymentProvider("mock");
    const isSigValid = provider.verifyWebhookSignature(rawBody, signature);
    if (!isSigValid) {
      throw new Error("유효하지 않은 웹훅 서명입니다.");
    }

    // 3. 주문서 조회
    const order = await db.orders.findById(orderId);
    if (!order) {
      throw new Error(`주문서 ${orderId}를 찾을 수 없습니다.`);
    }

    // 4. 멱등성 검사 (이미 결제 승인 완료되었거나 해석 생성 단계인 경우 성공 응답 반환 후 종료)
    if (["paid", "report_generating", "completed"].includes(order.status)) {
      await db.webhookLogs.update(webhookLogId, { processed: true });
      return NextResponse.json({ success: true, message: "이미 처리 완료된 주문입니다." });
    }

    // 5. 결제 금액 변조 대조 검사
    if (order.amount !== amount) {
      throw new Error(`결제액 불일치: 주문금액 ${order.amount}원 vs 실결제액 ${amount}원`);
    }

    // 6. 주문 상태를 결제 승인 및 해석 생성 중 상태로 원자적 이동
    await db.orders.update(orderId, {
      status: "report_generating",
      paidAt: new Date(),
      providerOrderId
    });

    // 7. 사용 쿠폰 처리 원자적 갱신 및 기록
    if (order.couponId) {
      const couponIncremented = await db.coupons.incrementUsedCount(order.couponId);
      if (couponIncremented) {
        await db.couponUses.create({
          couponId: order.couponId,
          orderId: order.id,
          userId: order.userId
        });
      } else {
        console.warn(`쿠폰 ${order.couponId}의 최대 사용 한도가 이미 도달했습니다. 주문 처리를 계속 진행합니다.`);
      }
    }

    // 8. 백그라운드 비동기 AI 프리미엄 리포트 생성 가동 (Response 차단 회피)
    triggerPremiumReportGeneration(orderId).catch((err) => {
      console.error(`비동기 프리미엄 리포트 생성 오류 (주문 ${orderId}):`, err);
    });

    // 9. 웹훅 수신 로그 완료 처리
    await db.webhookLogs.update(webhookLogId, { processed: true });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("웹훅 처리 중 오류가 발생했습니다:", err);
    if (webhookLogId) {
      await db.webhookLogs.update(webhookLogId, {
        processed: false,
        errorMessage: err.message || "알 수 없는 에러"
      });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

/**
 * 특정 주문건에 대해 사주 만세력 계산 및 Gemini AI 프리미엄 해석서를 비동기 생성합니다.
 */
export async function triggerPremiumReportGeneration(orderId: string) {
  try {
    const order = await db.orders.findById(orderId);
    if (!order) return;

    const product = await db.products.findById(order.productId);
    if (!product) {
      await db.orders.update(orderId, { status: "failed" });
      return;
    }

    // chartId 필드에 저장된 직렬화 JSON 파라미터 파싱
    const inputs = JSON.parse(order.chartId || "{}");
    const { profileId, profileId2, question, year } = inputs;

    if (!profileId) {
      await db.orders.update(orderId, { status: "failed" });
      return;
    }

    // 만세력 계산
    const chartRes1 = await getManseChartAction({ profileId });
    if (!chartRes1.success || !chartRes1.chart) {
      await db.orders.update(orderId, { status: "failed" });
      return;
    }
    const chart1 = chartRes1.chart;

    let chart2;
    if (product.productType === "compatibility" && profileId2) {
      const chartRes2 = await getManseChartAction({ profileId: profileId2 });
      if (chartRes2.success && chartRes2.chart) {
        chart2 = chartRes2.chart;
      }
    }

    const activeCodes1 = InterpretationRuleRepository.getActiveEvidenceCodes(chart1);
    const activeCodes2 = chart2 ? InterpretationRuleRepository.getActiveEvidenceCodes(chart2) : [];

    // 프리미엄 맞춤형 프롬프트 조립
    const { prompt, systemInstruction } = InterpretationRequestBuilder.buildPremiumPrompt(
      product.productType,
      chart1,
      activeCodes1,
      chart2,
      activeCodes2,
      { question, year }
    );

    let attempts = 0;
    let validatedData = null;
    let success = false;
    let modelName = "gemini-2.5-flash";
    let isFallback = false;

    // 최대 3회 AI 구조파싱 생성 및 검증 시도
    while (attempts < 3 && !success) {
      try {
        const aiResponse = await AIProviderAdapter.generate(prompt, systemInstruction);
        modelName = aiResponse.model;

        const validation = StructuredOutputParser.parseAndValidate(
          aiResponse.text,
          activeCodes1,
          chart1.calculationBasis.unknownBirthTime,
          activeCodes2,
          chart2?.calculationBasis.unknownBirthTime
        );

        if (validation.success && validation.data) {
          validatedData = validation.data;
          success = true;
        } else {
          attempts++;
        }
      } catch (err) {
        attempts++;
      }
    }

    // 3회 모두 실패 시 룰 기반 폴백으로 대체 구제
    if (!success || !validatedData) {
      validatedData = RuleBasedFallback.generate(
        product.productType === "compatibility" ? "compatibility" : "basic-saju",
        chart1,
        chart2
      );
      isFallback = true;
      modelName = "deterministic-rule-fallback";
    }

    // 해석 결과 DB 영구 보존 스냅샷 생성
    const rawInputString = JSON.stringify(chart1.normalizedInput) + (chart2 ? JSON.stringify(chart2.normalizedInput) : "");
    const chartHash = crypto.createHash("sha256").update(rawInputString).digest("hex");

    const newInterpretation = await db.interpretations.create({
      profileId,
      profileId2: profileId2 || null,
      serviceType: product.productType === "compatibility" ? "compatibility" : "basic-saju",
      chartHash,
      reportData: validatedData,
      fallback: isFallback,
      engineVersion: "1.0.0",
      ruleVersion: "1.0.0",
      promptVersion: "1.0.0",
      modelName
    });

    // 주문 완료 기록 갱신 및 AI 해석 스냅샷 바인딩
    await db.orders.update(orderId, {
      status: "completed",
      interpretationId: newInterpretation.id
    });

    console.info(`[프리미엄 리포트 완료] 주문 ID: ${orderId}, 해석서 ID: ${newInterpretation.id}`);
  } catch (err) {
    console.error(`프리미엄 해석 생성 중 치명적 오류 발생 (주문 ${orderId}):`, err);
    await db.orders.update(orderId, { status: "failed" });
  }
}
