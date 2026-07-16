import { Solar, Lunar, LunarYear, DaYun, LiuNian } from "lunar-javascript";
import { resolveTimezoneOffset, getTzParts } from "./timezoneResolver";
import { correctTrueSolarTime } from "./solarTimeCorrector";
import { ChartResult, Pillar } from "./types";

// 오행 상수 정의
export const STEM_ELEMENTS: Record<string, "wood" | "fire" | "earth" | "metal" | "water"> = {
  甲: "wood", 乙: "wood",
  丙: "fire", 丁: "fire",
  戊: "earth", 己: "earth",
  庚: "metal", 辛: "metal",
  壬: "water", 癸: "water"
};

export const BRANCH_ELEMENTS: Record<string, "wood" | "fire" | "earth" | "metal" | "water"> = {
  寅: "wood", 卯: "wood",
  巳: "fire", 午: "fire",
  辰: "earth", 戌: "earth", 丑: "earth", 未: "earth",
  申: "metal", 酉: "metal",
  亥: "water", 子: "water"
};

// 음양 상수 정의
export const STEM_YIN_YANG: Record<string, "yang" | "yin"> = {
  甲: "yang", 丙: "yang", 戊: "yang", 庚: "yang", 壬: "yang",
  乙: "yin", 丁: "yin", 己: "yin", 辛: "yin", 癸: "yin"
};

export const BRANCH_YIN_YANG: Record<string, "yang" | "yin"> = {
  子: "yang", 寅: "yang", 辰: "yang", 午: "yang", 申: "yang", 戌: "yang",
  丑: "yin", 卯: "yin", 巳: "yin", 未: "yin", 酉: "yin", 亥: "yin"
};

// 지장간 정기 매핑 (십신 연산용)
export const BRANCH_REGNANT: Record<string, string> = {
  子: "癸", 丑: "己", 寅: "甲", 卯: "乙", 辰: "戊",
  巳: "丙", 午: "丁", 未: "己", 申: "庚", 酉: "辛",
  戌: "戊", 亥: "壬"
};

// 지지별 지장간 전체 매핑
export const HIDDEN_STEMS_MAP: Record<string, string[]> = {
  子: ["壬", "癸"],
  丑: ["癸", "辛", "己"],
  寅: ["戊", "丙", "甲"],
  卯: ["甲", "乙"],
  辰: ["乙", "癸", "戊"],
  巳: ["戊", "庚", "丙"],
  午: ["丙", "己", "丁"],
  未: ["丁", "乙", "己"],
  申: ["戊", "壬", "庚"],
  酉: ["庚", "辛"],
  戌: ["辛", "丁", "戊"],
  亥: ["戊", "甲", "壬"]
};

// 오행 순서 (비 식 재 관 인 연산용)
const ELEMENTS_ORDER = ["wood", "fire", "earth", "metal", "water"] as const;

/**
 * 일간(self)과 대상 천간(target)을 비교하여 십신(Ten God)명을 반환합니다.
 */
export function calculateTenGod(self: string, target: string): string {
  const selfEl = STEM_ELEMENTS[self];
  const targetEl = STEM_ELEMENTS[target];
  const selfPol = STEM_YIN_YANG[self];
  const targetPol = STEM_YIN_YANG[target];

  if (!selfEl || !targetEl) return "미상";

  const selfIdx = ELEMENTS_ORDER.indexOf(selfEl);
  const targetIdx = ELEMENTS_ORDER.indexOf(targetEl);
  
  // 오행 간 상생상극 오프셋 계산 (0: 비겁, 1: 식상, 2: 재성, 3: 관성, 4: 인성)
  const relation = (targetIdx - selfIdx + 5) % 5;
  const isSamePolarity = selfPol === targetPol;

  switch (relation) {
    case 0:
      return isSamePolarity ? "비견" : "겁재";
    case 1:
      return isSamePolarity ? "식신" : "상관";
    case 2:
      return isSamePolarity ? "편재" : "정재";
    case 3:
      return isSamePolarity ? "편관" : "정관";
    case 4:
      return isSamePolarity ? "편인" : "정인";
    default:
      return "미상";
  }
}

/**
 * 형충회합(합충형해파) 관계 분석기
 */
