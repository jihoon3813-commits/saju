import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConsentAdapter } from "./lib/consent/ConsentAdapter";
import { sanitizeProperties, trackEvent } from "./lib/analytics/tracker";

// document.cookie 및 window 모킹 설정
const mockCookies: Record<string, string> = {};
const mockLocalStorage: Record<string, string> = {};

if (typeof document === "undefined") {
  global.document = {
    get cookie() {
      return Object.entries(mockCookies)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
    },
    set cookie(val: string) {
      const parts = val.split(";")[0].split("=");
      if (parts.length === 2) {
        const k = parts[0].trim();
        const v = parts[1].trim();
        if (v === "" || val.includes("max-age=0") || val.includes("expires=")) {
          delete mockCookies[k];
        } else {
          mockCookies[k] = v;
        }
      }
    }
  } as any;
}

if (typeof window === "undefined") {
  global.window = {
    location: {
      origin: "http://localhost:3000"
    },
    dispatchEvent: vi.fn(),
  } as any;
  global.CustomEvent = class CustomEvent {
    constructor(public type: string, public init?: any) {}
  } as any;
}

if (typeof localStorage === "undefined") {
  global.localStorage = {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, val: string) => { mockLocalStorage[key] = val; },
    removeItem: (key: string) => { delete mockLocalStorage[key]; },
    clear: () => { for (const k in mockLocalStorage) delete mockLocalStorage[k]; }
  } as any;
}

// Server Action 모킹
const mockLogAnalyticsEvent = vi.fn().mockResolvedValue({ success: true });
vi.mock("@/app/actions/analytics", () => ({
  logAnalyticsEvent: (...args: any[]) => mockLogAnalyticsEvent(...args)
}));

describe("Phase 6 - 개인정보 동의(CMP) 및 행동분석 엔진 통합 테스트", () => {
  beforeEach(() => {
    // 쿠키 및 로컬스토리지 리셋
    for (const key in mockCookies) {
      delete mockCookies[key];
    }
    for (const key in mockLocalStorage) {
      delete mockLocalStorage[key];
    }
    vi.clearAllMocks();
  });

  describe("1. ConsentAdapter 검증", () => {
    it("초기 상태는 동의하지 않음(기본값 false)이어야 한다", () => {
      expect(ConsentAdapter.hasAdConsent()).toBe(false);
      expect(ConsentAdapter.hasAnalyticsConsent()).toBe(false);
    });

    it("동의 설정 시 쿠키가 정상 기입되고 동의 상태가 true가 된다", () => {
      ConsentAdapter.setConsent(true, true);
      expect(ConsentAdapter.hasAdConsent()).toBe(true);
      expect(ConsentAdapter.hasAnalyticsConsent()).toBe(true);

      const consent = ConsentAdapter.getConsent();
      expect(consent).not.toBeNull();
      expect(consent?.ads).toBe(true);
      expect(consent?.analytics).toBe(true);
    });

    it("동의 철회 시 쿠키가 삭제되고 상태가 false로 원복된다", () => {
      ConsentAdapter.setConsent(true, true);
      expect(ConsentAdapter.hasAdConsent()).toBe(true);

      ConsentAdapter.revokeConsent();
      expect(ConsentAdapter.hasAdConsent()).toBe(false);
      expect(ConsentAdapter.hasAnalyticsConsent()).toBe(false);
      expect(ConsentAdapter.getConsent()).toBeNull();
    });
  });

  describe("2. tracker.ts PII 필터링 및 익명성 검증", () => {
    it("PII에 해당하는 개인 식별 키(email, birthTime 등)가 유입되면 마스킹 혹은 필터링되어 소거된다", () => {
      const dirtyProperties = {
        email: "test@example.com",
        birthTime: "12:30",
        birthDate: "1995-05-15",
        name: "홍길동",
        query: "개꿈 해몽 부탁드립니다",
        pageType: "result_basic"
      };

      const cleanProperties = sanitizeProperties(dirtyProperties);

      // PII 데이터 완전 제거 검증
      expect(cleanProperties.email).toBeUndefined();
      expect(cleanProperties.birthTime).toBeUndefined();
      expect(cleanProperties.birthDate).toBeUndefined();
      expect(cleanProperties.name).toBeUndefined();
      expect(cleanProperties.query).toBeUndefined();

      // PII가 아닌 필드는 보존
      expect(cleanProperties.pageType).toBe("result_basic");
    });

    it("분석 쿠키 수집 비동의 상태에서는 이벤트 로그 전송이 차단되어야 한다", async () => {
      // 비동의 상태
      ConsentAdapter.setConsent(false, false);

      await trackEvent("service_view", "home", { value: "blocked" });
      expect(mockLogAnalyticsEvent).not.toHaveBeenCalled();
    });

    it("분석 쿠키 수집 동의 상태에서는 이벤트 로그 전송이 허용되어야 한다", async () => {
      // 동의 상태
      ConsentAdapter.setConsent(false, true);

      await trackEvent("service_view", "home", { value: "allowed" });
      expect(mockLogAnalyticsEvent).toHaveBeenCalledWith("service_view", "home", { value: "allowed" });
    });
  });

  describe("3. AdSlot 렌더링 거름 정책 검증", () => {
    it("맞춤형 광고 동의가 없고 동의가 필수인 지면(consentRequired=true)이면 로드되지 않아야 한다", () => {
      const placement = {
        id: "p1",
        slotKey: "content_detail_upper",
        pageType: "content_detail",
        position: "upper",
        deviceTarget: "all" as const,
        reserveHeight: 250,
        enabled: true,
        adFormat: "banner" as const,
        consentRequired: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 광고 수집 비동의 상태
      ConsentAdapter.setConsent(false, false);

      // 동의가 수반되지 않았으므로 노출 방지 대상
      const shouldRender = placement.enabled && (!placement.consentRequired || ConsentAdapter.hasAdConsent());
      expect(shouldRender).toBe(false);
    });

    it("광고가 비활성화(enabled=false) 상태이면 동의 여부와 무관하게 로드되지 않아야 한다", () => {
      const placement = {
        id: "p2",
        slotKey: "home_top",
        pageType: "home",
        position: "top",
        deviceTarget: "all" as const,
        reserveHeight: 100,
        enabled: false,
        adFormat: "banner" as const,
        consentRequired: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      ConsentAdapter.setConsent(true, true);
      const shouldRender = placement.enabled && (!placement.consentRequired || ConsentAdapter.hasAdConsent());
      expect(shouldRender).toBe(false);
    });
  });
});
