declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    getLunar(): Lunar;
    toFullString(): string;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
  }

  export class Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    toFullString(): string;
  }

  export class EightChar {
    static fromLunar(lunar: Lunar): EightChar;
    getYear(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getYearHideGan(): string[];
    getYearWuXing(): string;
    getYearNaYin(): string;
    getYearShiShenGan(): string;
    getYearShiShenZhi(): string[];
    getYearDiShi(): string;
    getMonth(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getMonthHideGan(): string[];
    getMonthWuXing(): string;
    getMonthNaYin(): string;
    getMonthShiShenGan(): string;
    getMonthShiShenZhi(): string[];
    getMonthDiShi(): string;
    getDay(): string;
    getDayGan(): string;
    getDayGanIndex(): number;
    getDayZhi(): string;
    getDayZhiIndex(): number;
    getDayHideGan(): string[];
    getDayWuXing(): string;
    getDayNaYin(): string;
    getDayShiShenGan(): string;
    getDayShiShenZhi(): string[];
    getDayDiShi(): string;
    getTime(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getTimeHideGan(): string[];
    getTimeWuXing(): string;
    getTimeNaYin(): string;
    getTimeShiShenGan(): string;
    getTimeShiShenZhi(): string[];
    getTimeDiShi(): string;
    getYun(gender: number): Yun;
    getTaiYuan(): string;
    getTaiXi(): string;
    getMingGong(): string;
    getShenGong(): string;
    getYearXun(): string;
    getYearXunKong(): string;
    getMonthXun(): string;
    getMonthXunKong(): string;
    getDayXun(): string;
    getDayXunKong(): string;
    getTimeXun(): string;
    getTimeXunKong(): string;
  }

  export class Yun {
    getGender(): number;
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getStartHour(): number;
    isForward(): boolean;
    getLunar(): Lunar;
    getStartSolar(): Solar;
    getDaYun(): DaYun[];
  }

  export class DaYun {
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
    getIndex(): number;
    getGanZhi(): string;
    getXun(): string;
    getXunKong(): string;
    getLiuNian(): unknown[];
    getXiaoYun(): unknown[];
  }
}