export function analyzeRelations(
  stems: string[],
  branches: string[]
): ChartResult["relations"] {
  const stemCombinations: string[] = [];
  const stemClashes: string[] = [];
  const branchCombinations: string[] = [];
  const branchClashes: string[] = [];
  const punishments: string[] = [];
  const harms: string[] = [];
  const destructions: string[] = [];

  // 천간합/충 조건 정의
  const STEM_COMBOS = [
    { pair: ["甲", "己"], name: "甲己 합화토" },
    { pair: ["乙", "庚"], name: "乙庚 합화금" },
    { pair: ["丙", "辛"], name: "丙辛 합화수" },
    { pair: ["丁", "壬"], name: "丁壬 합화목" },
    { pair: ["戊", "癸"], name: "戊癸 합화화" }
  ];
  const STEM_CLASHES = [
    { pair: ["甲", "庚"], name: "甲庚 충" },
    { pair: ["乙", "辛"], name: "乙辛 충" },
    { pair: ["丙", "壬"], name: "丙壬 충" },
    { pair: ["丁", "癸"], name: "丁癸 충" }
  ];

  // 천간 조사
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const s1 = stems[i];
      const s2 = stems[j];
      if (!s1 || !s2) continue;

      // 천간합
      const combo = STEM_COMBOS.find((c) => c.pair.includes(s1) && c.pair.includes(s2) && s1 !== s2);
      if (combo && !stemCombinations.includes(combo.name)) {
        stemCombinations.push(combo.name);
      }
      // 천간충
      const clash = STEM_CLASHES.find((c) => c.pair.includes(s1) && c.pair.includes(s2) && s1 !== s2);
      if (clash && !stemClashes.includes(clash.name)) {
        stemClashes.push(clash.name);
      }
    }
  }

  // 지지충/합/형/해/파 조건 정의
  const BRANCH_CLASHES = [
    { pair: ["子", "午"], name: "子午 충" },
    { pair: ["丑", "未"], name: "丑未 충" },
    { pair: ["寅", "申"], name: "寅申 충" },
    { pair: ["卯", "酉"], name: "卯酉 충" },
    { pair: ["辰", "戌"], name: "辰戌 충" },
    { pair: ["巳", "亥"], name: "巳亥 충" }
  ];
  const BRANCH_COMBOS_6 = [
    { pair: ["子", "丑"], name: "子丑 합화토" },
    { pair: ["寅", "亥"], name: "寅亥 합화목" },
    { pair: ["卯", "戌"], name: "卯戌 합화화" },
    { pair: ["辰", "酉"], name: "辰酉 합화금" },
    { pair: ["巳", "申"], name: "巳申 합화수" },
    { pair: ["午", "未"], name: "午未 합화화" }
  ];
  const BRANCH_COMBOS_3 = [
    { triple: ["亥", "卯", "未"], name: "亥卯未 삼합목국" },
    { triple: ["寅", "午", "戌"], name: "寅午戌 삼합화국" },
    { triple: ["巳", "酉", "丑"], name: "巳酉丑 삼합금국" },
    { triple: ["申", "子", "辰"], name: "申子辰 삼합수국" }
  ];
  const BRANCH_COMBOS_BANG = [
    { triple: ["寅", "卯", "辰"], name: "寅卯辰 방합목국" },
    { triple: ["巳", "午", "未"], name: "巳午未 방합화국" },
    { triple: ["申", "酉", "戌"], name: "申酉戌 방합금국" },
    { triple: ["亥", "子", "丑"], name: "亥子丑 방합수국" }
  ];
  const BRANCH_HARMS = [
    { pair: ["子", "未"], name: "子未 해" },
    { pair: ["丑", "午"], name: "丑午 해" },
    { pair: ["寅", "巳"], name: "寅巳 해" },
    { pair: ["卯", "辰"], name: "卯辰 해" },
    { pair: ["申", "亥"], name: "申亥 해" },
    { pair: ["酉", "戌"], name: "酉戌 해" }
  ];
  const BRANCH_DESTRUCTIONS = [
    { pair: ["子", "酉"], name: "子酉 파" },
    { pair: ["寅", "亥"], name: "寅亥 파" },
    { pair: ["卯", "午"], name: "卯午 파" },
    { pair: ["辰", "丑"], name: "辰丑 파" },
    { pair: ["巳", "申"], name: "巳申 파" },
    { pair: ["未", "戌"], name: "未戌 파" }
  ];

  // 지지 삼합/방합 조사
  const branchSet = new Set(branches);
  BRANCH_COMBOS_3.forEach((c) => {
    if (c.triple.every((b) => branchSet.has(b))) {
      branchCombinations.push(c.name);
    }
  });
  BRANCH_COMBOS_BANG.forEach((c) => {
    if (c.triple.every((b) => branchSet.has(b))) {
      branchCombinations.push(c.name);
    }
  });

  // 지지 1대1 관계 조사
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const b1 = branches[i];
      const b2 = branches[j];
      if (!b1 || !b2) continue;

      // 지지충
      const clash = BRANCH_CLASHES.find((c) => c.pair.includes(b1) && c.pair.includes(b2) && b1 !== b2);
      if (clash && !branchClashes.includes(clash.name)) {
        branchClashes.push(clash.name);
      }
      // 지지육합
      const combo6 = BRANCH_COMBOS_6.find((c) => c.pair.includes(b1) && c.pair.includes(b2) && b1 !== b2);
      if (combo6 && !branchCombinations.includes(combo6.name)) {
        branchCombinations.push(combo6.name);
      }
      // 지지해
      const harm = BRANCH_HARMS.find((c) => c.pair.includes(b1) && c.pair.includes(b2) && b1 !== b2);
      if (harm && !harms.includes(harm.name)) {
        harms.push(harm.name);
      }
      // 지지파
      const dest = BRANCH_DESTRUCTIONS.find((c) => c.pair.includes(b1) && c.pair.includes(b2) && b1 !== b2);
      if (dest && !destructions.includes(dest.name)) {
        destructions.push(dest.name);
      }

      // 상형 (子卯)
      if ((b1 === "子" && b2 === "卯") || (b1 === "卯" && b2 === "子")) {
        if (!punishments.includes("子卯 상형")) punishments.push("子卯 상형");
      }
    }
  }

  // 삼형 조사 (寅巳申, 丑戌未)
  if (branchSet.has("寅") && branchSet.has("巳") && branchSet.has("申")) {
    punishments.push("寅巳申 삼형");
  }
  if (branchSet.has("丑") && branchSet.has("戌") && branchSet.has("未")) {
    punishments.push("丑戌未 삼형");
  }

  // 자형 조사 (동일 지지가 2개 이상일 때 자형 성립: 辰, 午, 酉, 亥)
  const branchCounts: Record<string, number> = {};
  branches.forEach((b) => {
    if (b) branchCounts[b] = (branchCounts[b] || 0) + 1;
  });
  ["辰", "午", "酉", "亥"].forEach((b) => {
    if ((branchCounts[b] || 0) >= 2) {
      punishments.push(`${b}${b} 자형`);
    }
  });

  return {
    stemCombinations,
    stemClashes,
    branchCombinations,
    branchClashes,
    punishments,
    harms,
    destructions
  };
}

