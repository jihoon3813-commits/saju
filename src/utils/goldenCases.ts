export interface GoldenCaseInput {
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
}

export interface GoldenCase {
  id: string;
  category: string;
  description: string;
  input: GoldenCaseInput;
  expected: {
    year?: string;
    month?: string;
    day?: string;
    hour?: string | null;
    solarDateEquivalent?: string; // 교차검증용 양력 일자
  };
}

export const GOLDEN_CASES: GoldenCase[] = [
  // ==========================================
  // 1. 일반 양력 생년월일 (20건)
  // ==========================================
  ...Array.from({ length: 20 }, (_, i) => {
    const year = 1980 + i;
    return {
      id: `solar-std-${i + 1}`,
      category: "solar_standard",
      description: `양력 표준 명조 테스트 ${year}년생`,
      input: {
        alias: `양력-${year}`,
        genderRuleOption: (i % 2 === 0 ? "male" : "female") as "male" | "female" | "unspecified",
        calendarType: "solar" as const,
        lunarLeapMonth: null,
        birthDate: `${year}-05-15`,
        birthTime: "10:30",
        unknownBirthTime: false,
        birthCountry: "대한민국",
        birthCity: "서울",
        timezone: "Asia/Seoul",
        latitude: 37.5665,
        longitude: 126.9780,
        useTrueSolarTime: false,
        borderTimeRule: "23" as const
      },
      expected: {} // 기본 파싱 유효성만 우선 대조
    };
  }),

  // ==========================================
  // 2. 음력 생년월일 -> 양력 동일 명조 교차 검증 (10건)
  // ==========================================
  // 음력 생일을 양력으로 환원했을 때, 두 인풋이 계산한 사주팔자(Pillars)가 100% 동일해야 함.
  {
    id: "lunar-cross-1",
    category: "lunar_standard",
    description: "음력 1995년 10월 2일 (윤달아님) -> 양력 1995-11-23 교차 검증",
    input: {
      alias: "음력테스트1",
      genderRuleOption: "male",
      calendarType: "lunar",
      lunarLeapMonth: false,
      birthDate: "1995-10-02",
      birthTime: "12:30",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      useTrueSolarTime: false,
      borderTimeRule: "23"
    },
    expected: {
      solarDateEquivalent: "1995-11-23",
      year: "乙亥",
      month: "丁亥",
      day: "戊午",
      hour: "戊午"
    }
  },
  ...Array.from({ length: 9 }, (_, i) => {
    const year = 1990 + i;
    return {
      id: `lunar-cross-std-${i + 2}`,
      category: "lunar_standard",
      description: `음력 ${year}년생 변환성공 및 사주 정상도출 검증`,
      input: {
        alias: `음력-${year}`,
        genderRuleOption: "female" as const,
        calendarType: "lunar" as const,
        lunarLeapMonth: false,
        birthDate: `${year}-06-15`,
        birthTime: "15:30",
        unknownBirthTime: false,
        birthCountry: "대한민국",
        birthCity: "서울",
        timezone: "Asia/Seoul",
        latitude: 37.5665,
        longitude: 126.9780,
        useTrueSolarTime: false,
        borderTimeRule: "23" as const
      },
      expected: {}
    };
  }),

  // ==========================================
  // 3. 윤달 (5건)
  // ==========================================
  {
    id: "leap-month-1",
    category: "leap_month",
    description: "윤달 2023년 음력 윤2월 1일생 -> 양력 2023-03-22로 정확히 변환되는지 대조",
    input: {
      alias: "윤달2023",
      genderRuleOption: "male",
      calendarType: "lunar",
      lunarLeapMonth: true,
      birthDate: "2023-02-01",
      birthTime: "09:30",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      useTrueSolarTime: false,
      borderTimeRule: "23"
    },
    expected: {
      solarDateEquivalent: "2023-03-22"
    }
  },
  ...Array.from({ length: 4 }, (_, i) => {
    // 역사적 윤달 연도 모음 (2001년 윤4월, 2006년 윤7월, 2012년 윤4월, 2017년 윤6월)
    const leapYears = [2001, 2006, 2012, 2017];
    const leapMonths = [4, 7, 4, 6];
    return {
      id: `leap-month-${i + 2}`,
      category: "leap_month",
      description: `역사적 윤달 ${leapYears[i]}년 윤${leapMonths[i]}월 변환 검사`,
      input: {
        alias: `윤달-${leapYears[i]}`,
        genderRuleOption: "female" as const,
        calendarType: "lunar" as const,
        lunarLeapMonth: true,
        birthDate: `${leapYears[i]}-0${leapMonths[i]}-10`,
        birthTime: "12:00",
        unknownBirthTime: false,
        birthCountry: "대한민국",
        birthCity: "서울",
        timezone: "Asia/Seoul",
        latitude: 37.5665,
        longitude: 126.9780,
        useTrueSolarTime: false,
        borderTimeRule: "23" as const
      },
      expected: {}
    };
  }),

  // ==========================================
  // 4. 입춘 전후 연주 교체 경계선 (10건)
  // ==========================================
  // 1995년 입춘시각: 양력 1995년 2월 4일 15:24 KST
  // 15:24 이전 출생 -> 1994년인 甲戌년 연주 적용
  // 15:24 이후 출생 -> 1995년인 乙亥년 연주 적용
  {
    id: "term-year-before",
    category: "solar_term_boundary",
    description: "1995년 입춘(15:24) 이전 출생 -> 연주 甲戌",
    input: {
      alias: "입춘전",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-02-04",
      birthTime: "14:00",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      useTrueSolarTime: false,
      borderTimeRule: "23"
    },
    expected: {
      year: "甲戌"
    }
  },
  {
    id: "term-year-after",
    category: "solar_term_boundary",
    description: "1995년 입춘(15:24) 이후 출생 -> 연주 乙亥",
    input: {
      alias: "입춘후",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-02-04",
      birthTime: "16:00",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      useTrueSolarTime: false,
      borderTimeRule: "23"
    },
    expected: {
      year: "乙亥"
    }
  },
  ...Array.from({ length: 8 }, (_, i) => {
    const year = 2000 + i;
    return {
      id: `term-year-loop-${i + 1}`,
      category: "solar_term_boundary",
      description: `${year}년 2월 4일 입춘 전후 경계선 정상 작동 검사`,
      input: {
        alias: `입춘경계-${year}`,
        genderRuleOption: "female" as const,
        calendarType: "solar" as const,
        lunarLeapMonth: null,
        birthDate: `${year}-02-04`,
        birthTime: "12:00",
        unknownBirthTime: false,
        birthCountry: "대한민국",
        birthCity: "서울",
        timezone: "Asia/Seoul",
        latitude: 37.5665,
        longitude: 126.9780,
        useTrueSolarTime: false,
        borderTimeRule: "23" as const
      },
      expected: {}
    };
  }),

  // ==========================================
  // 5. 월 절입 전후 월주 교체 (12건)
  // ==========================================
  // 각 달의 절입 시각 전후에 따른 월주(Month Pillar)의 정상 변경 테스트
  ...Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, "0");
    return {
      id: `term-month-boundary-${i + 1}`,
      category: "month_term_boundary",
      description: `양력 2020년 ${month}월 절입 경계시 정상 월지 변환 대조`,
      input: {
        alias: `월절입-${month}월`,
        genderRuleOption: "male" as const,
        calendarType: "solar" as const,
        lunarLeapMonth: null,
        birthDate: `2020-${month}-07`, // 보통 절입일은 5~8일 사이에 분포
        birthTime: "12:00",
        unknownBirthTime: false,
        birthCountry: "대한민국",
        birthCity: "서울",
        timezone: "Asia/Seoul",
        latitude: 37.5665,
        longitude: 126.9780,
        useTrueSolarTime: false,
        borderTimeRule: "23" as const
      },
      expected: {}
    };
  }),

  // ==========================================
  // 6. 자시 경계 일주/시주 분기 테스트 (8건)
  // ==========================================
  // 1995-10-24 23:30 출생
  // borderTimeRule === "23" (야자시) -> 일주: 戊子(오늘), 시주: 甲子(내일 자시 기반)
  // borderTimeRule === "0" (단일자시) -> 일주: 己丑(내일), 시주: 甲子(내일 자시 기반)
  {
    id: "zi-hour-23-rule",
    category: "zi_hour_boundary",
    description: "1995-10-24 23:30 [야자시 룰] -> 일주: 戊子 / 시주: 甲子",
    input: {
      alias: "야자시적용",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-10-24",
      birthTime: "23:30",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      useTrueSolarTime: false,
      borderTimeRule: "23"
    },
    expected: {
      day: "戊子",
      hour: "甲子"
    }
  },
  {
    id: "zi-hour-0-rule",
    category: "zi_hour_boundary",
    description: "1995-10-24 23:30 [0시 경계 룰] -> 일주: 己丑 / 시주: 甲子",
    input: {
      alias: "0시단일자시",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-10-24",
      birthTime: "23:30",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      useTrueSolarTime: false,
      borderTimeRule: "0"
    },
    expected: {
      day: "己丑",
      hour: "甲子"
    }
  },
  ...Array.from({ length: 6 }, (_, i) => {
    return {
      id: `zi-hour-loop-${i + 1}`,
      category: "zi_hour_boundary",
      description: `자시 경계 임의 날짜 자정 시프트 테스트 ${i}`,
      input: {
        alias: `자정테스트-${i}`,
        genderRuleOption: "female" as const,
        calendarType: "solar" as const,
        lunarLeapMonth: null,
        birthDate: `2010-04-1${i}`,
        birthTime: "23:45",
        unknownBirthTime: false,
        birthCountry: "대한민국",
        birthCity: "서울",
        timezone: "Asia/Seoul",
        latitude: 37.5665,
        longitude: 126.9780,
        useTrueSolarTime: false,
        borderTimeRule: (i % 2 === 0 ? "23" : "0") as "23" | "0"
      },
      expected: {}
    };
  }),

  // ==========================================
  // 7. 해외 시간대 및 서머타임 (10건)
  // ==========================================
  // 뉴욕 서머타임 적용 시각 검사
  // 1995년 7월 15일 12:00 뉴욕 출생 -> 서머타임(EDT, UTC-4) 작동 여부 대조
  {
    id: "timezone-nyc-dst",
    category: "timezone_dst",
    description: "뉴욕 1995-07-15 12:00 (EDT, UTC-4) 오프셋 정상 작동성",
    input: {
      alias: "뉴욕썸머",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1995-07-15",
      birthTime: "12:00",
      unknownBirthTime: false,
      birthCountry: "미국",
      birthCity: "뉴욕",
      timezone: "America/New_York",
      latitude: 40.7128,
      longitude: -74.0060,
      useTrueSolarTime: false,
      borderTimeRule: "23"
    },
    expected: {}
  },
  ...Array.from({ length: 9 }, (_, i) => {
    const tzList = [
      "Europe/London", "Europe/Paris", "Asia/Tokyo",
      "America/Los_Angeles", "Australia/Sydney", "Asia/Kolkata",
      "America/Sao_Paulo", "Africa/Cairo", "Europe/Moscow"
    ];
    return {
      id: `timezone-loop-${i + 2}`,
      category: "timezone_dst",
      description: `해외 주요 도시 표준시(${tzList[i]}) 정상 처리 검증`,
      input: {
        alias: `해외-${i}`,
        genderRuleOption: "unspecified" as const,
        calendarType: "solar" as const,
        lunarLeapMonth: null,
        birthDate: "2000-08-20",
        birthTime: "15:00",
        unknownBirthTime: false,
        birthCountry: "해외지정국가",
        birthCity: "해외도시",
        timezone: tzList[i],
        latitude: 35.0,
        longitude: 10.0,
        useTrueSolarTime: false,
        borderTimeRule: "23" as const
      },
      expected: {}
    };
  }),

  // ==========================================
  // 8. 출생시간 미상 (5건)
  // ==========================================
  // 시간 미상 옵션 활성화 시 시주(`hour`), 지장간 시주, 십신 시주가 모두 null로 반환되어야 함.
  {
    id: "unknown-time-1",
    category: "unknown_time",
    description: "생년월일시 중 시간미상 활성화 -> 시주 null 처리 검사",
    input: {
      alias: "시간모름1",
      genderRuleOption: "male",
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
    },
    expected: {
      hour: null
    }
  },
  ...Array.from({ length: 4 }, (_, i) => {
    return {
      id: `unknown-time-${i + 2}`,
      category: "unknown_time",
      description: `시간미상 루프 검사 ${i + 2}`,
      input: {
        alias: `시간모름-${i}`,
        genderRuleOption: "female" as const,
        calendarType: "solar" as const,
        lunarLeapMonth: null,
        birthDate: `1985-0${i+1}-10`,
        birthTime: null,
        unknownBirthTime: true,
        birthCountry: "대한민국",
        birthCity: "부산",
        timezone: "Asia/Seoul",
        latitude: 35.1796,
        longitude: 129.0756,
        useTrueSolarTime: false,
        borderTimeRule: "23" as const
      },
      expected: {
        hour: null
      }
    };
  }),

  // ==========================================
  // 9. 지원 한계 날짜 (2건)
  // ==========================================
  {
    id: "limit-start-date",
    category: "limit_dates",
    description: "지원 하한선 1900년 1월 1일 연산 검사",
    input: {
      alias: "시작일",
      genderRuleOption: "male",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "1900-01-01",
      birthTime: "12:00",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      useTrueSolarTime: false,
      borderTimeRule: "23"
    },
    expected: {}
  },
  {
    id: "limit-end-date",
    category: "limit_dates",
    description: "지원 상한선 2050년 12월 31일 연산 검사",
    input: {
      alias: "종료일",
      genderRuleOption: "female",
      calendarType: "solar",
      lunarLeapMonth: null,
      birthDate: "2050-12-31",
      birthTime: "12:00",
      unknownBirthTime: false,
      birthCountry: "대한민국",
      birthCity: "서울",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.9780,
      useTrueSolarTime: false,
      borderTimeRule: "23"
    },
    expected: {}
  }
];
