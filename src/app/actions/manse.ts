"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { getCurrentUser, getOrCreateAnonymousSession } from "@/lib/auth";
import { calculateManseChart } from "@/lib/manse/fourPillarsCalculator";
import { ChartResult } from "@/lib/manse/types";

const ENGINE_VERSION = "1.0.0";

/**
 * 객체의 키값을 정렬하여 일관된 JSON 문자열로 변환하고, SHA-256 해시를 생성합니다.
 */
function calculateInputHash(input: Record<string, unknown>): string {
  const sortedKeys = Object.keys(input).sort();
  const sortedObj: Record<string, unknown> = {};
  sortedKeys.forEach((key) => {
    // 함수나 undefined, null 필드는 제외하고 원시값만 바인딩
    if (input[key] !== undefined) {
      sortedObj[key] = input[key];
    }
  });
  const dataString = JSON.stringify(sortedObj);
  return crypto.createHash("sha256").update(dataString).digest("hex");
}

interface ManseResultResponse {
  success: boolean;
  chart?: ChartResult;
  error?: string;
  isCached?: boolean;
}

/**
 * 프로필 ID 또는 원시 사주 데이터를 전달받아 최종 명조(ChartResult)를 조회/연산합니다.
 */
export async function getManseChartAction(params: {
  profileId?: string;
  guestInput?: {
    alias: string;
    genderRuleOption: "male" | "female" | "unspecified";
    calendarType: "solar" | "lunar";
    lunarLeapMonth: boolean | null;
    birthDate: string;
    birthTime: string | null;
    unknownBirthTime: boolean;
    birthCountry: string;
    birthCity: string;
    timezone: string;
    latitude: number;
    longitude: number;
    useTrueSolarTime: boolean;
    borderTimeRule: "23" | "0";
    topicPriority?: string[];
  };
}): Promise<ManseResultResponse> {
  try {
    let inputData: {
      alias: string;
      genderRuleOption: "male" | "female" | "unspecified";
      calendarType: "solar" | "lunar";
      lunarLeapMonth: boolean | null;
      birthDate: string;
      birthTime: string | null;
      unknownBirthTime: boolean;
      birthCountry: string;
      birthCity: string;
      timezone: string;
      latitude: number;
      longitude: number;
      useTrueSolarTime: boolean;
      borderTimeRule: "23" | "0";
      topicPriority?: string[];
    } | null = null;

    // 1. 프로필 ID가 전달된 경우 데이터 조회 및 검증
    if (params.profileId) {
      const profile = await db.profiles.findById(params.profileId);
      if (!profile) {
        return { success: false, error: "요청하신 프로필 정보를 찾을 수 없습니다." };
      }

      // 소유권 검사
      const user = await getCurrentUser();
      const anonSessionId = await getOrCreateAnonymousSession();

      if (profile.userId) {
        if (!user || profile.userId !== user.id) {
          return { success: false, error: "이 프로필 데이터를 조회할 권한이 없습니다." };
        }
      } else if (profile.anonymousSessionId) {
        if (profile.anonymousSessionId !== anonSessionId) {
          return { success: false, error: "이 프로필 데이터를 조회할 권한이 없습니다. (세션 격리)" };
        }
      }

      // DB의 Profile 데이터를 계산기 인풋 포맷으로 변경
      inputData = {
        alias: profile.alias,
        genderRuleOption: profile.genderRuleOption,
        calendarType: profile.calendarType,
        lunarLeapMonth: profile.lunarLeapMonth,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        unknownBirthTime: profile.unknownBirthTime,
        birthCountry: profile.birthCountry,
        birthCity: profile.birthCity,
        timezone: profile.timezone,
        latitude: profile.latitude ?? 37.5665,
        longitude: profile.longitude ?? 126.9780,
        useTrueSolarTime: profile.calculationPreference?.useTrueSolarTime ?? false,
        borderTimeRule: profile.calculationPreference?.borderTimeRule || "23",
        topicPriority: ["종합"] // 기본값 부여
      };
    } else if (params.guestInput) {
      // 2. 비회원 원시 입력 폼 데이터인 경우
      inputData = params.guestInput;
    } else {
      return { success: false, error: "잘못된 요청 파라미터입니다." };
    }

    if (!inputData) {
      return { success: false, error: "잘못된 요청 파라미터입니다." };
    }

    // 3. 인풋 값 정규화용 매핑 및 해싱
    const normalizedInput = {
      genderRuleOption: inputData.genderRuleOption,
      calendarType: inputData.calendarType,
      lunarLeapMonth: inputData.calendarType === "lunar" ? !!inputData.lunarLeapMonth : null,
      birthDate: inputData.birthDate,
      birthTime: inputData.unknownBirthTime ? null : inputData.birthTime,
      unknownBirthTime: inputData.unknownBirthTime,
      timezone: inputData.timezone,
      latitude: Number(inputData.latitude.toFixed(4)),
      longitude: Number(inputData.longitude.toFixed(4)),
      useTrueSolarTime: !!inputData.useTrueSolarTime,
      borderTimeRule: inputData.borderTimeRule || "23"
    };

    const inputHash = calculateInputHash(normalizedInput);

    // 4. 캐시 테이블 조회
    const cachedChart = await db.caches.find(inputHash, ENGINE_VERSION);
    if (cachedChart) {
      // 캐시 데이터가 존재하면 즉시 반환
      return {
        success: true,
        chart: cachedChart,
        isCached: true
      };
    }

    // 5. 캐시 미스 시 만세력 엔진 가동
    const freshChart = calculateManseChart({
      alias: inputData.alias,
      genderRuleOption: inputData.genderRuleOption,
      calendarType: inputData.calendarType,
      lunarLeapMonth: normalizedInput.lunarLeapMonth,
      birthDate: inputData.birthDate,
      birthTime: inputData.birthTime,
      unknownBirthTime: inputData.unknownBirthTime,
      birthCountry: inputData.birthCountry,
      birthCity: inputData.birthCity,
      timezone: inputData.timezone,
      latitude: normalizedInput.latitude,
      longitude: normalizedInput.longitude,
      useTrueSolarTime: normalizedInput.useTrueSolarTime,
      borderTimeRule: normalizedInput.borderTimeRule as "23" | "0",
      topicPriority: inputData.topicPriority
    });

    // 6. DB 캐시 저장
    await db.caches.create(inputHash, ENGINE_VERSION, freshChart);

    return {
      success: true,
      chart: freshChart,
      isCached: false
    };
  } catch (err) {
    const error = err as Error;
    console.error("getManseChartAction error:", error);
    return {
      success: false,
      error: error.message || "만세력 계산 처리 중 예기치 못한 에러가 발생했습니다."
    };
  }
}