/**
 * 만세력 연산 핵심 함수
 */
export function calculateManseChart(input: {
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
}): ChartResult {
  const [inYear, inMonth, inDay] = input.birthDate.split("-").map(Number);
  const isLunar = input.calendarType === "lunar";
  const isLeap = !!input.lunarLeapMonth;

  // 1. 음력 -> 양력 1차 변환 (양력인 경우 인입값 그대로 사용)
  let solarYear = inYear;
  let solarMonth = inMonth;
  let solarDay = inDay;

  if (isLunar) {
    // 윤달 유효성 검증
    if (isLeap) {
      const ly = LunarYear.fromYear(inYear);
      const actualLeapMonth = ly.getLeapMonth();
      if (actualLeapMonth === 0 || actualLeapMonth !== inMonth) {
        throw new Error("입력하신 음력 날짜(혹은 윤달)가 해당 연도 범위 내에 존재하지 않습니다.");
      }
    }
    try {
      const resolvedMonth = isLeap ? -inMonth : inMonth;
      const lunarObj = Lunar.fromYmd(inYear, resolvedMonth, inDay);
      const solarObj = lunarObj.getSolar();
      solarYear = solarObj.getYear();
      solarMonth = solarObj.getMonth();
      solarDay = solarObj.getDay();
    } catch {
      throw new Error("입력하신 음력 날짜(혹은 윤달)가 해당 연도 범위 내에 존재하지 않습니다.");
    }
  }

  // 가상 시간 할당 (시간 모름인 경우 오프셋 추정 및 연산을 위해 12:00 정오 배정)
  let solarHour = 12;
  let solarMinute = 0;
  if (!input.unknownBirthTime && input.birthTime) {
    const [h, m] = input.birthTime.split(":").map(Number);
    solarHour = h;
    solarMinute = m;
  }

  // 2. 타임존 분석 및 절대 시각 수립
  const tzResult = resolveTimezoneOffset(
    input.timezone,
    solarYear,
    solarMonth,
    solarDay,
    solarHour,
    solarMinute
  );

  // 3. 진태양시 천문학적 시간 보정
  const solarCorrector = correctTrueSolarTime(
    tzResult.utcDate, // 표준 로컬 시각을 반영한 가상 UTC 시각
    input.longitude,
    input.useTrueSolarTime
  );

  // 보정된 로컬 생년월일시 추출 (머신 독립적으로 getTzParts 적용)
  const correctedDate = solarCorrector.trueSolarTime;
  const cParts = getTzParts(correctedDate, input.timezone);
  let cYear = cParts.year;
  let cMonth = cParts.month;
  let cDay = cParts.day;
  let cHour = cParts.hour;
  let cMinute = cParts.minute;

  // 4. 자시 경계(borderTimeRule) 일주 및 시주 배정 보정
  // 만약 단일 자시(0시 경계 룰, Option 0)이고 보정된 시간이 23:00~23:59 사이라면,
  // 1시간을 더하여 다음날 00시대로 캘린더 날짜를 임시 이동하여 간지를 연산시킵니다.
  if (input.borderTimeRule === "0" && cHour === 23 && !input.unknownBirthTime) {
    const nextHourDate = new Date(correctedDate.getTime() + 60 * 60 * 1000);
    cYear = nextHourDate.getFullYear();
    cMonth = nextHourDate.getMonth() + 1;
    cDay = nextHourDate.getDate();
    cHour = nextHourDate.getHours();
    cMinute = nextHourDate.getMinutes();
  }

  // 5. lunar-javascript 기동하여 사주 팔자 객체 생성
  // 시간 미상인 경우 정오(12:00)로 가배치해 일주를 구하고 시주는 최종 null 처리
  const finalSolarObj = Solar.fromYmdHms(cYear, cMonth, cDay, cHour, cMinute, 0);
  const finalLunarObj = finalSolarObj.getLunar();
  const eightChar = finalLunarObj.getEightChar();

  // 사주 4주 8자 간지 맵핑
  const yearPillar: Pillar = { stem: eightChar.getYearGan(), branch: eightChar.getYearZhi() };
  const monthPillar: Pillar = { stem: eightChar.getMonthGan(), branch: eightChar.getMonthZhi() };
  const dayPillar: Pillar = { stem: eightChar.getDayGan(), branch: eightChar.getDayZhi() };
  const hourPillar: Pillar | null = input.unknownBirthTime
    ? null
    : { stem: eightChar.getTimeGan(), branch: eightChar.getTimeZhi() };

  // 야자시/조자시 분할 룰(Option 23)이고 실제 시간이 23:00~23:59(야자시)인 경우:
  // lunar-javascript의 기본 동작은 일주를 오늘로 유지하고 시주를 내일 자시로 설정하므로
  // 이미 lunar-javascript가 그렇게 돌고 있으므로 추가 보정이 필요 없습니다.
  // 단, 00:00~00:59(조자시)인 경우도 일주는 오늘이고 시주는 오늘 자시(임자 등)가 되므로 그대로 둡니다.

  // 6. 오행 분포 분석
  const pillarsList: Pillar[] = [yearPillar, monthPillar, dayPillar];
  if (hourPillar) pillarsList.push(hourPillar);

  const elementsDistribution = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  let yangCount = 0;
  let yinCount = 0;

  pillarsList.forEach((p) => {
    // 천간 오행
    const stemEl = STEM_ELEMENTS[p.stem];
    if (stemEl) elementsDistribution[stemEl]++;
    
    // 지지 오행
    const branchEl = BRANCH_ELEMENTS[p.branch];
    if (branchEl) elementsDistribution[branchEl]++;

    // 음양 계산
    const stemYY = STEM_YIN_YANG[p.stem];
    if (stemYY === "yang") yangCount++; else if (stemYY === "yin") yinCount++;

    const branchYY = BRANCH_YIN_YANG[p.branch];
    if (branchYY === "yang") yangCount++; else if (branchYY === "yin") yinCount++;
  });

  // 7. 지장간 및 십신 매핑
  const selfStem = dayPillar.stem; // 일주 천간(나 자신)

  const tenGods = {
    year: { stem: calculateTenGod(selfStem, yearPillar.stem), branch: calculateTenGod(selfStem, BRANCH_REGNANT[yearPillar.branch]) },
    month: { stem: calculateTenGod(selfStem, monthPillar.stem), branch: calculateTenGod(selfStem, BRANCH_REGNANT[monthPillar.branch]) },
    day: { branch: calculateTenGod(selfStem, BRANCH_REGNANT[dayPillar.branch]) },
    hour: hourPillar
      ? { stem: calculateTenGod(selfStem, hourPillar.stem), branch: calculateTenGod(selfStem, BRANCH_REGNANT[hourPillar.branch]) }
      : null
  };

  const hiddenStems = {
    year: HIDDEN_STEMS_MAP[yearPillar.branch] || [],
    month: HIDDEN_STEMS_MAP[monthPillar.branch] || [],
    day: HIDDEN_STEMS_MAP[dayPillar.branch] || [],
    hour: hourPillar ? (HIDDEN_STEMS_MAP[hourPillar.branch] || []) : null
  };

  // 8. 형충회합 관계 도출
  const presentStems = [yearPillar.stem, monthPillar.stem, dayPillar.stem];
  if (hourPillar) presentStems.push(hourPillar.stem);

  const presentBranches = [yearPillar.branch, monthPillar.branch, dayPillar.branch];
  if (hourPillar) presentBranches.push(hourPillar.branch);

  const relations = analyzeRelations(presentStems, presentBranches);

  // 9. 대운 (Luck Cycles) 도출
  // 성별 정규화 (명리는 남성:1, 여성:0 으로 운의 흐름을 대운 기점 계산)
  const genderNum = input.genderRuleOption === "female" ? 0 : 1; 
  const yun = eightChar.getYun(genderNum);
  const daYunRawList = yun.getDaYun();
  
  // 첫 번째 빈 대운 기점 제외(index 0은 대운 시작 전 동한/소운 기간)
  const cycles = daYunRawList.slice(1).map((dy: DaYun) => {
    const dyGanZhi = dy.getGanZhi();
    const dyStem = dyGanZhi.substring(0, 1);
    const dyBranch = dyGanZhi.substring(1, 2);
    return {
      age: dy.getStartAge(),
      stem: dyStem,
      branch: dyBranch,
      tenGod: calculateTenGod(selfStem, dyStem)
    };
  });

  // 10. 세운 (Annual Luck) 목록 생성
  // 대운 주기별 각 10년의 세운 리스트들을 전체 병합 처리
  const annualLuck = daYunRawList.slice(1).flatMap((dy: DaYun) => {
    return dy.getLiuNian().map((ln: LiuNian) => {
      const lnGanZhi = ln.getGanZhi();
      const lnStem = lnGanZhi.substring(0, 1);
      const lnBranch = lnGanZhi.substring(1, 2);
      return {
        year: ln.getYear(),
        stem: lnStem,
        branch: lnBranch,
        tenGod: calculateTenGod(selfStem, lnStem)
      };
    });
  });

  // 11. 최종 객체 빌드
  const normalizedInput = {
    alias: input.alias,
    genderRuleOption: input.genderRuleOption,
    calendarType: input.calendarType,
    lunarLeapMonth: input.lunarLeapMonth,
    birthDate: input.birthDate,
    birthTime: input.unknownBirthTime ? null : input.birthTime,
    unknownBirthTime: input.unknownBirthTime,
    timezone: input.timezone
  };

  const calculationBasis = {
    timezone: input.timezone,
    solarDate: `${solarYear}-${String(solarMonth).padStart(2, "0")}-${String(solarDay).padStart(2, "0")}`,
    utcOffsetMinutes: tzResult.utcOffsetMinutes,
    solarTimeAdjusted: input.useTrueSolarTime,
    trueSolarTime: input.useTrueSolarTime
      ? `${cYear}-${String(cMonth).padStart(2, "0")}-${String(cDay).padStart(2, "0")} ${String(cHour).padStart(2, "0")}:${String(cMinute).padStart(2, "0")}`
      : null,
    dayBoundaryRule: input.borderTimeRule,
    unknownBirthTime: input.unknownBirthTime,
    engineVersion: "1.0.0",
    ruleSetVersion: "1.0",
    calculationTimestamp: new Date().toISOString()
  };

  return {
    normalizedInput,
    calculationBasis,
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    },
    elementsDistribution,
    yinYang: {
      yang: yangCount,
      yin: yinCount
    },
    hiddenStems,
    tenGods,
    relations,
    luckCycles: {
      direction: yun.isForward() ? "forward" : "backward",
      startAge: daYunRawList[1]?.getStartAge() || 1, // 대운수
      cycles
    },
    annualLuck
  };
}
