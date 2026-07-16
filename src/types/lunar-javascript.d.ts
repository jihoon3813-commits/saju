declare module 'lunar-javascript' {
  export class Solar {
    static fromYmdHms(y: number, m: number, d: number, hour: number, minute: number, second: number): Solar;
    static fromJulianDay(julianDay: number): Solar;
    static fromDate(date: Date): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getLunar(): Lunar;
    toYmd(): string;
  }

  export class Lunar {
    static fromYmd(y: number, m: number, d: number): Lunar;
    static fromYmd(y: number, m: number, d: number, isLeap: boolean): Lunar;
    getSolar(): Solar;
    getEightChar(): EightChar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    toString(): string;
  }

  export class LunarYear {
    static fromYear(y: number): LunarYear;
    getLeapMonth(): number;
    getMonth(m: number): LunarMonth | null;
    getMonths(): LunarMonth[];
  }

  export class LunarMonth {
    getMonth(): number;
    isLeap(): boolean;
    getDayCount(): number;
    getFirstJulianDay(): number;
    toString(): string;
  }

  export class EightChar {
    getYearGan(): string;
    getYearZhi(): string;
    getYear(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getMonth(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getDay(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getTime(): string;
    getDayGanIndexExact(): number;
    getYun(gender: number): Yun;
  }

  export class Yun {
    getDaYun(): DaYun[];
    isForward(): boolean;
  }

  export class DaYun {
    getGanZhi(): string;
    getStartAge(): number;
    getLiuNian(): LiuNian[];
  }

  export class LiuNian {
    getGanZhi(): string;
    getYear(): number;
  }
}
