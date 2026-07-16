import { describe, it, expect } from "vitest";
import { InterpretationRuleRepository } from "../lib/ai/rules";
import { StructuredOutputParser } from "../lib/ai/validator";
import { RuleBasedFallback } from "../lib/ai/fallback";
import { ChartResult } from "../lib/manse/types";

// 모의 ChartResult 생성기
function createMockChart(overrides: Partial<ChartResult> = {}): ChartResult {
  return {
    normalizedInput: {
      alias: "테스터",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-10-24",
      birthTime: "12:30",
      unknownBirthTime: false,
      timezone: "Asia/Seoul"
    },
    calculationBasis: {
      timezone: "Asia/Seoul",
      solarDate: "1995-10-24",
      utcOffsetMinutes: 540,
      solarTimeAdjusted: false,
      trueSolarTime: "12:30",
      dayBoundaryRule: "23",
      unknownBirthTime: false,
      engineVersion: "1.0.0",
      ruleSetVersion: "1.0.0",
      calculationTimestamp: new Date().toISOString()
    },
    pillars: {
      year: { stem: "乙", branch: "亥" },
      month: { stem: "丙", branch: "戌" },
      day: { stem: "己", branch: "亥" },
      hour: { stem: "庚", branch: "午" }
    },
    elementsDistribution: {
      wood: 1,
      fire: 2,
      earth: 1,
      metal: 1,
      water: 3 // 수(Water) 과다 유도
    },
    yinYang: { yang: 4, yin: 4 },
    hiddenStems: {
      year: ["壬", "甲"],
      month: ["辛", "丁", "戊"],
      day: ["壬", "甲"],
      hour: ["丙", "己", "丁"]
    },
    tenGods: {
      year: { stem: "편관", branch: "정관" },
      month: { stem: "정인", branch: "겁재" },
      day: { branch: "정재" },
      hour: { stem: "상관", branch: "편인" }
    },
    relations: {
      stemCombinations: [],
      stemClashes: [],
      branchCombinations: ["해묘미"],
      branchClashes: [],
      punishments: [],
      harms: [],
      destructions: []
    },
    luckCycles: {
      direction: "forward",
      startAge: 5,
      cycles: []
    },
    annualLuck: [],
    ...overrides
  } as unknown as ChartResult;
}

