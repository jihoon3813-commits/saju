"use server";

import { drawTarotCards, buildTarotAIPrompt, DrawnCard } from "@/lib/tarot/tarotEngine";
import { AIProviderAdapter } from "@/lib/ai/provider";

export interface TarotReadingResponse {
  success: boolean;
  drawn: DrawnCard[];
  result?: {
    summary: string;
    highlights: Array<{ title: string; value: string }>;
    sections: Array<{
      id: string;
      title: string;
      summary: string;
      paragraphs: string[];
      positiveSignals?: string[];
      cautionSignals?: string[];
      actions?: string[];
    }>;
  };
  error?: string;
}

export async function runTarotReadingAction(
  spreadId: string,
  question: string,
  userSelectedIndices?: number[]
): Promise<TarotReadingResponse> {
  try {
    if (!question || question.trim().length < 3) {
      return {
        success: false,
        drawn: [],
        error: "고민하시는 상세 질문을 최소 3자 이상 입력해 주세요."
      };
    }

    // 1. 카드 드로우 (셔플링 포함)
    const drawn = drawTarotCards(spreadId, userSelectedIndices);

    // 2. 프롬프트 생성
    const { prompt, systemInstruction } = buildTarotAIPrompt(spreadId, question, drawn);

    // 3. Gemini AI 호출
    try {
      const response = await AIProviderAdapter.generate(prompt, systemInstruction);
      const parsed = JSON.parse(response.text.trim());

      return {
        success: true,
        drawn,
        result: {
          summary: parsed.summary || "타로 리딩 요약",
          highlights: parsed.highlights || [],
          sections: parsed.sections || []
        }
      };
    } catch (aiErr) {
      console.error("Tarot AI Generation Error, falling back to rule-based:", aiErr);
      
      // 4. AI 오류 발생 시 사용자 이탈 방지용 폴백 해석 반환
      const cardNames = drawn.map((d) => `${d.card.name}(${d.isReversed ? "역" : "정"})`).join(", ");
      const fallbackResult = {
        summary: "무의식의 경고와 조언 흐름",
        highlights: [
          { title: "선택된 카드", value: cardNames }
        ],
        sections: [
          {
            id: "sect_fallback",
            title: "선택된 카드의 상징적 의미",
            summary: "타로 에너지 흐름 해설",
            paragraphs: drawn.map((d) => 
              `${d.card.name} 카드는 ${d.isReversed ? "역방향" : "정방향"}으로 나왔습니다. 이는 '${d.isReversed ? d.card.meaningRev : d.card.meaningUp}'의 의미를 내포하고 있으며, 현재 질문하신 상황인 '${question}'과 관련하여 무의식적으로 행동을 돌아보고 한 템포 신중하게 결정할 것을 조언합니다.`
            ),
            positiveSignals: ["마음의 평정 찾기", "내면의 성찰"],
            cautionSignals: ["조급한 결정 피하기", "과도한 욕심 경계"],
            actions: ["조용히 눈을 감고 5분간 호흡 정돈하기", "질문에 관계된 당사자와 감정적 대립 피하기"]
          }
        ]
      };

      return {
        success: true,
        drawn,
        result: fallbackResult
      };
    }
  } catch (err: any) {
    console.error("Tarot reading system error:", err);
    return {
      success: false,
      drawn: [],
      error: err?.message || "타로 연산 엔진 처리 중 일시적인 시스템 에러가 발생했습니다."
    };
  }
}
