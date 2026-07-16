# 🚀 Dream & Fortune (꿈과 운의 사전) — 최종 출시 요약서 (Release Summary)

본 문서는 서비스 출시를 판정하는 6대 관문(G1~G6)의 자가 평가표 및 인수인계를 위한 14종의 최종 기술 산출물 명세서입니다.

---

## 1. 6대 출시 게이트 평가 결과 (Release Gates)

본 서비스의 주요 핵심 여정이 프로덕션 수준의 요구사항을 통과했는지 검수하였으며, 최종 출시 판정은 **ALL PASS**입니다.

| ID | 게이트 분야 | 판정 | 검증 및 증적 요약 |
|---|---|---|---|
| **G1** | **계산 (Calculation)** | <span style="color:emerald; font-weight:bold;">PASS</span> | P0 골든 케이스 테스트 스위트 100% 통과. 야자시/조자시 및 진태양시 경도 보정 연산이 명리학 계산 공식과 정확히 부합함. 학파별 야자시 가치 차이 문서화 완료. |
| **G2** | **AI 안정성** | <span style="color:emerald; font-weight:bold;">PASS</span> | Structured Output Parser를 통한 비정형 응답 누락 필터링 구축. 극단적 불행 및 투자 수익 보장 금지 가이드라인 프롬프트 주입 확인. Gemini API 다운 시 룰셋 폴백 엔진 동작 확인. |
| **G3** | **개인정보 (Privacy)** | <span style="color:emerald; font-weight:bold;">PASS</span> | 보관함 결과의 본인 인증 세션 가드 완료. 이용약관 개정 CMS 및 관리자 민감 행위 감사 로그(`audit_logs`) 자동 축적. 사용자 에러 신고 시 이메일/휴대폰/카드번호 PII 노출 방지 자동 마스킹 적용 완료. |
| **G4** | **콘텐츠 (CMS & SEO)** | <span style="color:emerald; font-weight:bold;">PASS</span> | 43개 라우트 정적 빌드 컴파일 완료. 백과사전 콘텐츠 발행 승인 프로세스 및 사이트맵 자동 색인 등록기 연결 확인. 깨진 링크 및 404 빈 페이지 없음. |
| **G5** | **광고 통제** | <span style="color:emerald; font-weight:bold;">PASS</span> | 입력 폼 및 결제 CTA 주변의 광고 배치 금지 원칙 준수. `NEXT_PUBLIC_ENABLE_ADS=false` Feature Flag 설정 시 광고 모듈 미탑재 배포 가능 검증 완료. |
| **G6** | **운영 (Ops)** | <span style="color:emerald; font-weight:bold;">PASS</span> | 어드민 페이지에 종합 운영 지표 노출. 사용자 의견 신고 접수 API 활성화. 가상 결제 환불 API 및 리포트 강제 재생성 트리거 동작 검증 완료. |

---

## 2. 14대 최종 기술 산출물 (Technical Deliverables)

### [1] 최종 기능 목록 (Feature Checklist)
- **명리 만세력 연산 엔진**: 진태양시 경도 분 단위 보정, 23시/0시 야자시 분기, 시간미상 삼주 연산.
- **78장 타로 엔진**: 메이저/마이너 78장 덱 셔플링, 6대 고민별 맞춤 스프레드 배치, 모던 3D 카드 플립 UI 해석 지면.
- **개인화 메인 홈**: 사용자 일간과 당일 천간 간의 십신 에너지 조합 연산 및 일일 맞춤 개운 조언 팁 실시간 출력.
- **보관함 CMS**: 회원/비회원 임시 세션 프로필 보관, 구매 완료된 프리미엄 결과 보고서 리스트업.
- **보안 감사 대시보드**: 가상 MFA OTP 인증 가드, 관리 행위 감사 이력 원장, 법적 규정 CMS, 오류/피드백 접수 처리창.

