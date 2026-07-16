export interface TimezoneParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * 절대 시각(UTC Date)을 지정된 타임존으로 파싱하여 부위별 숫자를 추출합니다.
 */
export function getTzParts(date: Date, timezone: string): TimezoneParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => {
    const p = parts.find((x) => x.type === type);
    return p ? Number(p.value) : 0;
  };

  let hour = getPart("hour");
  if (hour === 24) hour = 0; // Intl의 24시 자정 처리 방지

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour,
    minute: getPart("minute"),
    second: getPart("second")
  };
}

/**
 * 입력된 로컬 생년월일시와 타임존 문자열로부터,
 * 실제 절대 시간(UTC Date) 및 해당 시점의 UTC 오프셋 분(Minutes)을 정확히 도출합니다.
 * 
 * @param timezone IANA 타임존 식별자 (예: 'Asia/Seoul')
 * @param year 년 (1900 ~ 2050)
 * @param month 월 (1 ~ 12)
 * @param day 일 (1 ~ 31)
 * @param hour 시 (0 ~ 23)
 * @param minute 분 (0 ~ 59)
 */
export function resolveTimezoneOffset(
  timezone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): { utcDate: Date; utcOffsetMinutes: number; isDst: boolean } {
  
  // 1. 초기 추정치 계산 (한국 등 대부분은 +9시간 전후이므로 가상 UTC 시간에서 빼기 시작)
  let guessOffsetMinutes = 540; // +9시간 기본 추정
  let utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute) - guessOffsetMinutes * 60 * 1000);

  // 2. 수렴 루프 (최대 4회 피드백 조정을 통해 실제 로컬 파츠와 일치하는 절대 시각 수렴)
  for (let i = 0; i < 4; i++) {
    const parts = getTzParts(utcDate, timezone);
    
    // 로컬 시간과 추정 시간의 차이를 계산
    const currentLocalMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    const targetLocalMs = Date.UTC(year, month - 1, day, hour, minute);
    
    const diffMinutes = (targetLocalMs - currentLocalMs) / (60 * 1000);
    
    if (diffMinutes === 0) {
      break; // 수렴 완료
    }
    
    guessOffsetMinutes += diffMinutes;
    utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute) - guessOffsetMinutes * 60 * 1000);
  }

  // 3. 최종 오프셋 확정
  // 오프셋 = (로컬 시간 밀리초 - UTC 시간 밀리초) / 1분 밀리초
  const finalLocalParts = getTzParts(utcDate, timezone);
  const finalLocalMs = Date.UTC(
    finalLocalParts.year,
    finalLocalParts.month - 1,
    finalLocalParts.day,
    finalLocalParts.hour,
    finalLocalParts.minute
  );
  
  const finalOffsetMinutes = Math.round((finalLocalMs - utcDate.getTime()) / (60 * 1000));

  // 4. 서머타임(DST) 적용 판정
  // 해당 타임존의 표준 동계 오프셋보다 크면 DST가 활성화된 것으로 판단
  // 한국의 역사적 표준오프셋은 +9시간(540) 또는 +8.5시간(510)이었습니다.
  // 일반적으로 서머타임은 표준시보다 +1시간(60분) 더 전진하므로, 표준 오프셋과 비교하여 판정합니다.
  let isDst = false;
  
  // 동계 표준 오프셋 판별용 (보통 1월의 오프셋이 표준 오프셋)
  const winterDate = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 15, 0, 0));
  const winterParts = getTzParts(winterDate, timezone);
  const winterLocalMs = Date.UTC(winterParts.year, winterParts.month - 1, winterParts.day, winterParts.hour, winterParts.minute);
  const winterOffset = Math.round((winterLocalMs - winterDate.getTime()) / (60 * 1000));
  
  if (finalOffsetMinutes > winterOffset) {
    isDst = true;
  }

  return {
    utcDate,
    utcOffsetMinutes: finalOffsetMinutes,
    isDst
  };
}
