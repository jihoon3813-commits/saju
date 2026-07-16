/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight,
  Database, 
  FileText, 
  Lock, 
  MapPin, 
  Calendar, 
  Clock, 
  Sliders, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { handleCreateProfile } from "@/app/actions/profile";
import { FortuneInputSchema, FortuneInput } from "@/schemas/fortune";

export default function FortuneInputReview() {
  const router = useRouter();

  // 1. 드래프트 로딩 상태 및 데이터
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. 동의 상태 제어
  const [consentResult, setConsentResult] = useState<boolean>(false); // 결과 생성 동의 (필수)
  const [consentSave, setConsentSave] = useState<boolean>(false);     // 프로필 보관함 영구 저장 동의 (선택)

  // 3. 연산 완료 및 최종 생성된 DTO 상태
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [finalDto, setFinalDto] = useState<FortuneInput | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 4. 로컬 스토리지에서 입력 데이터 복구
  useEffect(() => {
    const raw = localStorage.getItem("fortune_input_draft");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setTimeout(() => {
          setDraft(parsed);
          setLoading(false);
        }, 0);
        return;
      } catch {
        console.error("Failed to restore review draft");
      }
    }
    // 데이터가 없거나 실패한 경우에도 비동기로 로딩을 종료합니다.
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-navy/60">입력 정보를 불러오는 중입니다...</div>;
  }

  if (!draft) {
    return (
      <div className="bg-surface border border-brand-border rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-navy">작성 중인 정보가 없습니다</h3>
        <p className="text-xs text-navy/60 leading-relaxed">
          운세 분석을 시작하려면 생년월일시 정보를 먼저 기입해 주셔야 합니다.
        </p>
        <Button variant="primary" onClick={() => router.push("/fortune/input")} className="w-full">
          입력 페이지로 이동
        </Button>
      </div>
    );
  }

  // 5. 제출 핸들러 (서버 액션 가동 및 DTO 빌드)
  const handleSubmit = async () => {
    if (!consentResult) {
      alert("운세 결과 분석을 위해 '결과 분석 제공 동의'에 체크해 주세요.");
      return;
    }

    setSubmitting(true);
    setValidationErrors([]);

    // DTO에 바인딩할 데이터 패키징
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawDto: any = {
      alias: draft.alias,
      calendarType: draft.calendarType,
      lunarLeapMonth: draft.lunarLeapMonth,
      birthDate: draft.birthDate,
      birthTime: draft.unknownBirthTime ? null : draft.birthTime,
      unknownBirthTime: draft.unknownBirthTime,
      birthCountry: draft.birthCountry,
      birthCity: draft.birthCity,
      timezone: draft.timezone,
      latitude: draft.latitude,
      longitude: draft.longitude,
      genderRuleOption: draft.genderRuleOption,
      calculationPreference: {
        useTrueSolarTime: draft.useTrueSolarTime,
        borderTimeRule: draft.borderTimeRule
      },
      topicPriority: draft.topicPriority
    };

    // Zod 런타임 스키마 검증 실행 (클라이언트 단 1차 수문장)
    const validation = FortuneInputSchema.safeParse(rawDto);
    if (!validation.success) {
      const errors = validation.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
      setValidationErrors(errors);
      setSubmitting(false);
      return;
    }

    const validatedDto = validation.data;

    // DB 저장을 위한 정보 취합 (영구 저장 동의가 true인 경우에만 saveConsent 주입)
    const profilePayload = {
      alias: draft.alias,
      relationship: "self" as any, // 기본적으로 본인으로 기록 (프로필 관리 탭에서 변경 가능)
      calendarType: draft.calendarType,
      lunarLeapMonth: draft.lunarLeapMonth,
      birthDate: draft.birthDate,
      birthTime: draft.unknownBirthTime ? null : draft.birthTime,
      unknownBirthTime: draft.unknownBirthTime,
      birthCountry: draft.birthCountry,
      birthCity: draft.birthCity,
      timezone: draft.timezone,
      latitude: draft.latitude,
      longitude: draft.longitude,
      genderRuleOption: draft.genderRuleOption,
      calculationPreference: {
        useTrueSolarTime: draft.useTrueSolarTime,
        borderTimeRule: draft.borderTimeRule
      },
      saveConsent: consentSave // 사용자가 영구 저장을 동의한 여부 맵핑
    };

    try {
      // 서버 저장 액션 트리거
      const dbResult = await handleCreateProfile(profilePayload);
      
      if (!dbResult.success) {
        alert(dbResult.error || "DB 저장 도중 오류가 발생했습니다.");
        setSubmitting(false);
        return;
      }

      // 최종 계약 DTO 완성 (생성된 DB profileId 연결)
      const finalContractDto: FortuneInput = {
        ...validatedDto,
        profileId: dbResult.profile?.id
      };

      setFinalDto(finalContractDto);
      setIsSubmitted(true);

      // 성공 시 임시 스토리지 드래프트 파기 (DB에 저장했으면 즉시 삭제, 게스트면 만세력 노출용으로 보존)
      if (consentSave) {
        localStorage.removeItem("fortune_input_draft");
      }
    } catch (e: any) {
      alert(e.message || "오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      
      {!isSubmitted ? (
        <div className="space-y-6">
          {/* 입력값 요약 리스트 */}
          <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-brand-border/60 pb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy font-serif">Step 5. 입력 세부사항 최종 검토</h2>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => router.push("/fortune/input")}
                className="flex items-center space-x-1 text-xxs font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>수정하러 가기</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 기본 정보 */}
              <div className="bg-[#EAE4D6]/20 border border-brand-border/40 p-4.5 rounded-xl space-y-2.5">
                <div className="font-bold text-navy border-b border-brand-border/50 pb-1.5 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-gold" />
                  <span>1. 기본 인적 정보</span>
                </div>
                <div className="space-y-1.5 text-navy/80">
                  <div>별칭: <strong className="text-navy">{draft.alias}</strong></div>
                  <div>성별 룰: <strong className="text-navy">
                    {draft.genderRuleOption === "male" ? "남성 (乾命)" : draft.genderRuleOption === "female" ? "여성 (坤命)" : "지정 안 함"}
                  </strong></div>
                  <div>달력 유형: <strong className="text-navy">{draft.calendarType === "solar" ? "양력" : "음력"}</strong></div>
                  {draft.calendarType === "lunar" && (
                    <div>윤달 여부: <strong className="text-navy">{draft.lunarLeapMonth ? "윤달" : "평달"}</strong></div>
                  )}
                  <div>생년월일: <strong className="text-navy">{draft.birthDate}</strong></div>
                </div>
              </div>

              {/* 시간 및 장소 */}
              <div className="bg-[#EAE4D6]/20 border border-brand-border/40 p-4.5 rounded-xl space-y-2.5">
                <div className="font-bold text-navy border-b border-brand-border/50 pb-1.5 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-gold" />
                  <span>2. 출생 시각 및 위치</span>
                </div>
                <div className="space-y-1.5 text-navy/80">
                  <div>출생 시각: <strong className="text-navy">{draft.unknownBirthTime ? "시각 모름" : draft.birthTime}</strong></div>
                  <div>출생지: <strong className="text-navy">{draft.birthCountry} {draft.birthCity}</strong></div>
                  <div className="truncate">시간대: <strong className="text-navy">{draft.timezone}</strong></div>
                  <div>경위도: <span className="text-navy/70">{draft.latitude}°N, {draft.longitude}°E</span></div>
                </div>
              </div>

              {/* 연산 옵션 */}
              <div className="bg-[#EAE4D6]/20 border border-brand-border/40 p-4.5 rounded-xl space-y-2.5">
                <div className="font-bold text-navy border-b border-brand-border/50 pb-1.5 flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-gold" />
                  <span>3. 계산 설정 및 보정</span>
                </div>
                <div className="space-y-1.5 text-navy/80">
                  <div>진태양시 보정: <strong className="text-navy">{draft.useTrueSolarTime ? "사용" : "미사용 (동경시 기준)"}</strong></div>
                  <div>자시 날짜 변경: <strong className="text-navy">{draft.borderTimeRule === "23" ? "23시 경계 (야/조자시)" : "0시 정각 경계"}</strong></div>
                </div>
              </div>

              {/* 관심 분야 */}
              <div className="bg-[#EAE4D6]/20 border border-brand-border/40 p-4.5 rounded-xl space-y-2.5">
                <div className="font-bold text-navy border-b border-brand-border/50 pb-1.5 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span>4. 관심사 우선순위</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {draft.topicPriority.map((topic: string, i: number) => (
                    <span key={topic} className="px-2.5 py-1 bg-navy text-cream text-[10px] rounded-lg font-bold">
                      {i + 1}. {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 개인정보 제공 및 저장 이원화 동의 박스 */}
          <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-navy flex items-center space-x-1.5">
              <Lock className="w-4.5 h-4.5 text-gold" />
              <span>개인정보 제공 동의 및 보관함 설정</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              {/* 동의 1. 결과 연산 제공 동의 */}
              <label className="flex items-start space-x-3 cursor-pointer p-2.5 hover:bg-cream/10 rounded-lg transition-colors min-h-[44px]">
                <input 
                  type="checkbox"
                  checked={consentResult}
                  onChange={(e) => setConsentResult(e.target.checked)}
                  className="w-5 h-5 accent-gold border-brand-border rounded mt-0.5 shrink-0" 
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-navy">[필수] 운세 연산 및 결과지 생성 제공 동의</span>
                  <p className="text-xxs text-navy/60 leading-normal">
                    기입된 사주 생년월일시 및 성별 정보는 동양 전통 만세력 도출 및 해석 보고서 작성을 위해서만 일시 활용됩니다.
                  </p>
                </div>
              </label>

              {/* 동의 2. 영구 보관 저장 동의 */}
              <label className="flex items-start space-x-3 cursor-pointer p-2.5 hover:bg-cream/10 rounded-lg transition-colors min-h-[44px]">
                <input 
                  type="checkbox"
                  checked={consentSave}
                  onChange={(e) => setConsentSave(e.target.checked)}
                  className="w-5 h-5 accent-gold border-brand-border rounded mt-0.5 shrink-0" 
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-navy">[선택] 마이페이지 프로필 보관함 영구 소장 동의</span>
                  <p className="text-xxs text-navy/60 leading-normal">
                    동의 시 이 사주 프로필을 회원 보관함(비회원은 현재 세션 보관함)에 영구 보존하여 추후 재입력 없이 궁합 분석 및 일일 운세에 즉시 불러올 수 있습니다. 비동의 시 결과 확인 종료 후 즉시 파기됩니다.
                  </p>
                </div>
              </label>
            </div>

            {/* 약관 안내 링크 */}
            <div className="border-t border-brand-border/60 pt-4 flex justify-between items-center text-xxs text-navy/60">
              <span className="flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5" />
                <span>개인정보 보유 정책 및 이용 내역 안내</span>
              </span>
              <a 
                href="/settings/privacy" 
                target="_blank"
                className="text-gold font-bold flex items-center hover:underline space-x-0.5"
              >
                <span>내용 자세히 보기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 에러 노출창 */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl space-y-1.5 text-xxs">
              <strong className="text-xs font-bold block">🚨 스키마 검증(DTO Validation) 실패:</strong>
              <ul className="list-disc list-inside space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 제어 제어 */}
          <div className="flex justify-between items-center">
            <Button 
              variant="secondary" 
              onClick={() => router.push("/fortune/input")}
              disabled={submitting}
              className="min-h-[44px] px-6"
            >
              이전 단계
            </Button>

            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={!consentResult || submitting}
              className="font-bold min-h-[44px] px-8"
            >
              {submitting ? "명조 분석 요청 중..." : "사주명조 및 운세 DTO 생성하기"}
            </Button>
          </div>
        </div>
      ) : (
        /* 성공 화면 및 DTO 증명서 출력 */
        <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-md space-y-6 animate-fadeIn">
          
          <div className="text-center space-y-2 py-4">
            <span className="p-3 bg-sage/10 text-sage rounded-full inline-block mb-1">
              <Check className="w-8 h-8" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-navy font-serif">FortuneInput DTO 규격 검증 완료</h2>
            <p className="text-xs text-navy/70 max-w-md mx-auto leading-relaxed">
              Phase 3 만세력 연산 엔진으로 전달되는 정규화된 DTO 객체가 생성되고 런타임 스키마 통과를 증명했습니다.
            </p>
          </div>

          {/* DTO JSON 표기 */}
          <div className="space-y-2.5">
            <label className="text-xxs font-bold text-navy/55 flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-gold" />
              <span>PHASE 3 연결 계약 DTO 명세 (Validated JSON)</span>
            </label>
            <pre className="bg-navy text-cream text-[10px] sm:text-xs p-4.5 rounded-xl overflow-x-auto font-mono leading-relaxed max-h-[300px] border border-brand-border/25">
              {JSON.stringify(finalDto, null, 2)}
            </pre>
          </div>

          {/* 보관함 안내 공지 */}
          <div className="bg-sage/5 border border-brand-border p-4.5 rounded-xl space-y-2 text-xxs leading-relaxed">
            <div className="font-bold text-navy flex items-center space-x-1">
              <Lock className="w-4 h-4 text-sage" />
              <span>서버 개인정보 보안 상태 정책</span>
            </div>
            <p className="text-navy/75">
              {consentSave 
                ? "프로필 영구 보존 동의에 기초하여 프로필 식별자가 데이터베이스 저장소(birth_profiles)에 무결하게 적재되었습니다. 마이페이지 또는 프로필 관리 탭에서 영구 파기 및 갱신이 지원됩니다."
                : "영구 보존에 동의하지 않으셨으므로, 해당 생년월일시는 데이터베이스에 일시적으로 저장되며 향후 마이페이지 영구 보관함에는 등재되지 않고 세션이 종료되는 대로 파기됩니다."
              }
            </p>
          </div>

          <div className="flex justify-center flex-wrap gap-3.5 pt-2">
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsSubmitted(false);
                setFinalDto(null);
              }}
              className="min-h-[44px] px-4 text-xs font-bold"
            >
              새로 정보 입력
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/my/profiles")}
              className="min-h-[44px] px-4 text-xs font-bold"
            >
              프로필 보관함 가기
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                if (finalDto?.profileId) {
                  router.push(`/manse?profileId=${finalDto.profileId}`);
                } else {
                  router.push("/manse");
                }
              }}
              className="min-h-[44px] px-4 text-xs font-bold"
            >
              만세력 명식만 보기
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                if (finalDto?.profileId) {
                  router.push(`/result/basic-saju/${finalDto.profileId}`);
                } else {
                  router.push("/fortune/input");
                }
              }}
              className="min-h-[44px] px-6 text-xs font-bold flex items-center space-x-1.5 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-gold" />
              <span>AI 정밀 해설 보고서 읽기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
