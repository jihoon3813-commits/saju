export interface CityData {
  name: string;      // 도시명 (한글)
  englishName: string;
  country: string;   // 국가명
  timezone: string;  // IANA 시간대 (예: Asia/Seoul)
  latitude: number;  // 위도
  longitude: number; // 경도
}

export const CITIES_DATABASE: CityData[] = [
  { name: "서울", englishName: "Seoul", country: "대한민국", timezone: "Asia/Seoul", latitude: 37.5665, longitude: 126.9780 },
  { name: "부산", englishName: "Busan", country: "대한민국", timezone: "Asia/Seoul", latitude: 35.1796, longitude: 129.0756 },
  { name: "인천", englishName: "Incheon", country: "대한민국", timezone: "Asia/Seoul", latitude: 37.4563, longitude: 126.7052 },
  { name: "대구", englishName: "Daegu", country: "대한민국", timezone: "Asia/Seoul", latitude: 35.8714, longitude: 128.6014 },
  { name: "대전", englishName: "Daejeon", country: "대한민국", timezone: "Asia/Seoul", latitude: 36.3504, longitude: 127.3845 },
  { name: "광주", englishName: "Gwangju", country: "대한민국", timezone: "Asia/Seoul", latitude: 35.1595, longitude: 126.8526 },
  { name: "울산", englishName: "Ulsan", country: "대한민국", timezone: "Asia/Seoul", latitude: 35.5389, longitude: 129.3114 },
  { name: "수원", englishName: "Suwon", country: "대한민국", timezone: "Asia/Seoul", latitude: 37.2636, longitude: 127.0286 },
  { name: "제주", englishName: "Jeju", country: "대한민국", timezone: "Asia/Seoul", latitude: 33.4996, longitude: 126.5312 },
  { name: "창원", englishName: "Changwon", country: "대한민국", timezone: "Asia/Seoul", latitude: 35.2281, longitude: 128.6811 },
  { name: "청주", englishName: "Cheongju", country: "대한민국", timezone: "Asia/Seoul", latitude: 36.6372, longitude: 127.4897 },
  { name: "전주", englishName: "Jeonju", country: "대한민국", timezone: "Asia/Seoul", latitude: 35.8242, longitude: 127.1480 },
  { name: "춘천", englishName: "Chuncheon", country: "대한민국", timezone: "Asia/Seoul", latitude: 37.8813, longitude: 127.7300 },
  
  // 글로벌 주요 도시 (서머타임 및 시차 검증용)
  { name: "도쿄", englishName: "Tokyo", country: "일본", timezone: "Asia/Tokyo", latitude: 35.6762, longitude: 139.6503 },
  { name: "베이징", englishName: "Beijing", country: "중국", timezone: "Asia/Shanghai", latitude: 39.9042, longitude: 116.4074 },
  { name: "뉴욕", englishName: "New York", country: "미국", timezone: "America/New_York", latitude: 40.7128, longitude: -74.0060 },
  { name: "로스앤젤레스", englishName: "Los Angeles", country: "미국", timezone: "America/Los_Angeles", latitude: 34.0522, longitude: -118.2437 },
  { name: "런던", englishName: "London", country: "영국", timezone: "Europe/London", latitude: 51.5074, longitude: -0.1278 },
  { name: "파리", englishName: "Paris", country: "프랑스", timezone: "Europe/Paris", latitude: 48.8566, longitude: 2.3522 },
  { name: "시드니", englishName: "Sydney", country: "호주", timezone: "Australia/Sydney", latitude: -33.8688, longitude: 151.2093 },
  { name: "하노이", englishName: "Hanoi", country: "베트남", timezone: "Asia/Ho_Chi_Minh", latitude: 21.0285, longitude: 105.8542 }
];

export const TIMEZONES_LIST = [
  "Asia/Seoul",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Bangkok",
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Australia/Sydney",
  "UTC"
];