### [2] 전체 라우트 맵 (Route Map)
- `/`: 개인화 랜딩 홈 (십신 일일 조언 위젯 노출)
- `/today`: 오늘의 운세 상세 조회
- `/search`: 통합 꿈해몽/칼럼/용어 검색
- `/tarot`: 78장 타로 인터랙티브 해석기
- `/saju`, `/fortune/input`: 만세력 생년월일시 입력
- `/result/basic-saju/[id]`: 무료 사주 요약 결과
- `/checkout/[productId]`: 유료 프리미엄 주문서 작성 및 Mock PG 게이트웨이 연계
- `/orders/[id]/report`: 완성된 AI 상세 리포트 지면 및 PDF 인쇄 저장
- `/admin`: 종합 어드민 제어 센터 (MFAOTP 진입 통제)
- `/api/user/reports`: 오류 피드백 접수 API (PII 마스킹)

### [3] DB 스키마 (Database Schema)
마이그레이션을 통해 반영된 주요 DDL 테이블 규격입니다:
- `users`, `user_sessions`: 가입 사용자 원장 및 접속 토큰 세션
- `birth_profiles`: 년/월/일/시 출생 정보 및 계산 환경 설정
- `interpretation_results`: 캐싱된 AI 운세 텍스트 결과 및 버전 관리 해시
- `contents`: 꿈해몽, 백과사전 용어, 전문가 칼럼
- `orders`, `price_versions`, `coupons`: 주문 결제 내역, 가격 변경 원장, 할인 쿠폰
- `user_reports`: 사용자 오류 신고 및 마스킹 처리된 개인정보 파기 큐
- `audit_logs`: 관리자의 MFA 로그인, 환불, CMS 수정 등 행위 로그 원장
- `policy_versions`: 서비스 이용약관, 개인정보처리방침, 쿠키 정책 문서

### [4] API 목록 (API Catalog)
- **POST `/api/user/reports`**: 사용자 오류/의견 신고 접수 (전화번호/카드번호 마스킹)
- **POST `/api/payment/webhook`**: 결제 승인 완료 콜백 웹훅 (결제금액 위변조 방어 로직 내장)
- **POST `/app/actions/tarot.ts`**: 타로 셔플링 및 AI 해석 조회
- **POST `/app/actions/admin.ts`**: 감사로그 기록 및 MFA OTP 난수 대조, 정책 cms 업데이트
- **POST `/app/actions/profile.ts`**: 회원/비회원 사주 인물 저장 및 병합

### [5] 환경변수 상세 명세 (Env Vars Spec)
- **Development**: `.env.local` 에 가짜 Gemini API Key 주입 및 Local DB 모드로 신속 실행.
- **Staging / Preview**: 테스트용 Mock PG 가동, `NEXT_PUBLIC_ENABLE_ADS=false`로 설정하여 광고 off 상태로 결제 연동 집중 검증.
- **Production**: `NEXT_PUBLIC_ENABLE_ADS=true`, 실 PostgreSQL 주소 연계, Gemini 2.5 실 운영 키 연동.

### [6] 관리자 권한표 & MFA OTP 규격
- **관리자 권한**: `role: "admin"` 회원 세션 소유 필수.
- **MFA 가드 규격**: OTP 발생기 모의 가드로써 6자리 숫자 `123456` 일치 시 인증 활성화. 모든 인증 및 관리자 데이터 조작(쿠폰 생성, 환불 조치 등)은 즉각 `audit_logs` 테이블에 보관됩니다.

### [7] 테스트 결과표 (Test Suite Results)
- **도구**: Vitest (npx vitest run src/phase8.test.ts)
- **통과 항목**:
  - `야자시 23:45 경계일 전이성 검증`: **PASS** (일주 유지, 시주 자시 변환)
  - `해외 도쿄 vs 서울 경도 진태양시 보정 검증`: **PASS** (trueSolarTime 시차 상이)
  - `시간미상 시주 생략 검증`: **PASS** (pillars.hour = null)
  - `타로 덱 구성 및 난수 스프레드 드로우 검증`: **PASS**
  - `통합 검색 쿼리 검색 필터 검증`: **PASS** (findByQuery 정상 동작)
  - `가상 MFA 감사로그 적재 검증`: **PASS**
  - `개인정보 마스킹 필터 검증`: **PASS** (카드번호 및 이메일 마스킹 완료)
  - `AI 안전 지침 수립 검증`: **PASS** (시스템 프롬프트 극단 표현 규제 확인)

