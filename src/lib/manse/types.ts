export interface Pillar {
  stem: string;   // 천간 (예: '甲')
  branch: string; // 지지 (예: '子')
}

export interface ChartResult {
  normalizedInput: {
    alias: string;
    genderRuleOption: "male" | "female" | "unspecified";
    calendarType: "solar" | "lunar";
    lunarLeapMonth: boolean | null;
    birthDate: string; // YYYY-MM-DD
    birthTime: string | null; // HH:MM
    unknownBirthTime: boolean;
    timezone: string;
  };
  calculationBasis: {
    timezone: string;
    solarDate: string; // 환원 완료된 양력 날짜 (YYYY-MM-DD)
    utcOffsetMinutes: number;
    solarTimeAdjusted: boolean;
    trueSolarTime: string | null; // 보정 완료된 시각
    dayBoundaryRule: "23" | "0";
    unknownBirthTime: boolean;
    engineVersion: string;
    ruleSetVersion: string;
    calculationTimestamp: string;
  };
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar | null; // 시간 미상이면 null
  };
  elementsDistribution: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  yinYang: {
    yang: number;
    yin: number;
  };
  hiddenStems: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[] | null;
  };
  tenGods: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { branch: string }; // 일간은 주체이므로 생략
    hour: { stem: string; branch: string } | null;
  };
  relations: {
    stemCombinations: string[];
    stemClashes: string[];
    branchCombinations: string[];
    branchClashes: string[];
    punishments: string[];
    harms: string[];
    destructions: string[];
  };
  luckCycles: {
    direction: "forward" | "backward";
    startAge: number; // 대운수
    cycles: {
      age: number;
      stem: string;
      branch: string;
      tenGod: string;
    }[];
  };
  annualLuck: {
    year: number;
    stem: string;
    branch: string;
    tenGod: string;
  }[];
}
