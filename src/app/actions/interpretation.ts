"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { getCurrentUser, getOrCreateAnonymousSession } from "@/lib/auth";
import { getManseChartAction } from "@/app/actions/manse";
import { InterpretationRuleRepository } from "@/lib/ai/rules";
import { InterpretationRequestBuilder, PROMPT_VERSION, RULE_VERSION } from "@/lib/ai/prompts";
import { AIProviderAdapter } from "@/lib/ai/provider";
import { StructuredOutputParser } from "@/lib/ai/validator";
import { RuleBasedFallback } from "@/lib/ai/fallback";

const ENGINE_VERSION = "1.0.0";

export interface GetInterpretationParams {
  profileId: string;
  profileId2?: string; // 궁합용 두번째 프로필 ID (옵션)
  serviceType: "basic-saju" | "today" | "compatibility";
  requestId?: string; // 중복 호출 방지용 식별자
}

/**
 * 특정 프로필과 서비스 타입에 대조되는 AI 운세 분석 보고서를 취득하거나 신규 생성합니다.
 */
export async function getOrCreateInterpretationAction(params: GetInterpretationParams) {
  try {
    const { profileId, profileId2, serviceType } = params;

    // 1. 첫 번째 프로필 조회 및 만세력 계산 (소유권 검증 포함)
    const chartRes1 = await getManseChartAction({ profileId });
    if (!chartRes1.success || !chartRes1.chart) {
      return { success: false, error: chartRes1.error || "첫 번째 대상자의 만세력 계산에 실패했습니다." };
    }
    const chart1 = chartRes1.chart;

    // 2. 두 번째 프로필 조회 및 만세력 계산 (궁합일 때만 적용)
    let chart2;
    if (serviceType === "compatibility") {
      if (!profileId2) {
        return { success: false, error: "궁합 조회를 위해서는 상대방 프로필 ID가 필수적입니다." };
      }
      const chartRes2 = await getManseChartAction({ profileId: profileId2 });
      if (!chartRes2.success || !chartRes2.chart) {
        return { success: false, error: chartRes2.error || "상대방의 만세력 계산에 실패했습니다." };
      }
      chart2 = chartRes2.chart;
    }

    // 3. 만세력 고유 해시 생성 (캐시 검사용)
    let rawInputString = JSON.stringify(chart1.normalizedInput) + (chart2 ? JSON.stringify(chart2.normalizedInput) : "");
    if (serviceType === "today") {
      const kstDateString = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
      rawInputString += `_today_${kstDateString}`;
    }
    const chartHash = crypto.createHash("sha256").update(rawInputString).digest("hex");

    // 4. DB 해석 캐시 체크
    const cachedResult = await db.interpretations.findByQuery(
      profileId,
      serviceType,
      chartHash,
      ENGINE_VERSION,
      RULE_VERSION,
      PROMPT_VERSION
    );

    if (cachedResult) {
      return {
        success: true,
        result: cachedResult,
        isCached: true
      };
    }

    // 5. 캐시 미스 시 AI 파이프라인 가동 준비
    const activeCodes1 = InterpretationRuleRepository.getActiveEvidenceCodes(chart1);
    const activeCodes2 = chart2 ? InterpretationRuleRepository.getActiveEvidenceCodes(chart2) : [];

    const { prompt, systemInstruction } = InterpretationRequestBuilder.buildPrompt(
      serviceType,
      chart1,
      activeCodes1,
      chart2,
      activeCodes2
    );

    let attempts = 0;
    let validatedData = null;
    let success = false;
    let modelName = "gemini-2.5-flash";
    let isFallback = false;

    // 최대 3회 재시도하며 구조적 파싱 및 안심 필터 검증
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
          console.warn(`[AI 재시도 ${attempts}/3] 검증 실패 사유: ${validation.error}`);
        }
      } catch (err) {
        attempts++;
        console.warn(`[AI 재시도 ${attempts}/3] API 통신 실패:`, err);
      }
    }

    // 6. 3회 시도 모두 실패 시 또는 API 인증키 누락 시 규칙 기반 폴백 발동
    if (!success || !validatedData) {
      console.info("Gemini 해석이 실패하여 규칙 기반 요약(Rule-Based Fallback) 모듈로 복구합니다.");
      validatedData = RuleBasedFallback.generate(serviceType, chart1, chart2);
      isFallback = true;
      modelName = "deterministic-rule-fallback";
    }

    // 7. 결과 DB 저장 및 반환
    const newInterpretation = await db.interpretations.create({
      profileId,
      profileId2: profileId2 || null,
      serviceType,
      chartHash,
      reportData: validatedData,
      fallback: isFallback,
      engineVersion: ENGINE_VERSION,
      ruleVersion: RULE_VERSION,
      promptVersion: PROMPT_VERSION,
      modelName
    });

    return {
      success: true,
      result: newInterpretation,
      isCached: false
    };
  } catch (err) {
    const error = err as Error;
    console.error("getOrCreateInterpretationAction error:", error);
    return { success: false, error: error.message || "해석 결과 처리 중 오류가 발생했습니다." };
  }
}

