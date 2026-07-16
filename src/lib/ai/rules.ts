import { ChartResult } from "../manse/types";

export interface EvidenceCode {
  code: string;
  name: string;
  category: "element" | "day_stem" | "relations" | "uncertainty" | "general";
  description: string;
}

const GLOBAL_RULES_DATABASE: EvidenceCode[] = [
  // 1. 오행 관련 근거 코드 (Elements)
  { code: "E_WOOD_MANY", name: "목(木) 과다", category: "element", description: "사주에 목(나무)의 기운이 3개 이상으로 진취적이며 시작하는 성향이 강하나 완고할 수 있음" },
  { code: "E_WOOD_LACK", name: "목(木) 부족", category: "element", description: "사주에 목(나무)의 기운이 없어 시작하는 원동력이나 기획력을 보충해야 함" },
  { code: "E_FIRE_MANY", name: "화(火) 과다", category: "element", description: "사주에 화(불)의 기운이 3개 이상으로 열정적이고 적극적이나 다혈질적 기질을 통제해야 함" },
  { code: "E_FIRE_LACK", name: "화(火) 부족", category: "element", description: "사주에 화(불)의 기운이 없어 추진하는 동력이나 감정 표현을 키울 필요가 있음" },
  { code: "E_EARTH_MANY", name: "토(土) 과다", category: "element", description: "사주에 토(흙)의 기운이 3개 이상으로 포용력과 신용이 두터우나 변화를 거부하는 경향이 있음" },
  { code: "E_EARTH_LACK", name: "토(土) 부족", category: "element", description: "사주에 토(흙)의 기운이 없어 안정감이나 중재 능력을 향상시킬 필요가 있음" },
  { code: "E_METAL_MANY", name: "금(金) 과다", category: "element", description: "사주에 금(쇠)의 기운이 3개 이상으로 결단력과 주관이 확실하나 다소 냉혹하고 융통성이 없을 수 있음" },
  { code: "E_METAL_LACK", name: "금(金) 부족", category: "element", description: "사주에 금(쇠)의 기운이 없어 매듭을 짓는 정리정돈력이나 맺고 끊음이 미흡할 수 있음" },
  { code: "E_WATER_MANY", name: "수(水) 과다", category: "element", description: "사주에 수(물)의 기운이 3개 이상으로 지혜롭고 유연하나 우울감이나 비밀스러움이 많을 수 있음" },
  { code: "E_WATER_LACK", name: "수(水) 부족", category: "element", description: "사주에 수(물)의 기운이 없어 상황 대처에 유연함이나 내실을 채우는 기운이 미흡할 수 있음" },

  // 2. 일간 성향 근거 코드 (Day Stems)
  { code: "E_STEM_DAY_KAP", name: "갑목 일간 (甲)", category: "day_stem", description: "우두머리 기질, 리더십, 위를 향해 뻗어가려는 성향이 지배적임" },
  { code: "E_STEM_DAY_EUL", name: "을목 일간 (乙)", category: "day_stem", description: "유연한 적응력, 친화력, 인내를 통해 생명력을 키우는 경향이 강함" },
  { code: "E_STEM_DAY_BYUNG", name: "병화 일간 (丙)", category: "day_stem", description: "태양 같은 열정과 성정, 화려함, 정의감을 바탕으로 솔직하게 자아를 노출함" },
  { code: "E_STEM_DAY_JEONG", name: "정화 일간 (丁)", category: "day_stem", description: "촛불/등대 같은 은은한 헌신, 세심하고 내적 열정이 깊으며 사교적임" },
  { code: "E_STEM_DAY_MOO", name: "무토 일간 (戊)", category: "day_stem", description: "큰 산의 포용력과 묵직함, 주관이 단단하나 변화에 적응하는 시간이 필요함" },
  { code: "E_STEM_DAY_KI", name: "기토 일간 (己)", category: "day_stem", description: "텃밭 같은 생산성과 실속, 어머니의 중재력, 섬세하고 비밀을 지키는 성정" },
  { code: "E_STEM_DAY_KYUNG", name: "경금 일간 (庚)", category: "day_stem", description: "원석 및 무쇠의 강직함, 혁명과 의리, 명확한 상벌 관계를 중시함" },
  { code: "E_STEM_DAY_SHIN", name: "신금 일간 (辛)", category: "day_stem", description: "가공된 보석 및 칼날의 섬세함과 예리함, 독자적 주관, 자존심이 매우 강함" },
  { code: "E_STEM_DAY_IM", name: "임수 일간 (壬)", category: "day_stem", description: "바다의 넓은 포용성과 영민함, 대범하며 유유히 흐르는 생각의 깊이가 있음" },
  { code: "E_STEM_DAY_GYE", name: "계수 일간 (癸)", category: "day_stem", description: "빗방울/안개 같은 유연성과 지혜, 사려 깊음, 감수성이 풍부하고 침투력이 좋음" },

  // 3. 관계성 결속 및 파괴 관련 근거 코드 (Relations)
  { code: "E_BRANCH_CLASH", name: "지지 충(沖)", category: "relations", description: "사주 원국에 지지 충돌이 있어 환경의 변화나 개혁, 잦은 이동수가 따름" },
  { code: "E_BRANCH_COMB", name: "지지 합(合)", category: "relations", description: "지지 결속(삼합/육합 등)이 있어 타인과의 타협 및 대인관계 친밀도 형성에 강점이 있음" },
  { code: "E_PUNISH_SELF", name: "형살(刑) 영향", category: "relations", description: "형살의 기운이 존재하여 성격 조율 및 법률·의학 관련 분야에서의 조심성과 통제력을 갖춤" },

  // 4. 불확실성 관련 코드 (Uncertainty)
  { code: "E_HOUR_UNKNOWN", name: "출생시 미상", category: "uncertainty", description: "출생시를 모르는 3주 명식으로, 장년 및 말년운 분석에 오차가 발생할 수 있음" }
];

