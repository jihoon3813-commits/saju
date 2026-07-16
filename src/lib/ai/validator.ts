import { StructuredInterpretation, StructuredInterpretationSchema } from "./types";
import { EvidenceCode } from "./rules";

// 1. 금지 단어 목록 (소문자/한글 포함 검사)
const FORBIDDEN_WORDS = [
  "사망",
  "죽음",
  "단명",
  "불임",
  "이혼 확정",
  "파산 확정",
  "대박 보장",
  "로또 당첨",
  "100% 성공",
  "무조건 실패"
];

export class EvidenceValidator {
  /**
   * AI 해석 JSON 내의 모든 evidenceCodes가 활성 코드 목록 내에 존재하는지 검사합니다.
   */
  static validate(data: StructuredInterpretation, activeCodes: EvidenceCode[]): boolean {
    const activeSet = new Set(activeCodes.map((c) => c.code));

    // highlights 검사
    for (const h of data.highlights) {
      for (const code of h.evidenceCodes) {
        if (!activeSet.has(code)) {
          console.warn(`[EvidenceValidator] 비활성 근거 코드 탐지: ${code}`);
          return false;
        }
      }
    }

    // sections 검사
    for (const s of data.sections) {
      for (const code of s.evidenceCodes) {
        if (!activeSet.has(code)) {
          console.warn(`[EvidenceValidator] 비활성 근거 코드 탐지: ${code}`);
          return false;
        }
      }
    }

    // timeline 검사
    for (const t of data.timeline) {
      for (const code of t.evidenceCodes) {
        if (!activeSet.has(code)) {
          console.warn(`[EvidenceValidator] 비활성 근거 코드 탐지: ${code}`);
          return false;
        }
      }
    }

    return true;
  }
}

export class SafetyValidator {
  /**
   * 해석 텍스트에 공포를 유발하거나 극단적으로 확정하는 단어가 포함되었는지 검사합니다.
   */
  static validate(data: StructuredInterpretation): boolean {
    const textToInspect = [
      data.summary,
      ...data.highlights.map((h) => h.value),
      ...data.sections.flatMap((s) => [s.summary, ...s.paragraphs, ...s.positiveSignals, ...s.cautionSignals, ...s.actions]),
      ...data.timeline.flatMap((t) => [t.opportunity, t.caution, t.action])
    ].join(" ");

    for (const word of FORBIDDEN_WORDS) {
      if (textToInspect.includes(word)) {
        console.warn(`[SafetyValidator] 금지 표현 탐지: "${word}"`);
        return false;
      }
    }
    return true;
  }
}

export class ConsistencyValidator {
  /**
   * 출생 시간이 미상인 경우, 시주를 단정하여 분석하는 문장이 해석에 개입되었는지 검증합니다.
   */
  static validate(data: StructuredInterpretation, isHourUnknown: boolean): boolean {
    if (!isHourUnknown) return true;

    // E_HOUR_UNKNOWN 이 들어있는데 본문에 "시주" 혹은 "태어난 시간"에 의존한 주장을 하는 경우 필터링
    const textToInspect = [
      data.summary,
      ...data.sections.flatMap((s) => [...s.paragraphs])
    ].join(" ");

    if (textToInspect.includes("태어난 시각") || textToInspect.includes("태어난 시간") || textToInspect.includes("시주에")) {
      console.warn("[ConsistencyValidator] 출생시 미상임에도 시주 분석 문장이 개입되었습니다.");
      return false;
    }

    return true;
  }
}

export class StructuredOutputParser {
  /**
   * 문자열을 구조화된 JSON 객체로 파싱하고 전체 유효성 파이프라인을 기동합니다.
   */
  static parseAndValidate(
    rawText: string,
    activeCodes1: EvidenceCode[],
    isHourUnknown1: boolean,
    activeCodes2: EvidenceCode[] = [],
    isHourUnknown2: boolean = false
  ): { success: boolean; data?: StructuredInterpretation; error?: string } {
    try {
      // 1. JSON 추출 및 파싱
      let cleanJsonText = rawText.trim();
      // Markdown 백틱 껍데기가 씌워진 경우 해제
      if (cleanJsonText.startsWith("```")) {
        cleanJsonText = cleanJsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleanJsonText);

      // 2. Zod 스키마 런타임 체크
      const zodParsed = StructuredInterpretationSchema.safeParse(parsed);
      if (!zodParsed.success) {
        return { success: false, error: `JSON Schema 불일치: ${zodParsed.error.message}` };
      }

      const data = zodParsed.data;

      // 3. 근거 코드 검증
      const mergedActiveCodes = [...activeCodes1, ...activeCodes2];
      if (!EvidenceValidator.validate(data, mergedActiveCodes)) {
        return { success: false, error: "명리학적 데이터 근거(Evidence Codes) 조작 혹은 검증되지 않은 원국 분석 데이터 포함" };
      }

      // 4. 안전 기준 검증 (공포 유발 등)
      if (!SafetyValidator.validate(data)) {
        return { success: false, error: "금지 표현 탐지 (극단론적 예언, 금전 보장 혹은 공포 마케팅)" };
      }

      // 5. 일관성 검증 (시주 결핍성 대조)
      const hourUnknown = isHourUnknown1 || isHourUnknown2;
      if (!ConsistencyValidator.validate(data, hourUnknown)) {
        return { success: false, error: "시간 미상 명식 일관성 불일치 (시주 단정 단어 포함)" };
      }

      return { success: true, data };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: `JSON 파싱 예외 발생: ${error.message}` };
    }
  }
}