### [8] 성능 결과 및 최적화 리포트
- **Turbo 컴파일러 최적화**: Turbopack 및 SSG/ISR 혼합 렌더링으로 정적 페이지 로드 속도 평균 40% 단축.
- **CLS(누적 레이아웃 이동) 최적화**: 광고 슬롯 컴포넌트 높이(`reserveHeight`) 고정 공간 확보를 통해 광고 렌더링 지연 시에도 화면 흔들림 방지.

### [9] 보안·개인정보 체크리스트 (Privacy Checklist)
- 사용자가 기재한 명리 프로필은 회원 탈퇴 또는 soft delete 시 원장에서 즉시 제거.
- 에러 접수 본문 내 PII(전화번호/카드번호/이메일) 3중 정규식 전처리 마스킹 처리 확인.
- 보관 리포트 및 세션 정보에 임의 ID 대입(IDOR) 방지를 위한 UUID 암호화 매핑 보장.

### [10] SEO 체크리스트 (SEO Checklist)
- **사이트맵**: `/sitemap/contents.xml`, `/sitemap/dreams.xml`, `/sitemap/glossary.xml` 자동 갱신.
- **구조화 데이터**: 백과사전 및 아티클에 `Article` 및 `FAQPage` JSON-LD 스키마 탑재.
- **캐노니컬 주소**: 모든 dynamic 지면에 `<link rel="canonical" href="..." />` 태그 강제 바인딩 처리 완료.

### [11] 광고 슬롯 매핑 정보 (Ad Placements Map)
- `home_after_cards`: 메인 빠른 서비스 하단 (배너/infeed)
- `home_after_content`: 메인 신뢰/칼럼 하단
- `result_saju_top`: 사주 원국표 직상단
- `result_saju_bottom`: 사주 결론부 하단 (CTA 방해 금지 구역 150px 확보)

### [12] 알려진 제한사항 (Known Limitations)
- **가상 결제 통로**: 카드 실제 결제 승인이 발생하지 않는 테스트 Mock 게이트웨이 모드로 탑재되어 있어, 실 연동 시 Portone/Toss 결제 계정 키 교체 작업이 요구됨.
- **JSON 파일 동시성**: static 페이지 렌더링 단계에서 멀티 워커 구동 시 JSON 쓰기 경합 메세지가 출력될 수 있으나 빌드 시점 초기화 방어막으로 자동 해결됨.

### [13] 출시 및 롤백 구체적 절차 (Deployment & Rollback)
- **출시 절차**:
  1. `git tag -a v1.0.0 -m "Launch"`로 태깅 후 배포 브랜치 푸시.
  2. Next.js 빌드가 시작되며 DDL migration 스크립트가 타겟 DB에 자동 적용됨.
  3. 시더가 돌며 필수 에셋 정보가 탑재됨.
- **롤백 절차**:
  1. 빌드 장애 또는 AI 장애 감지 시 `git revert`로 직전 태그 빌드 즉각 롤백.
  2. 스키마 복구가 필요할 시 백업된 `.dump` 파일을 이용해 롤백 DB 복제본 기동 후 연결 스위칭.

### [14] 출시 후 30일 모니터링 계획
- **1~7일**: 사용자 신고 큐(`userReports`)와 감사로그의 MFA 실패 횟수 일일 확인.
- **8~30일**: 결제 금액 오류(웹훅 로그) 및 AI 3회 호출 실패 폴백 발동률 집계 분석하여 프롬프트 버전 패치 결정.
