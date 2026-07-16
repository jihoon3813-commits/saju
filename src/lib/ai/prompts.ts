import { ChartResult } from "../manse/types";
import { EvidenceCode } from "./rules";
import { FORTUNE_SERVICES } from "./serviceRegistry";

export const PROMPT_VERSION = "1.0.0";
export const RULE_VERSION = "1.0.0";

export class InterpretationRequestBuilder {
  /**
   * 서비스 타입별로 AI 본문용 입력 정보를 구조화하고 프롬프트를 조립합니다.
   */
  static buildPrompt(
    serviceType: "basic-saju" | "today" | "compatibility",
    chart1: ChartResult,
    activeCodes1: EvidenceCode[],
    chart2?: ChartResult,
    activeCodes2?: EvidenceCode[]
  ): { prompt: string; systemInstruction: string } {
    
    // 1. 공통 시스템 명령 지침 (Persona & Safety Rules)
    const systemInstruction = `
당신은 현대적이고 세련된 해석을 제공하는 전문 명리 분석가이자 AI 엔지니어입니다.
반드시 제공된 "사주 데이터(ChartResult)"와 "활성 근거 코드(Evidence Codes)"에 의존해서만 분석을 수행하고, 직접 절입시각이나 일주를 재생성·추론하여 계산하지 마십시오.

[절대 금지 조항]
- "반드시 성공한다/실패한다" 같은 운명 결정론적 단정 금지.
- 죽음, 중병, 사고, 파산, 이혼, 불임 등 극단적 불행을 사실로 확정하는 표현 절대 금지.
- 로또 번호, 특정 주식 등 투자·계약 수익 보장 금지.
- "상대방이 당신을 사랑하고 있습니다"처럼 상대방의 실제 속마음을 고정된 사실로 확정하는 표현 금지.
- 미래를 비관하여 유료 결제를 강제하거나 불안감을 키우는 마케팅 문체 절대 금지.

[권장 문체 및 서식 규칙]
- 난해한 사주 한자 용어(예: 겁재, 삼형살 등)를 문장 서두에 직접 던지지 마십시오. 현대적인 성향과 심리로 먼저 풀어 설명한 뒤, 괄호 등을 사용하여 사주 용어를 제공하십시오.
- 운명을 강제하기보다 "이러한 에너지가 순환할 때 ~한 성향이 강해질 수 있습니다. 스스로 ~를 조율하고 있나요?"와 같은 점진적 질문 및 조율 기법을 사용하십시오.
- 긍정과 주의점(Caution)의 비율을 항상 50:50으로 유지하십시오.
- 행동 가이드(Actions)는 실제 실천 가능한 구체적 행동(예: "산책하기", "일주일간 지출 장부 쓰기" 등)을 제안하십시오.
- 시주 미상(E_HOUR_UNKNOWN)인 경우, 시주 지장간이나 시주 육친에 의존한 성향·말년운 분석을 원천 배제하고 불확실성을 표시하십시오.
`;

    // 2. 입력 데이터 구조화 및 프롬프트 조립
    let prompt = "";

    if (serviceType === "basic-saju") {
      prompt = `
[요청 서비스: 기본사주 분석 리포트]
아래 정보를 해석하고 정의된 JSON Schema 형식에 맞춰 답변을 출력해 주세요.

## 1. 대상자 사주 정보
- 별칭: ${chart1.normalizedInput.alias}
- 성별: ${chart1.normalizedInput.genderRuleOption}
- 생년월일시: ${chart1.normalizedInput.birthDate} ${chart1.normalizedInput.birthTime || "(시간미상)"}
- 사주 원국:
  - 년주: ${chart1.pillars.year.stem}${chart1.pillars.year.branch}
  - 월주: ${chart1.pillars.month.stem}${chart1.pillars.month.branch}
  - 일주: ${chart1.pillars.day.stem}${chart1.pillars.day.branch}
  - 시주: ${chart1.pillars.hour ? `${chart1.pillars.hour.stem}${chart1.pillars.hour.branch}` : "미상"}
- 오행 분포: 목(${chart1.elementsDistribution.wood}), 화(${chart1.elementsDistribution.fire}), 토(${chart1.elementsDistribution.earth}), 금(${chart1.elementsDistribution.metal}), 수(${chart1.elementsDistribution.water})
- 음양 분포: 양(${chart1.yinYang.yang}), 음(${chart1.yinYang.yin})

## 2. 활성 명리 규칙 근거 코드 (해석에 사용할 수 있는 유일한 근거들입니다)
${activeCodes1.map(c => `- [${c.code}] ${c.name}: ${c.description}`).join("\n")}

## 3. 요구 분석 파트 (JSON의 각 sections에 녹여내야 합니다)
- 핵심 성향 및 강점
- 과해지기 쉬운 반응 (보완책)
- 관계 방식 및 직업 방식
- 재물 습관 및 생활 리듬

## 4. 시간선 (timeline)
- 대운 흐름(${chart1.luckCycles.startAge}세 대운 시작) 및 향후 흐름 요약 제시.
`;
    } else if (serviceType === "today") {
      prompt = `
[요청 서비스: 오늘운세 분석 리포트]
아래 정보를 해석하고 정의된 JSON Schema 형식에 맞춰 답변을 출력해 주세요.

## 1. 대상자 사주 정보
- 별칭: ${chart1.normalizedInput.alias}
- 생년월일시: ${chart1.normalizedInput.birthDate} ${chart1.normalizedInput.birthTime || "(시간미상)"}
- 일주: ${chart1.pillars.day.stem}${chart1.pillars.day.branch}
- 오행 분포: 목(${chart1.elementsDistribution.wood}), 화(${chart1.elementsDistribution.fire}), 토(${chart1.elementsDistribution.earth}), 금(${chart1.elementsDistribution.metal}), 수(${chart1.elementsDistribution.water})

## 2. 활성 명리 규칙 근거 코드
${activeCodes1.map(c => `- [${c.code}] ${c.name}: ${c.description}`).join("\n")}

## 3. 요구 분석 파트 (JSON의 각 sections에 녹여내야 합니다)
- 오늘의 한 문장 요약
- 오늘의 관계 지침 (대인관계)
- 오늘의 일/공부 리듬 (작업/생산성)
- 오늘의 돈 흐름 (소비/재물관리)
- 오늘의 컨디션 및 주의 요소
- 오늘 해볼 수 있는 액션 아이템
`;
    } else if (serviceType === "compatibility") {
      if (!chart2 || !activeCodes2) {
        throw new Error("궁합 서비스를 위해서는 상대방 사주 데이터(chart2)가 필요합니다.");
      }
      prompt = `
[요청 서비스: 기본궁합 분석 리포트]
아래 두 사람의 사주 정보를 해석하고 정의된 JSON Schema 형식에 맞춰 답변을 출력해 주세요.

## 1. 대상자 1 (본인) 정보
- 별칭: ${chart1.normalizedInput.alias}
- 생년월일시: ${chart1.normalizedInput.birthDate} ${chart1.normalizedInput.birthTime || "(시간미상)"}
- 일주: ${chart1.pillars.day.stem}${chart1.pillars.day.branch}
- 활성 근거 코드: ${activeCodes1.map(c => c.code).join(", ")}

## 2. 대상자 2 (상대방) 정보
- 별칭: ${chart2.normalizedInput.alias}
- 생년월일시: ${chart2.normalizedInput.birthDate} ${chart2.normalizedInput.birthTime || "(시간미상)"}
- 일주: ${chart2.pillars.day.stem}${chart2.pillars.day.branch}
- 활성 근거 코드: ${activeCodes2.map(c => c.code).join(", ")}

## 3. 요구 분석 파트 (JSON의 각 sections에 녹여내야 합니다)
- 두 사람 각각의 기본 성향 구조 대조
- 조화로운 요소 (협력과 친화 지점)
- 갈등 가능성이 잠재된 지점 (주의할 기류)
- 추천하는 서로간의 소통/대화 방식
- 관계를 따뜻하게 유지하기 위한 맞춤 팁

* 주의: 대상자 2(상대방)의 속마음을 확정적으로 묘사하여 현혹하는 문장을 절대 작성하지 마십시오.
`;
    }

    // JSON 스키마를 강제하기 위한 하단 고정 가이드라인
    prompt += `

[JSON SCHEMA 강제 요구사항]
반드시 다음 스키마 구조의 JSON 문자열만을 생성하십시오. 부가설명이나 markdown 블록(\`\`\`json)은 생략하거나 지워주십시오.
JSON 내부의 모든 'evidenceCodes' 배열 필드는 위에 열거한 활성 근거 코드(예: "E_WOOD_MANY", "E_STEM_DAY_KAP" 등)의 값으로만 채워져야 합니다.

스키마 명세:
{
  "summary": "핵심 한 줄 요약 문장 (50자 내외)",
  "highlights": [
    { "title": "핵심 요약 카드 제목", "value": "요약 설명값 (구체적)", "evidenceCodes": ["활성코드1", "활성코드2"] }
  ],
  "sections": [
    {
      "id": "기본 분석 섹션 고유 ID (예: 'identity', 'work', 'love')",
      "title": "섹션 제목",
      "summary": "섹션 요약 한 문장",
      "paragraphs": ["문단 1 본문", "문단 2 본문"],
      "evidenceCodes": ["관련 활성코드"],
      "positiveSignals": ["좋은 흐름 지표 1", "좋은 흐름 지표 2"],
      "cautionSignals": ["주의 기류 1", "주의 기류 2"],
      "actions": ["실천 가능한 행동 요약 1", "실천 가능한 행동 요약 2"]
    }
  ],
  "timeline": [
    { "period": "대운/시기 주기명", "intensity": 3, "opportunity": "기회 요소 설명", "caution": "조율 요소 설명", "action": "실천 지침", "evidenceCodes": ["관련 활성코드"] }
  ],
  "uncertainty": [
    { "code": "불확실 요소 코드 (시간미상인 경우 'E_HOUR_UNKNOWN' 지정)", "message": "사용자 주의가 필요하거나 해석 정밀도가 떨어지는 구간에 대한 해설", "affectedSections": ["영향을 받는 섹션 ID"] }
  ],
  "safetyFlags": [],
  "engineVersion": "1.0.0",
  "ruleVersion": "${RULE_VERSION}",
  "promptVersion": "${PROMPT_VERSION}",
  "generatedAt": "${new Date().toISOString()}"
}
`;

    return { prompt, systemInstruction };
  }

