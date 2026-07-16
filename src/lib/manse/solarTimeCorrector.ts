/**
 * 주어진 날짜의 균시차(Equation of Time - EoT)를 분(Minutes) 단위로 계산합니다.
 * 
 * @param date 검사할 표준 시각 Date 객체
 */
export function calculateEquationOfTime(date: Date): number {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const diffTime = date.getTime() - startOfYear.getTime();
  const d = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // 1월 1일 이후 누적 일수

  // B는 라디안 단위 변환각
  const B = ((360 / 365) * (d - 81) * Math.PI) / 180;
  
  // Spencer의 표준 근사 공식 (분 단위 반환)
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  
  return eot;
}

interface TrueSolarTimeResult {
  trueSolarTime: Date;           // 진태양시가 반영된 로컬 시간
  longitudeOffsetMinutes: number; // 경도 편차 (분)
  eotOffsetMinutes: number;       // 균시차 편차 (분)
  totalOffsetMinutes: number;     // 합산 보정값 (분)
}

/**
 * 출생지의 경도(Longitude) 및 균시차(EoT)를 반영하여 표준시를 진태양시로 보정합니다.
 * 
 * @param localStandardDate 입력받은 로컬 표준시 Date 객체
 * @param longitude 경도 (예: 서울 126.9780)
 * @param isEnabled 보정 켜기/끄기 옵션
 */
export function correctTrueSolarTime(
  localStandardDate: Date,
  longitude: number,
  isEnabled: boolean
): TrueSolarTimeResult {
  if (!isEnabled) {
    return {
      trueSolarTime: new Date(localStandardDate.getTime()),
      longitudeOffsetMinutes: 0,
      eotOffsetMinutes: 0,
      totalOffsetMinutes: 0
    };
  }

  // 1. 한국 표준시 자오선(동경 135도) 기준 경도 편차 계산
  // 1도 차이 = 4분 차이
  const longitudeOffsetMinutes = (longitude - 135) * 4;

  // 2. 지구 공전/자전 편차인 균시차(EoT) 계산
  const eotOffsetMinutes = calculateEquationOfTime(localStandardDate);

  // 3. 총 보정 분 계산
  const totalOffsetMinutes = longitudeOffsetMinutes + eotOffsetMinutes;

  // 4. 로컬 시간 가감 처리 (밀리초 단위 계산)
  const trueSolarTime = new Date(localStandardDate.getTime() + Math.round(totalOffsetMinutes * 60 * 1000));

  return {
    trueSolarTime,
    longitudeOffsetMinutes,
    eotOffsetMinutes,
    totalOffsetMinutes
  };
}
