import { describe, it, expect } from "vitest";
import { GOLDEN_CASES } from "./goldenCases";
import { calculateManseChart } from "../lib/manse/fourPillarsCalculator";
import { Solar, Lunar } from "lunar-javascript";

describe("Phase 3 - 만세력 및 명리학 연산 엔진 통합 골든 테스트", () => {
  
  // 1. 82개 골든 케이스 자동 순회 정합성 대조
  GOLDEN_CASES.forEach((tc) => {
    it(`[${tc.category}] ${tc.id}: ${tc.description}`, () => {
      // 엔진 기동
      const result = calculateManseChart(tc.input);

      // 공통 검증: 리턴값 구조 유효성
      expect(result).toBeDefined();
      expect(result.pillars).toBeDefined();
      expect(result.calculationBasis.engineVersion).toBe("1.0.0");

      // 특정 기대값 대조
      if (tc.expected.year) {
        const pStr = result.pillars.year.stem + result.pillars.year.branch;
        expect(pStr).toBe(tc.expected.year);
      }
      
      if (tc.expected.month) {
        const pStr = result.pillars.month.stem + result.pillars.month.branch;
        expect(pStr).toBe(tc.expected.month);
      }

      if (tc.expected.day) {
        const pStr = result.pillars.day.stem + result.pillars.day.branch;
        expect(pStr).toBe(tc.expected.day);
      }

      if (tc.expected.hour === null) {
        expect(result.pillars.hour).toBeNull();
        expect(result.hiddenStems.hour).toBeNull();
        expect(result.tenGods.hour).toBeNull();
      } else if (tc.expected.hour) {
        const pStr = result.pillars.hour!.stem + result.pillars.hour!.branch;
        expect(pStr).toBe(tc.expected.hour);
      }

      // 음양력 역변환 및 교차검증 날짜 대조
      if (tc.expected.solarDateEquivalent) {
        expect(result.calculationBasis.solarDate).toBe(tc.expected.solarDateEquivalent);
      }
    });
  });

  // 2. 추가적인 도메인 규칙 단위 테스트
  it("음양오행 합산 분포 검증", () => {
    // 1995-10-24 12:30 (8자 사주 원국)
    const result = calculateManseChart({
      alias: "오행합산테스트",
      genderRuleOption: "male",
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
      useTrueSolarTime: false,
      borderTimeRule: "23"
    });

    const sum = 
      result.elementsDistribution.wood +
      result.elementsDistribution.fire +
      result.elementsDistribution.earth +
      result.elementsDistribution.metal +
      result.elementsDistribution.water;

    // 4주 8자이므로 오행 요소 합은 반드시 8개여야 함
    expect(sum).toBe(8);

    // 음 기운과 양 기운의 합산도 4주 8자이므로 8이어야 함
    expect(result.yinYang.yang + result.yinYang.yin).toBe(8);
  });

  it("시간 미상일 시 오행 합산 분포 검증 (6자 사주 원국)", () => {
    const result = calculateManseChart({
      alias: "시간미상오행테스트",
      genderRuleOption: "female",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-10-24",
      birthTime: null,
      unknownBirthTime: true,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      useTrueSolarTime: false,
      borderTimeRule: "23"
    });

    const sum = 
      result.elementsDistribution.wood +
      result.elementsDistribution.fire +
      result.elementsDistribution.earth +
      result.elementsDistribution.metal +
      result.elementsDistribution.water;

    // 시주가 배제되어 3주 6자이므로 오행 요소 합은 반드시 6개여야 함
    expect(sum).toBe(6);
    expect(result.yinYang.yang + result.yinYang.yin).toBe(6);
  });

  it("음력 변환 윤달 예외 처리 에러 바운더리 검증", () => {
    // 존재하지 않는 음력 윤달인 1995년 윤2월 생성 시도
    expect(() => {
      calculateManseChart({
        alias: "실패식별",
        genderRuleOption: "male",
        calendarType: "lunar",
        lunarLeapMonth: true, // 1995년은 윤8월만 존재하므로 윤2월은 에러를 내야 함
        birthDate: "1995-02-15",
        birthTime: "12:00",
        unknownBirthTime: false,
        birthCountry: "대한민국",
        birthCity: "서울",
        timezone: "Asia/Seoul",
        latitude: 37.5665,
        longitude: 126.9780,
        useTrueSolarTime: false,
        borderTimeRule: "23"
      });
    }).toThrow("입력하신 음력 날짜(혹은 윤달)가 해당 연도 범위 내에 존재하지 않습니다.");
  });

  it("진태양시 경도차 보정에 따른 시간 가감 대조", () => {
    // 서울 기준 경도 126.9780
    // 경도차 = (126.9780 - 135) * 4 = -32.088분 = 약 -32분 5초
    // 1995-10-24 12:15생 (양력) -> 표준 오프셋 9시간 기준 UTC 계산 후 12:15 대비 진태양시 적용 시 약 16분 전후 시점 감축(경도-32분 + 균시차+16분) 발생
    const rawResult = calculateManseChart({
      alias: "태양시보정테스트",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-10-24",
      birthTime: "12:15",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      useTrueSolarTime: true, // 보정 켜기
      borderTimeRule: "23"
    });

    expect(rawResult.calculationBasis.solarTimeAdjusted).toBe(true);
    expect(rawResult.calculationBasis.trueSolarTime).not.toBeNull();
    
    // 진태양시 값 추출
    const trueSolarTimeStr = rawResult.calculationBasis.trueSolarTime!;
    const [, timePart] = trueSolarTimeStr.split(" ");
    const [h, m] = timePart.split(":").map(Number);
    
    // 서울은 동경 135도 표준자오선보다 서쪽에 있으므로, 태양시는 표준시(12:15)보다 대략 16분 정도 느려져서 11시 59분대가 되어야 함.
    expect(h).toBe(11);
    expect(m).toBeGreaterThanOrEqual(50);
    expect(m).toBeLessThanOrEqual(59);
  });
});