export class InterpretationRuleRepository {
  /**
   * 명리 차트 데이터에서 트리거된 활성 Evidence Code들을 추출합니다.
   */
  static getActiveEvidenceCodes(chart: ChartResult): EvidenceCode[] {
    const active: EvidenceCode[] = [];
    const dist = chart.elementsDistribution;

    // 1. 오행 개수 판정
    if (dist.wood >= 3) active.push(this.findRule("E_WOOD_MANY")!);
    if (dist.wood === 0) active.push(this.findRule("E_WOOD_LACK")!);

    if (dist.fire >= 3) active.push(this.findRule("E_FIRE_MANY")!);
    if (dist.fire === 0) active.push(this.findRule("E_FIRE_LACK")!);

    if (dist.earth >= 3) active.push(this.findRule("E_EARTH_MANY")!);
    if (dist.earth === 0) active.push(this.findRule("E_EARTH_LACK")!);

    if (dist.metal >= 3) active.push(this.findRule("E_METAL_MANY")!);
    if (dist.metal === 0) active.push(this.findRule("E_METAL_LACK")!);

    if (dist.water >= 3) active.push(this.findRule("E_WATER_MANY")!);
    if (dist.water === 0) active.push(this.findRule("E_WATER_LACK")!);

    // 2. 일간(일주 천간) 판정
    const dayStem = chart.pillars.day.stem;
    switch (dayStem) {
      case "甲": active.push(this.findRule("E_STEM_DAY_KAP")!); break;
      case "乙": active.push(this.findRule("E_STEM_DAY_EUL")!); break;
      case "丙": active.push(this.findRule("E_STEM_DAY_BYUNG")!); break;
      case "丁": active.push(this.findRule("E_STEM_DAY_JEONG")!); break;
      case "戊": active.push(this.findRule("E_STEM_DAY_MOO")!); break;
      case "己": active.push(this.findRule("E_STEM_DAY_KI")!); break;
      case "庚": active.push(this.findRule("E_STEM_DAY_KYUNG")!); break;
      case "辛": active.push(this.findRule("E_STEM_DAY_SHIN")!); break;
      case "壬": active.push(this.findRule("E_STEM_DAY_IM")!); break;
      case "癸": active.push(this.findRule("E_STEM_DAY_GYE")!); break;
    }

    // 3. 지지 관계성 판정
    if (chart.relations.branchClashes.length > 0) {
      active.push(this.findRule("E_BRANCH_CLASH")!);
    }
    if (chart.relations.branchCombinations.length > 0) {
      active.push(this.findRule("E_BRANCH_COMB")!);
    }
    if (chart.relations.punishments.length > 0) {
      active.push(this.findRule("E_PUNISH_SELF")!);
    }

    // 4. 불확실성 (출생시 미상) 판정
    if (chart.calculationBasis.unknownBirthTime || chart.pillars.hour === null) {
      active.push(this.findRule("E_HOUR_UNKNOWN")!);
    }

    return active;
  }

  private static findRule(code: string): EvidenceCode | undefined {
    return GLOBAL_RULES_DATABASE.find((r) => r.code === code);
  }
}
