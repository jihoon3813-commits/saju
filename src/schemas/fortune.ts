import { z } from "zod";

// 1. 계산 기준 설정 서브 스키마
export const CalculationPreferenceSchema = z.object({
  useTrueSolarTime: z.boolean().default(false), // 진태양시 적용 여부
  borderTimeRule: z.enum(["23", "0"]).default("23") // 조자시/야자시 경계 기준 (23시 또는 0시)
});

export type CalculationPreference = z.infer<typeof CalculationPreferenceSchema>;

// 2. 생년월일시 입력 DTO 스키마 (Phase 3 연결 계약 규격)
export const FortuneInputSchema = z.object({
  profileId: z.string().uuid().optional(),
  alias: z.string().min(1, "별칭을 1글자 이상 입력해 주세요."),
  calendarType: z.enum(["solar", "lunar"]),
  lunarLeapMonth: z.boolean().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)."),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, "올바른 시간 형식이 아닙니다 (HH:MM).").nullable(),
  unknownBirthTime: z.boolean().default(false),
  birthCountry: z.string().min(1, "출생 국가를 입력해 주세요."),
  birthCity: z.string().min(1, "출생 도시를 입력해 주세요."),
  timezone: z.string().min(1, "시간대를 지정해 주세요."),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  genderRuleOption: z.enum(["male", "female", "unspecified"]),
  calculationPreference: CalculationPreferenceSchema,
  topicPriority: z.array(z.string()).min(1, "최소 한 개 이상의 관심 주제를 선택해 주세요.")
}).refine(
  (data) => {
    // 음력일 경우 윤달 선택이 필수 (null이 아니어야 함)
    if (data.calendarType === "lunar") {
      return data.lunarLeapMonth !== null;
    }
    return true;
  },
  {
    message: "음력 생일인 경우 윤달 여부를 선택해 주세요.",
    path: ["lunarLeapMonth"]
  }
).refine(
  (data) => {
    // birthDate가 유효한 실존 날짜인지 검사
    const [year, month, day] = data.birthDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  },
  {
    message: "존재하지 않는 날짜입니다.",
    path: ["birthDate"]
  }
).refine(
  (data) => {
    // 미래의 날짜인지 검사
    const [year, month, day] = data.birthDate.split("-").map(Number);
    const birth = new Date(year, month - 1, day);
    const now = new Date();
    return birth.getTime() <= now.getTime();
  },
  {
    message: "미래의 날짜는 입력할 수 없습니다.",
    path: ["birthDate"]
  }
).refine(
  (data) => {
    // 만세력 지원 범위 (1900년 ~ 2050년) 검사
    const year = Number(data.birthDate.split("-")[0]);
    return year >= 1900 && year <= 2050;
  },
  {
    message: "지원 범위(1900년~2050년) 밖의 날짜입니다.",
    path: ["birthDate"]
  }
).transform((data) => {
  // unknownBirthTime이 true이면 birthTime을 null로 강제 정규화
  if (data.unknownBirthTime) {
    return {
      ...data,
      birthTime: null
    };
  }
  return data;
});

export type FortuneInput = z.infer<typeof FortuneInputSchema>;

// 3. 데이터베이스 저장용 BirthProfile 스키마 (관계 및 저장 동의 포함)
export const BirthProfileSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid().nullable().optional(),
  anonymousSessionId: z.string().nullable().optional(),
  alias: z.string().min(1, "별칭을 입력해 주세요."),
  relationship: z.enum(["self", "family", "lover", "friend", "partner", "other"]),
  calendarType: z.enum(["solar", "lunar"]),
  lunarLeapMonth: z.boolean().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식이 아닙니다."),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, "올바른 시간 형식이 아닙니다.").nullable(),
  unknownBirthTime: z.boolean().default(false),
  birthCountry: z.string(),
  birthCity: z.string(),
  timezone: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  genderRuleOption: z.enum(["male", "female", "unspecified"]),
  calculationPreference: CalculationPreferenceSchema,
  saveConsent: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional()
});

export type BirthProfile = z.infer<typeof BirthProfileSchema>;
