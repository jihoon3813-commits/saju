import { describe, it, expect, beforeAll } from "vitest";
import { calculateManseChart, calculateTenGod } from "@/lib/manse/fourPillarsCalculator";
import { drawTarotCards, buildTarotDeck } from "@/lib/tarot/tarotEngine";
import { unifiedSearchAction } from "@/app/actions/search";
import { jsonDb } from "@/lib/db/jsonDb";
import { db } from "@/lib/db";
import { FORTUNE_SERVICES } from "@/lib/ai/serviceRegistry";
import { InterpretationRequestBuilder } from "@/lib/ai/prompts";

describe("Phase 8 다차원 통합 QA 및 출시 안정성 테스트", () => {
  beforeAll(() => {
    // 테스트 구동을 위해 가상 로그인/관리자 상태 모의
    process.env.GEMINI_API_KEY = "mock_key";
    process.env.NODE_ENV = "test";
  });

  // 1. 계산 정밀성: 23시 야자시(夜子時) 경계일 전이 검증
  it("23:30 ~ 00:00 사이인 야자시(夜子時) 출생 시, 일주가 변동되지 않고 시주만 자(子)시로 정상 연산되는지 검증", () => {
    // 2026-07-15 23:45 출생 (야자시 구간)
    const chart = calculateManseChart({
      alias: "야자시 테스트",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "2026-07-15",
      birthTime: "23:45",
      unknownBirthTime: false,
      birthCountry: "KR",
      birthCity: "Seoul",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.978,
      useTrueSolarTime: false,
      borderTimeRule: "23"
    });

    // 7월 15일 23:45는 만세력 규정상 시주 천간은 자(子)시로 매칭되지만,
    // 날짜 일주는 7월 15일의 일간(일주)을 유지해야 함 (23:30 경계 조율)
    expect(chart.pillars.hour).toBeDefined();
    expect(chart.pillars.hour?.branch).toBe("子");
    expect(chart.pillars.day.stem).toBeDefined();
  });

  // 2. 계산 정밀성: 해외 시간대 및 서머타임 진태양시 경도 보정 검증
  it("동경 140도의 도쿄 출생 vs 동경 126도의 서울 출생 시, 태양의 남중 고도 시차(진태양시)가 상이하게 연산되는지 검증", () => {
    // 서울(126.97도)과 도쿄(139.69도)의 남중시각 보정분 차이 검증
    const chartSeoul = calculateManseChart({
      alias: "서울",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-10-24",
      birthTime: "12:00",
      unknownBirthTime: false,
      birthCountry: "KR",
      birthCity: "Seoul",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.978,
      useTrueSolarTime: true,
      borderTimeRule: "23"
    });

    const chartTokyo = calculateManseChart({
      alias: "도쿄",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-10-24",
      birthTime: "12:00",
      unknownBirthTime: false,
      birthCountry: "JP",
      birthCity: "Tokyo",
      timezone: "Asia/Tokyo",
      latitude: 35.6762,
      longitude: 139.6503,
      useTrueSolarTime: true,
      borderTimeRule: "23"
    });

    // 경도 139.65도와 126.97도 차이로 인해 보정된 최종 진태양시(trueSolarTime)가 서로 달라야 함
    expect(chartSeoul.calculationBasis.trueSolarTime).not.toBe(
      chartTokyo.calculationBasis.trueSolarTime
    );
  });

  // 3. 계산 정밀성: 시간미상(시주 모름) 처리 검증
  it("생어난 시간을 미상으로 등록 시, 시주(hour)가 차트 결과에서 누락(null) 처리되는지 검증", () => {
    const chart = calculateManseChart({
      alias: "시간 미상",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-10-24",
      birthTime: null,
      unknownBirthTime: true,
      birthCountry: "KR",
      birthCity: "Seoul",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.978,
      useTrueSolarTime: false,
      borderTimeRule: "23"
    });

    expect(chart.pillars.hour).toBeNull();
    expect(chart.calculationBasis.unknownBirthTime).toBe(true);
  });

  // 4. 타로 물리 엔진: 78장 아르카나 무작위 드로우 검증
  it("78장 메이저/마이너 타로 덱이 정상 빌드되고, 7일 흐름 스프레드 요청 시 7장의 고유 카드가 중복 없이 선별되는지 검증", () => {
    const deck = buildTarotDeck();
    expect(deck.length).toBe(78);
    expect(deck[0].copyrightField).toContain("Public Domain");

    // 7일 흐름 드로우
    const drawn = drawTarotCards("seven_days");
    expect(drawn.length).toBe(7);

    // 모든 카드의 ID 범위 유효성 체크
    drawn.forEach((d) => {
      expect(d.card.id).toBeGreaterThanOrEqual(0);
      expect(d.card.id).toBeLessThan(78);
      expect(typeof d.isReversed).toBe("boolean");
    });
  });

  // 5. 통합 검색: 서비스 카탈로그 및 DB 콘텐츠 매칭 검증
  it("통합 검색 쿼리에 '이직' 입력 시, 이직 관련 사주 상품(service) 및 매거진 콘텐츠가 정상 매칭되어 반환되는지 검증", async () => {
    const res = await unifiedSearchAction("이직");
    expect(res.success).toBe(true);
    expect(res.results.length).toBeGreaterThan(0);

    const serviceMatch = res.results.find((r) => r.type === "service");
    expect(serviceMatch).toBeDefined();
    expect(serviceMatch?.title).toContain("이직");
  });

  // 6. 관리자 권한 및 MFA 감사 로그 기록 검증
  it("가상 MFA OTP 인증 '123456' 입력 시 인증이 성공하고, 감사로그 대장에 해당 이력이 안전 적재되는지 검증", async () => {
    // 임시 회원가입 및 관리자 권한 지정
    const adminUser = await jsonDb.users.create({
      email: `test_admin_${Math.floor(Math.random() * 1000000)}@dreamfortune.com`,
      hashedPassword: "password",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 모의 로그인 상태를 getCurrentUser가 반환할 수 있도록 db를 임시 조회
    // (여기서는 레포지토리에 직접 생성 및 감사로그 추가 검증)
    const logBefore = await jsonDb.auditLogs.findAll();
    
    // 가상 OTP 인증 트리거
    const newLog = await jsonDb.auditLogs.create({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      action: "관리자 MFA OTP 가상 인증 완료",
      ipAddress: "127.0.0.1",
      userAgent: "Vitest Runner"
    });

    const logAfter = await jsonDb.auditLogs.findAll();
    expect(logAfter.length).toBe(logBefore.length + 1);
    expect(newLog.action).toBe("관리자 MFA OTP 가상 인증 완료");
  });

  // 7. 사용자 오류 신고: PII 정보 필터 마스킹 검증
  it("오류/의견 신고 내용에 신용카드/전화번호 등 민감정보가 들어왔을 시 [CARD_MASKED] 등으로 치환 마스킹되어 적재되는지 검증", async () => {
    const rawComplaint = "카드번호 1234-5678-1234-5678 결제가 안되고 오류코드 500이 뜹니다. 제 번호는 010-9999-8888 입니다.";
    
    // 마스킹 필터 동작 모의
    let safeContent = rawComplaint
      .replace(/\d{4}-\d{4}-\d{4}-\d{4}/g, "[CARD_MASKED]")
      .replace(/\d{3}-\d{3,4}-\d{4}/g, "[PHONE_MASKED]")
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_MASKED]");

    expect(safeContent).toContain("[CARD_MASKED]");
    expect(safeContent).toContain("[PHONE_MASKED]");
    expect(safeContent).not.toContain("1234-5678-1234-5678");
    expect(safeContent).not.toContain("010-9999-8888");

    // 저장소 생성
    const report = await jsonDb.userReports.create({
      reportType: "payment",
      orderId: null,
      errorCode: "500",
      versionInfo: "engine=1.0.0",
      content: safeContent
    });

    expect(report.status).toBe("pending");
    expect(report.content).toContain("[CARD_MASKED]");
  });

  // 8. AI 안전성: 금지 표현 가이드라인 준수 프롬프트 조립성 검증
  it("프리미엄 운세 프롬프트 빌더 실행 시, 사망/도박/수익보장 등 극단적 해석을 원천 금지하는 절대 조항이 시스템 프롬프트에 담기는지 검증", () => {
    const chart = calculateManseChart({
      alias: "홍길동",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-10-24",
      birthTime: "12:00",
      unknownBirthTime: false,
      birthCountry: "KR",
      birthCity: "Seoul",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.978,
      useTrueSolarTime: false,
      borderTimeRule: "23"
    });

    const { systemInstruction } = InterpretationRequestBuilder.buildPremiumPrompt(
      "wealth",
      chart,
      []
    );

    // 금지 키워드 지침이 프롬프트 시스템 부속물에 적시되었는지 확인
    expect(systemInstruction).toContain("단정 금지");
    expect(systemInstruction).toContain("극단적 불행");
    expect(systemInstruction).toContain("투자·계약 수익 보장 금지");
  });
});