describe("Phase 4 - AI 운세 해석서 생성, 검증 및 폴백 통합 테스트", () => {

  // 1. 사주 규칙 도출 검증
  it("명리 규칙 도출: 오행 과다와 지지 관계성 코드를 정상 판독한다", () => {
    const chart = createMockChart({
      elementsDistribution: { wood: 0, fire: 1, earth: 1, metal: 3, water: 3 }, // 목 결핍, 금 과다, 수 과다
    });
    const codes = InterpretationRuleRepository.getActiveEvidenceCodes(chart);
    const codeIds = codes.map(c => c.code);

    expect(codeIds).toContain("E_WOOD_LACK");
    expect(codeIds).toContain("E_METAL_MANY");
    expect(codeIds).toContain("E_WATER_MANY");
    expect(codeIds).toContain("E_STEM_DAY_KI"); // 일간 己
    expect(codeIds).toContain("E_BRANCH_COMB"); // branchCombinations 존재
  });

  // 2. 구조화 파싱 및 검증 통과 케이스
  it("정상 JSON 응답: 스키마 및 모든 보안 검증 장치를 정상 통과한다", () => {
    const chart = createMockChart();
    const activeCodes = InterpretationRuleRepository.getActiveEvidenceCodes(chart);
    const validJsonText = `
    {
      "summary": "안정감 있는 오행 조율이 필요한 사주입니다.",
      "highlights": [
        { "title": "중심 성향", "value": "기토 일주 본연의 실속과 생산성", "evidenceCodes": ["E_STEM_DAY_KI"] }
      ],
      "sections": [
        {
          "id": "identity",
          "title": "본인 성향 분석",
          "summary": "유연성과 대인 친화력이 돋보이는 기류",
          "paragraphs": ["신중하면서도 사람들과의 연대감이 뛰어난 기토(己) 일간입니다."],
          "evidenceCodes": ["E_STEM_DAY_KI", "E_BRANCH_COMB"],
          "positiveSignals": ["대인관계 유대감 양호"],
          "cautionSignals": ["생각 과다로 인한 결정 지연"],
          "actions": ["오늘의 생각 3줄로 축약하기"]
        }
      ],
      "timeline": [
        { "period": "대운", "intensity": 3, "opportunity": "기회 포착", "caution": "조율 필요", "action": "성실 이행", "evidenceCodes": ["E_STEM_DAY_KI"] }
      ],
      "uncertainty": [],
      "safetyFlags": [],
      "engineVersion": "1.0.0",
      "ruleVersion": "1.0.0",
      "promptVersion": "1.0.0",
      "generatedAt": "${new Date().toISOString()}"
    }
    `;

    const result = StructuredOutputParser.parseAndValidate(
      validJsonText,
      activeCodes,
      chart.calculationBasis.unknownBirthTime
    );

    expect(result.success).toBe(true);
    expect(result.data?.summary).toBe("안정감 있는 오행 조율이 필요한 사주입니다.");
  });

  // 3. 비활성 근거 코드 날조 탐지 검증
  it("근거 위조 차단: 원국에 존재하지 않는 사주 코드를 주장하면 파서가 감지해 차단한다", () => {
    const chart = createMockChart({
      elementsDistribution: { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 } // 화 과다가 아님
    });
    const activeCodes = InterpretationRuleRepository.getActiveEvidenceCodes(chart);
    
    // AI가 억지로 E_FIRE_MANY (화 과다) 코드를 사용함
    const forgedJsonText = `
    {
      "summary": "화 기운이 넘쳐나는 에너제틱 사주",
      "highlights": [
        { "title": "과적 요소", "value": "불의 성정이 폭발함", "evidenceCodes": ["E_FIRE_MANY"] }
      ],
      "sections": [
        {
          "id": "identity",
          "title": "성향",
          "summary": "불의 에너지",
          "paragraphs": ["과도한 불이 에너지를 만듭니다."],
          "evidenceCodes": ["E_FIRE_MANY"],
          "positiveSignals": [],
          "cautionSignals": [],
          "actions": []
        }
      ],
      "timeline": [],
      "uncertainty": [],
      "safetyFlags": [],
      "engineVersion": "1.0.0",
      "ruleVersion": "1.0.0",
      "promptVersion": "1.0.0",
      "generatedAt": "${new Date().toISOString()}"
    }
    `;

    const result = StructuredOutputParser.parseAndValidate(
      forgedJsonText,
      activeCodes,
      chart.calculationBasis.unknownBirthTime
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("명리학적 데이터 근거(Evidence Codes) 조작");
  });

  // 4. 금지 표현 및 공포 조장 차단 검증
  it("금지 표현 차단: 극단적인 예언 단어가 응답에 섞여 있으면 안전 검증이 감지해 차단한다", () => {
    const chart = createMockChart();
    const activeCodes = InterpretationRuleRepository.getActiveEvidenceCodes(chart);
    
    // 금지어 "사망" 개입
    const unsafeJsonText = `
    {
      "summary": "인생의 큰 고비가 찾아오는 명식입니다.",
      "highlights": [
        { "title": "주의 시기", "value": "사망의 기운이 접근함", "evidenceCodes": ["E_STEM_DAY_KI"] }
      ],
      "sections": [
        {
          "id": "health",
          "title": "건강",
          "summary": "질병 조심",
          "paragraphs": ["질병으로 인한 사망 리스크를 각별히 경계해야 하는 운명입니다."],
          "evidenceCodes": ["E_STEM_DAY_KI"],
          "positiveSignals": [],
          "cautionSignals": [],
          "actions": []
        }
      ],
      "timeline": [],
      "uncertainty": [],
      "safetyFlags": [],
      "engineVersion": "1.0.0",
      "ruleVersion": "1.0.0",
      "promptVersion": "1.0.0",
      "generatedAt": "${new Date().toISOString()}"
    }
    `;

    const result = StructuredOutputParser.parseAndValidate(
      unsafeJsonText,
      activeCodes,
      chart.calculationBasis.unknownBirthTime
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("금지 표현 탐지");
  });

  // 5. 시간 미상 일관성 검사 검증
  it("시간 미상 일관성: 시간미상(unknownBirthTime) 상태에서 시주 분석 구절이 섞여있으면 차단한다", () => {
    const chart = createMockChart({
      calculationBasis: { unknownBirthTime: true } as unknown as ChartResult["calculationBasis"]
    });
    const activeCodes = InterpretationRuleRepository.getActiveEvidenceCodes(chart);

    const inconsistentJsonText = `
    {
      "summary": "태어난 시각을 분석해 낸 결과입니다.",
      "highlights": [
        { "title": "말년 운세", "value": "시주가 주는 혜택", "evidenceCodes": ["E_HOUR_UNKNOWN"] }
      ],
      "sections": [
        {
          "id": "destiny",
          "title": "말년의 기류",
          "summary": "시주의 흐름",
          "paragraphs": ["태어난 시각을 추정해 볼 때 시주에 존재하는 글자가 조화를 돕습니다."],
          "evidenceCodes": ["E_HOUR_UNKNOWN"],
          "positiveSignals": [],
          "cautionSignals": [],
          "actions": []
        }
      ],
      "timeline": [],
      "uncertainty": [],
      "safetyFlags": [],
      "engineVersion": "1.0.0",
      "ruleVersion": "1.0.0",
      "promptVersion": "1.0.0",
      "generatedAt": "${new Date().toISOString()}"
    }
    `;

    const result = StructuredOutputParser.parseAndValidate(
      inconsistentJsonText,
      activeCodes,
      true // isHourUnknown
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("시간 미상 명식 일관성 불일치");
  });

  // 6. 폴백 동작 검증
  it("폴백 연산 가동: 규칙 기반 폴백 리포트 생성은 무오류로 Zod 스펙을 정확하게 통과한다", () => {
    const chart1 = createMockChart();
    const chart2 = createMockChart({
      normalizedInput: { alias: "상대방" } as unknown as ChartResult["normalizedInput"],
      pillars: { day: { stem: "甲", branch: "子" } } as unknown as ChartResult["pillars"]
    });

    // 기본사주 폴백
    const resSaju = RuleBasedFallback.generate("basic-saju", chart1);
    expect(resSaju.summary).toContain("안전성 요약본");
    expect(resSaju.highlights[0].title).toBe("핵심 오행 분포");

    // 오늘운세 폴백
    const resToday = RuleBasedFallback.generate("today", chart1);
    expect(resToday.summary).toContain("차분하고 실천");

    // 궁합 폴백
    const resCompat = RuleBasedFallback.generate("compatibility", chart1, chart2);
    expect(resCompat.summary).toContain("상대방님의 조화");
  });
});
