const GEMINI_MODEL = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface AIProviderResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export class AIProviderAdapter {
  /**
   * Gemini API에 텍스트 생성 요청을 전송합니다.
   * @param prompt AI에 보낼 본문
   * @param systemInstruction 시스템 프롬프트(페르소나, 규칙)
   * @param responseSchema 구조화된 응답을 강제하기 위한 JSON Schema 객체 (선택)
   */
  static async generate(
    prompt: string,
    systemInstruction?: string,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    responseSchema?: any
  ): Promise<AIProviderResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 환경 변수가 없거나 로드되지 않았습니다.");
    }

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const payload: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.15, // 해석의 안정성을 극대화하기 위해 낮은 온도(temperature) 지정
      }
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    if (responseSchema) {
      payload.generationConfig.responseMimeType = "application/json";
      payload.generationConfig.responseSchema = responseSchema;
    }

    // 20초 타임아웃 가드 적용
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(`${API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API 호출 실패 (HTTP ${res.status}): ${errorText}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Gemini API의 응답 구조에 텍스트 후보군이 부재합니다.");
      }

      const promptTokens = data.usageMetadata?.promptTokenCount || 0;
      const completionTokens = data.usageMetadata?.candidatesTokenCount || 0;

      return {
        text,
        model: GEMINI_MODEL,
        usage: {
          promptTokens,
          completionTokens
        }
      };
    } catch (err) {
      clearTimeout(timeoutId);
      const error = err as Error;
      if (error.name === "AbortError") {
        throw new Error("Gemini API 호출 중 지정 시간(20초) 초과 타임아웃이 발생했습니다.");
      }
      throw error;
    }
  }
}