/**
 * 특정 AI 해석 리포트에 대한 한시적 보안 공유 링크를 발급합니다.
 */
export async function createSharedLinkAction(interpretationId: string) {
  try {
    const result = await db.interpretations.findById(interpretationId);
    if (!result) {
      return { success: false, error: "공유할 해석 리포트를 찾을 수 없습니다." };
    }

    // 소유권 검사
    const profile = await db.profiles.findById(result.profileId);
    if (!profile) {
      return { success: false, error: "프로필 데이터를 찾을 수 없습니다." };
    }

    const user = await getCurrentUser();
    const anonSessionId = await getOrCreateAnonymousSession();

    if (profile.userId) {
      if (!user || profile.userId !== user.id) {
        return { success: false, error: "공유 링크를 생성할 권한이 없습니다." };
      }
    } else if (profile.anonymousSessionId) {
      if (profile.anonymousSessionId !== anonSessionId) {
        return { success: false, error: "공유 링크를 생성할 권한이 없습니다. (세션 만료)" };
      }
    }

    // 7일 유효성 부여
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const key = crypto.randomBytes(16).toString("hex");

    const newLink = await db.sharedLinks.create({
      interpretationResultId: interpretationId,
      expiresAt,
      createdSessionId: anonSessionId || (user ? user.id : null),
      key
    });

    return {
      success: true,
      linkId: newLink.id,
      key: newLink.key,
      expiresAt
    };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "공유 링크 발급 중 에러가 발생했습니다." };
  }
}

/**
 * 발급받은 보안 공유 식별자와 키를 기반으로 안전한 요약해석 객체를 취득합니다 (비공개 생년월일 필터링).
 */
export async function getSharedLinkAction(linkId: string, key: string) {
  try {
    const link = await db.sharedLinks.findById(linkId);
    if (!link || link.key !== key) {
      return { success: false, error: "유효하지 않거나 일치하지 않는 공유 키입니다." };
    }

    // 만료 시간 대조
    if (new Date() > link.expiresAt) {
      return { success: false, error: "해당 공유 링크는 유효기간(7일)이 경과되어 만료되었습니다." };
    }

    const result = await db.interpretations.findById(link.interpretationResultId);
    if (!result) {
      return { success: false, error: "연동된 사주 해석 데이터를 찾을 수 없습니다." };
    }

    // 개인 식별 및 민감한 원장 정보는 보안 제거
    const safeReportData = {
      summary: result.reportData.summary,
      highlights: result.reportData.highlights,
      sections: result.reportData.sections,
      timeline: result.reportData.timeline,
      uncertainty: result.reportData.uncertainty,
      safetyFlags: result.reportData.safetyFlags || [],
      engineVersion: result.reportData.engineVersion || "1.0.0",
      ruleVersion: result.reportData.ruleVersion || "1.0.0",
      promptVersion: result.reportData.promptVersion || "1.0.0",
      generatedAt: result.reportData.generatedAt
    };

    return {
      success: true,
      interpretation: {
        id: result.id,
        serviceType: result.serviceType,
        reportData: safeReportData,
        fallback: result.fallback,
        generatedAt: result.generatedAt
      }
    };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message || "공유 링크 조회 중 오류가 발생했습니다." };
  }
}