  /**
   * 프리미엄 상품 전용 리포트용 시스템 지침과 정교한 상세 프롬프트를 조립합니다.
   */
  static buildPremiumPrompt(
    productType: string,
    chart1: ChartResult,
    activeCodes1: any[],
    chart2?: ChartResult,
    activeCodes2?: any[],
    extraParams: Record<string, any> = {}
  ): { prompt: string; systemInstruction: string } {
    const systemInstruction = `
당신은 현대적이고 세련되며 깊이 있는 해설을 제공하는 특급 명리 분석가이자 AI 엔지니어입니다.
반드시 제공된 "사주 데이터(ChartResult)"와 "활성 근거 코드(Evidence Codes)"에 의존해서만 분석을 수행하고, 직접 절입시각이나 일주를 재생성·추론하여 계산하지 마십시오.
유료 프리미엄 리포트인 만큼 문장이 극히 고급스럽고, 구체적이며, 상세해야 합니다. 일반적인 무료 해석보다 3배 이상 풍부하고 정밀하게 작성하십시오.

[절대 금지 조항]
- "반드시 성공한다/실패한다" 같은 운명 결정론적 단정 금지.
- 죽음, 중병, 사고, 파산, 이혼, 불임 등 극단적 불행을 사실로 확정하는 표현 절대 금지.
- 로또 번호, 특정 주식 등 투자·계약 수익 보장 금지.
- 상대방의 실제 속마음을 고정된 사실로 확정하는 표현 금지.
- 미래를 비관하여 유료 결제를 강제하거나 불안감을 키우는 마케팅 문체 절대 금지.

[권장 문체 및 서식 규칙]
- 난해한 사주 한자 용어를 문장 서두에 직접 던지지 마십시오. 현대적인 성향과 심리로 먼저 풀어 설명한 뒤, 괄호를 사용하여 사주 용어를 제공하십시오.
- 행동 가이드는 실제 실천 가능한 구체적 행동을 제안하십시오.
- 시주 미상인 경우, 시주 지장간이나 시주 육친에 의존한 성향·말년운 분석을 원천 배제하고 불확실성을 표시하십시오.
`;

    const service = FORTUNE_SERVICES[productType];
    if (!service) {
      throw new Error(`지원하지 않는 프리미엄 운세 상품 타입입니다: ${productType}`);
    }

    let prompt = `
[요청 서비스: ${service.title}]
사용자가 유료 프리미엄 리포트를 구매했습니다. 다음 분야들을 총망라하여 **상세 섹션(sections)**을 작성해 주세요.
각 섹션은 구체적이고 깊이 있는 텍스트(각 문단당 150자 이상)로 채워야 합니다.

## 요구 분석 파트 (JSON의 sections로 구성하되, 다음 영역들이 반드시 포함되어 각각에 상응하는 섹션 개체가 생성되게 하십시오):
`;

    service.sections.forEach((sect, index) => {
      prompt += `${index + 1}. [섹션 ID: ${sect.id}] ${sect.title} (${sect.description})\n`;
    });

    if (extraParams.question) {
      prompt += `\n사용자의 구체적 질문/고민: "${extraParams.question}"\n위 고민 해결에 중점을 두어 풀이해 주세요.\n`;
    }
    if (extraParams.year) {
      prompt += `\n대상 연도: ${extraParams.year}년\n`;
    }
    if (extraParams.month) {
      prompt += `\n대상 월: ${extraParams.month}월\n`;
    }

    prompt += `
\n## 1. 대상자 사주 정보
- 별칭: ${chart1.normalizedInput.alias}
- 성별: ${chart1.normalizedInput.genderRuleOption}
- 생년월일시: ${chart1.normalizedInput.birthDate} ${chart1.normalizedInput.birthTime || "(시간미상)"}
- 사주 원국: 년주(${chart1.pillars.year.stem}${chart1.pillars.year.branch}), 월주(${chart1.pillars.month.stem}${chart1.pillars.month.branch}), 일주(${chart1.pillars.day.stem}${chart1.pillars.day.branch}), 시주(${chart1.pillars.hour ? `${chart1.pillars.hour.stem}${chart1.pillars.hour.branch}` : "미상"})
- 오행 분포: 목(${chart1.elementsDistribution.wood}), 화(${chart1.elementsDistribution.fire}), 토(${chart1.elementsDistribution.earth}), 금(${chart1.elementsDistribution.metal}), 수(${chart1.elementsDistribution.water})

## 2. 활성 근거 코드
${activeCodes1.map(c => `- [${c.code}] ${c.name}: ${c.description}`).join("\n")}
`;

    if (chart2 && activeCodes2) {
      prompt += `
\n## 3. 동반자 사주 정보
- 별칭: ${chart2.normalizedInput.alias}
- 성별: ${chart2.normalizedInput.genderRuleOption}
- 생년월일시: ${chart2.normalizedInput.birthDate} ${chart2.normalizedInput.birthTime || "(시간미상)"}
- 사주 원국: 년주(${chart2.pillars.year.stem}${chart2.pillars.year.branch}), 월주(${chart2.pillars.month.stem}${chart2.pillars.month.branch}), 일주(${chart2.pillars.day.stem}${chart2.pillars.day.branch}), 시주(${chart2.pillars.hour ? `${chart2.pillars.hour.stem}${chart2.pillars.hour.branch}` : "미상"})

## 4. 동반자 활성 근거 코드
${activeCodes2.map(c => `- [${c.code}] ${c.name}: ${c.description}`).join("\n")}
`;
    }

    // JSON 스키마 가이드 추가 (공통)
    prompt += `
\n[JSON SCHEMA 강제 요구사항]
반드시 다음 스키마 구조의 JSON 문자열만을 생성하십시오. 부가설명이나 markdown 블록(\`\`\`json)은 생략하거나 지워주십시오.
JSON 내부의 모든 'evidenceCodes' 배열 필드는 위에 열거한 활성 근거 코드(예: "E_WOOD_MANY", "E_STEM_DAY_KAP" 등)의 값으로만 채워져야 합니다.

섹션 리스트의 각 'id'는 위 요구 분석 파트의 섹션 ID들과 일대일 매칭되어야 합니다:
[${service.sections.map(s => `'${s.id}'`).join(", ")}]

스크마 명세:
{
  "summary": "핵심 한 줄 요약 문장 (50자 내외)",
  "highlights": [
    { "title": "요약 카드 제목", "value": "요약 설명값 (구체적)", "evidenceCodes": ["활성코드1"] }
  ],
  "sections": [
    {
      "id": "상기 섹션 ID 중 하나",
      "title": "섹션 제목",
      "summary": "섹션 요약 한 문장",
      "paragraphs": ["상세 문단 1 본문", "상세 문단 2 본문"],
      "evidenceCodes": ["관련 활성코드"],
      "positiveSignals": ["긍정 지표 1"],
      "cautionSignals": ["주의 지표 1"],
      "actions": ["실천 가능 행동 1"]
    }
  ],
  "timeline": [
    { "period": "대운/시기명", "intensity": 3, "opportunity": "기회 요소 설명", "caution": "조율 요소 설명", "action": "실천 지침", "evidenceCodes": ["관련 활성코드"] }
  ],
  "uncertainty": [
    { "code": "불확실 요소 코드", "message": "해설", "affectedSections": ["섹션 ID"] }
  ],
  "safetyFlags": [],
  "engineVersion": "1.0.0",
  "ruleVersion": "1.0.0",
  "promptVersion": "${PROMPT_VERSION}",
  "generatedAt": "${new Date().toISOString()}"
}
`;

    return { prompt, systemInstruction };
  }
}
