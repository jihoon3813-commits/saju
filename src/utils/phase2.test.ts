import { describe, it, expect, beforeEach } from "vitest";
import { FortuneInputSchema } from "../schemas/fortune";
import { hashPassword, verifyPassword } from "./hash";
import { jsonDb } from "../lib/db/jsonDb";

describe("Phase 2 — DTO 스키마 및 유효성 검증 테스트", () => {
  
  it("유효한 양력 사주 정보는 유효성 검증을 통과한다", () => {
    const validSolar = {
      alias: "테스터",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-10-24",
      birthTime: "12:30",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      genderRuleOption: "male",
      calculationPreference: {
        useTrueSolarTime: false,
        borderTimeRule: "23"
      },
      topicPriority: ["종합", "재물"]
    };

    const res = FortuneInputSchema.safeParse(validSolar);
    expect(res.success).toBe(true);
  });

  it("존재하지 않는 날짜(예: 2월 30일)는 검증에서 차단된다", () => {
    const invalidDate = {
      alias: "에러테스터",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-02-30", // 2월 30일은 없음
      birthTime: "12:30",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      genderRuleOption: "male",
      calculationPreference: {
        useTrueSolarTime: false,
        borderTimeRule: "23"
      },
      topicPriority: ["종합"]
    };

    const res = FortuneInputSchema.safeParse(invalidDate);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors[0].message).toContain("존재하지 않는 날짜");
    }
  });

  it("미래의 생년월일은 입력을 제한 차단한다", () => {
    const futureDate = {
      alias: "미래인",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "2045-12-31", // 미래 날짜 (테스트 기준 2026년보다 미래)
      birthTime: "12:30",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      genderRuleOption: "male",
      calculationPreference: {
        useTrueSolarTime: false,
        borderTimeRule: "23"
      },
      topicPriority: ["종합"]
    };

    const res = FortuneInputSchema.safeParse(futureDate);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors[0].message).toContain("미래의 날짜는 입력할 수 없습니다");
    }
  });

  it("음력 생일 입력 시 윤달 지정이 누락되면 차단된다", () => {
    const missingLeap = {
      alias: "음력테스터",
      calendarType: "lunar",
      lunarLeapMonth: null, // 음력인데 윤달 여부가 null
      birthDate: "1997-03-15",
      birthTime: "06:15",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "부산",
      timezone: "Asia/Seoul",
      latitude: 35.1796,
      longitude: 129.0756,
      genderRuleOption: "female",
      calculationPreference: {
        useTrueSolarTime: false,
        borderTimeRule: "23"
      },
      topicPriority: ["종합"]
    };

    const res = FortuneInputSchema.safeParse(missingLeap);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors[0].message).toContain("윤달 여부를 선택");
    }
  });

  it("출생시간 모름(unknownBirthTime) 체크 시 시간 정보가 null로 강제 정규화된다", () => {
    const unknownTimeInput = {
      alias: "시간모름",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-10-24",
      birthTime: "12:30", // 시간은 쓰여있으나
      unknownBirthTime: true, // 시간을 모른다고 명시적으로 체크
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      genderRuleOption: "male",
      calculationPreference: {
        useTrueSolarTime: false,
        borderTimeRule: "23"
      },
      topicPriority: ["종합"]
    };

    const res = FortuneInputSchema.safeParse(unknownTimeInput);
    expect(res.success).toBe(true);
    if (res.success) {
      // transform에 의해 birthTime이 null로 자동 정돈됨을 증명
      expect(res.data.birthTime).toBeNull();
    }
  });
});

describe("Phase 2 — 데이터베이스 소유권 검증 및 세션 격리 테스트", () => {
  let mockUserId1: string;
  let mockUserId2: string;
  let mockAnonSessionId: string;

  beforeEach(async () => {
    // 테스트용 임의 고유식별자 수립
    mockUserId1 = crypto.randomUUID();
    mockUserId2 = crypto.randomUUID();
    mockAnonSessionId = crypto.randomUUID();
  });

  it("해시 비밀번호는 verifyPassword를 통해 성공적으로 검증된다", () => {
    const plain = "mySecretPassword123";
    const hashed = hashPassword(plain);
    
    expect(verifyPassword(plain, hashed)).toBe(true);
    expect(verifyPassword("wrongPassword", hashed)).toBe(false);
  });

  it("비회원 임시 세션 프로필은 독립적으로 적재되고 다른 회원에게 노출되지 않는다", async () => {
    // 1. 비회원 프로필 생성
    const anonProfile = await jsonDb.profiles.create({
      userId: null,
      anonymousSessionId: mockAnonSessionId,
      alias: "임시비회원",
      relationship: "self",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1998-05-12",
      birthTime: "08:20",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "인천",
      timezone: "Asia/Seoul",
      latitude: 37.4563,
      longitude: 126.7052,
      genderRuleOption: "unspecified",
      calculationPreference: {
        useTrueSolarTime: false,
        borderTimeRule: "23"
      },
      saveConsent: false
    });

    expect(anonProfile.id).toBeDefined();

    // 2. 다른 회원의 조회 결과에는 해당 프로필이 노출되지 않아야 함
    const user1Profiles = await jsonDb.profiles.findByUserId(mockUserId1);
    expect(user1Profiles.some((p) => p.id === anonProfile.id)).toBe(false);

    // 3. 해당 비회원 세션 ID로만 프로필 조회가 됨을 증명
    const anonProfiles = await jsonDb.profiles.findByAnonymousSessionId(mockAnonSessionId);
    expect(anonProfiles.some((p) => p.id === anonProfile.id)).toBe(true);

    // 테스트 정리용 물리 파기
    if (anonProfile.id) {
      await jsonDb.profiles.hardDelete(anonProfile.id);
    }
  });

  it("로그인 또는 회원가입 후 비회원 세션의 프로필은 회원 계정으로 올바르게 연동 병합된다", async () => {
    // 1. 임시 프로필 생성
    const tempProfile = await jsonDb.profiles.create({
      userId: null,
      anonymousSessionId: mockAnonSessionId,
      alias: "로그인전임시",
      relationship: "self",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1990-01-01",
      birthTime: "00:00",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      genderRuleOption: "male",
      calculationPreference: {
        useTrueSolarTime: false,
        borderTimeRule: "23"
      },
      saveConsent: true
    });

    // 2. 링킹 실행 (비회원 세션 프로필을 mockUserId2 회원의 계정으로 합치기)
    const linkedCount = await jsonDb.profiles.linkAnonymousToUser(mockAnonSessionId, mockUserId2);
    expect(linkedCount).toBeGreaterThanOrEqual(1);

    // 3. 병합 결과 조회 검증
    const linkedProfiles = await jsonDb.profiles.findByUserId(mockUserId2);
    const found = linkedProfiles.find((p) => p.id === tempProfile.id);
    expect(found).toBeDefined();
    expect(found?.userId).toBe(mockUserId2);
    expect(found?.anonymousSessionId).toBeNull();

    // 정리
    if (tempProfile.id) {
      await jsonDb.profiles.hardDelete(tempProfile.id);
    }
  });
});
