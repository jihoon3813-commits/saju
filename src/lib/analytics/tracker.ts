// Phase 6: PII가 배제된 행동 분석 이벤트 수집기 (Client-Side Tracker)

import { ConsentAdapter } from "@/lib/consent/ConsentAdapter";

export interface AnalyticsEvent {
  eventName: string;
  pageType: string;
  properties?: Record<string, any>;
}

// 필터링해야 하는 PII 키 패턴 정의
const PII_KEYS = [
  "name",
  "email",
  "birthdate",
  "birth_date",
  "birthtime",
  "birth_time",
  "birthcountry",
  "birthcity",
  "latitude",
  "longitude",
  "alias",
  "question",
  "content",
  "inputtext",
  "input_text",
  "password",
  "tel",
  "phone",
  "query"
];

/**
 * 전송되는 properties 객체에서 개인 식별 가능 정보(PII)를 강제로 거르고 마스킹합니다.
 */
export function sanitizeProperties(props: Record<string, any> | undefined): Record<string, any> {
  if (!props) return {};
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    const lowerKey = key.toLowerCase();
    
    // PII 키를 포함하고 있다면 마스킹하거나 스킵
    if (PII_KEYS.some((pii) => lowerKey.includes(pii))) {
      continue; 
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeProperties(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * 이벤트를 분석 서버(/api/analytics)로 전송합니다.
 */
export async function trackEvent(eventName: string, pageType: string, properties?: Record<string, any>): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. 개인정보 동의(Analytics 쿠키) 여부 확인
  if (!ConsentAdapter.hasAnalyticsConsent()) {
    console.log(`[Analytics] Track event "${eventName}" blocked due to lack of consent.`);
    return;
  }

  // 2. PII 데이터 필터링 수행
  const cleanProperties = sanitizeProperties(properties);

  // 3. 서버 전송
  try {
    // 동적 모듈 임포트로 클라이언트/서버 빌드 충돌 및 순환 임포트 방지
    const { logAnalyticsEvent } = await import("@/app/actions/analytics");
    await logAnalyticsEvent(eventName, pageType, cleanProperties);
  } catch (err) {
    console.error(`[Analytics] Error tracking event ${eventName}:`, err);
  }
}
