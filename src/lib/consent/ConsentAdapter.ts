// Phase 6: CMP(개인정보 동의 관리 플랫폼) ConsentAdapter 구현

export interface UserConsent {
  ads: boolean;
  analytics: boolean;
  version: string;
  timestamp: string;
}

const CONSENT_KEY = "user_privacy_consent_v1";
const CURRENT_CONSENT_VERSION = "1.0.0";

export const ConsentAdapter = {
  /**
   * 클라이언트 브라우저 상에 저장된 동의 정보를 획득합니다.
   */
  getConsent(): UserConsent | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as UserConsent;
    } catch (e) {
      console.error("Failed to read user consent:", e);
      return null;
    }
  },

  /**
   * 동의 설정을 기록하거나 갱신합니다.
   */
  setConsent(ads: boolean, analytics: boolean): UserConsent {
    const consent: UserConsent = {
      ads,
      analytics,
      version: CURRENT_CONSENT_VERSION,
      timestamp: new Date().toISOString()
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
        // 스크립트 실행 여부를 갱신하기 위해 동적 커스텀 이벤트 발송
        window.dispatchEvent(new CustomEvent("consent_changed", { detail: consent }));
      } catch (e) {
        console.error("Failed to save user consent:", e);
      }
    }
    return consent;
  },

  /**
   * 동의 내역을 전부 철회(초기화)합니다.
   */
  revokeConsent(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(CONSENT_KEY);
        window.dispatchEvent(new CustomEvent("consent_changed", { detail: null }));
      } catch (e) {
        console.error("Failed to revoke user consent:", e);
      }
    }
  },

  /**
   * 아직 동의 여부가 설정되지 않았는지 여부를 판별합니다.
   */
  isConsentRequired(): boolean {
    return this.getConsent() === null;
  },

  /**
   * 광고 및 맞춤형 트래킹 쿠키 동의 여부를 확인합니다.
   */
  hasAdConsent(): boolean {
    const consent = this.getConsent();
    return consent ? consent.ads === true : false;
  },

  /**
   * 웹 트래픽 분석(Analytics) 쿠키 동의 여부를 확인합니다.
   */
  hasAnalyticsConsent(): boolean {
    const consent = this.getConsent();
    return consent ? consent.analytics === true : false;
  }
};
