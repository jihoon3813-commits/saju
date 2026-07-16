"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BirthProfile } from "@/schemas/fortune";
import { handleCreateProfile, handleUpdateProfile } from "@/app/actions/profile";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CITIES_DATABASE, TIMEZONES_LIST } from "@/data/cities";
import { Save, ArrowLeft, Info, Calendar, Clock, MapPin } from "lucide-react";

interface ProfileFormProps {
  initialData?: BirthProfile;
  isEdit?: boolean;
}

export default function ProfileForm({ initialData, isEdit = false }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. 초기 매핑 도시 찾기
  let defaultCityIndex = "0";
  if (initialData) {
    const dbMatchIdx = CITIES_DATABASE.findIndex(
      (c) => c.name === initialData.birthCity && c.country === initialData.birthCountry
    );
    if (dbMatchIdx !== -1) {
      defaultCityIndex = dbMatchIdx.toString();
    } else {
      defaultCityIndex = "-1"; // 직접 입력 모드
    }
  }

  // 2. 폼 로컬 상태 수립
  const [formData, setFormData] = useState({
    alias: initialData?.alias || "",
    relationship: initialData?.relationship || "self", // self, family, lover, friend, partner, other
    genderRuleOption: initialData?.genderRuleOption || "unspecified",
    calendarType: initialData?.calendarType || "solar",
    lunarLeapMonth: initialData?.lunarLeapMonth ?? false,
    birthDate: initialData?.birthDate || "1995-10-24",
    birthTime: initialData?.birthTime || "12:30",
    unknownBirthTime: initialData?.unknownBirthTime ?? false,
    birthCountry: initialData?.birthCountry || "대한민국",
    birthCity: initialData?.birthCity || "서울",
    selectedCityIndex: defaultCityIndex,
    timezone: initialData?.timezone || "Asia/Seoul",
    latitude: initialData?.latitude ?? 37.5665,
    longitude: initialData?.longitude ?? 126.9780,
    useTrueSolarTime: initialData?.calculationPreference?.useTrueSolarTime ?? false,
    borderTimeRule: initialData?.calculationPreference?.borderTimeRule || "23"
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // 3. 도시 변경 처리
  const handleCityChange = (idxStr: string) => {
    const idx = parseInt(idxStr, 10);
    setFormData((prev) => {
      if (idx >= 0 && idx < CITIES_DATABASE.length) {
        const city = CITIES_DATABASE[idx];
        return {
          ...prev,
          selectedCityIndex: idxStr,
          birthCountry: city.country,
          birthCity: city.name,
          timezone: city.timezone,
          latitude: city.latitude,
          longitude: city.longitude
        };
      }
      return { ...prev, selectedCityIndex: idxStr };
    });
  };

  // 4. 서브밋 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 날짜 및 연도 검증
    if (!formData.alias.trim()) {
      setError("별칭을 입력해 주세요.");
      setLoading(false);
      return;
    }

    const [year, month, day] = formData.birthDate.split("-").map(Number);
    if (year < 1900 || year > 2050) {
      setError("지원 범위를 벗어난 연도입니다 (1900년 ~ 2050년 지원).");
      setLoading(false);
      return;
    }

    const testDate = new Date(year, month - 1, day);
    if (testDate.getFullYear() !== year || testDate.getMonth() !== month - 1 || testDate.getDate() !== day) {
      setError("실존하지 않는 올바르지 않은 날짜입니다.");
      setLoading(false);
      return;
    }

    if (testDate.getTime() > Date.now()) {
      setError("미래의 날짜는 입력할 수 없습니다.");
      setLoading(false);
      return;
    }

    // 서버 전달 페이로드 구성
    const payload: Omit<BirthProfile, "id" | "createdAt" | "updatedAt" | "deletedAt"> = {
      alias: formData.alias,
      relationship: formData.relationship as "self" | "family" | "lover" | "friend" | "partner" | "other",
      calendarType: formData.calendarType as "solar" | "lunar",
      lunarLeapMonth: formData.calendarType === "lunar" ? formData.lunarLeapMonth : null,
      birthDate: formData.birthDate,
      birthTime: formData.unknownBirthTime ? null : formData.birthTime,
      unknownBirthTime: formData.unknownBirthTime,
      birthCountry: formData.birthCountry,
      birthCity: formData.birthCity,
      timezone: formData.timezone,
      latitude: formData.latitude,
      longitude: formData.longitude,
      genderRuleOption: formData.genderRuleOption as "male" | "female" | "unspecified",
      calculationPreference: {
        useTrueSolarTime: formData.useTrueSolarTime,
        borderTimeRule: formData.borderTimeRule as "23" | "0"
      },
      saveConsent: true // 프로필 보관함에 저장을 시도하므로 동의 처리
    };

    try {
      let result;
      if (isEdit && initialData?.id) {
        result = await handleUpdateProfile(initialData.id, payload);
      } else {
        result = await handleCreateProfile(payload);
      }

      if (result.success) {
        router.push("/my/profiles");
        router.refresh();
      } else {
        setError(result.error || "처리 도중 서버 에러가 발생했습니다.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "서버 통신 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xxs text-center">
          {error}
        </div>
      )}

      {/* 2단 그리드 폼 입력 */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-navy border-b border-brand-border/60 pb-3 flex items-center space-x-1.5">
          <Calendar className="w-5 h-5 text-gold" />
          <span>기본 인적 사항</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input 
            label="프로필 별칭" 
            placeholder="예: 홍길동, 사랑하는 배우자" 
            value={formData.alias}
            onChange={(e) => updateField("alias", e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy/80 block">관계 설정</label>
            <select
              value={formData.relationship}
              onChange={(e) => updateField("relationship", e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-brand-border rounded-lg text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
            >
              <option value="self">본인</option>
              <option value="family">가족</option>
              <option value="lover">연인/배우자</option>
              <option value="friend">친구</option>
              <option value="partner">동업자</option>
              <option value="other">기타</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy/80">성별 옵션</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: "male", label: "남성" },
                { val: "female", label: "여성" },
                { val: "unspecified", label: "지정 안 함" }
              ].map((g) => (
                <label 
                  key={g.val} 
                  className={`py-2 text-center text-xs border rounded-lg cursor-pointer transition-colors flex items-center justify-center min-h-[44px] ${
                    formData.genderRuleOption === g.val
                      ? "border-gold bg-gold/5 text-gold font-semibold"
                      : "border-brand-border text-navy/65 hover:bg-cream/10"
                  }`}
                >
                  <input 
                    type="radio" 
                    name="gender" 
                    checked={formData.genderRuleOption === g.val}
                    onChange={() => updateField("genderRuleOption", g.val)}
                    className="sr-only" 
                  />
                  {g.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy/80 block">양력/음력</label>
              <select
                value={formData.calendarType}
                onChange={(e) => {
                  updateField("calendarType", e.target.value);
                  if (e.target.value === "solar") {
                    updateField("lunarLeapMonth", null);
                  } else {
                    updateField("lunarLeapMonth", false);
                  }
                }}
                className="w-full px-3 py-2 bg-surface border border-brand-border rounded-lg text-navy text-sm focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
              >
                <option value="solar">양력</option>
                <option value="lunar">음력</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy/80 block">생년월일</label>
              <input 
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateField("birthDate", e.target.value)}
                className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm bg-surface text-navy focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
                required
              />
            </div>
          </div>
        </div>

        {formData.calendarType === "lunar" && (
          <div className="space-y-1.5 animate-slideDown">
            <label className="text-xs font-bold text-navy/85 block">음력 윤달 지정</label>
            <div className="flex space-x-2">
              <label className={`flex-1 text-center py-2 border rounded-lg cursor-pointer text-xs font-semibold min-h-[44px] flex items-center justify-center ${
                formData.lunarLeapMonth === false
                  ? "border-gold bg-gold/5 text-gold"
                  : "border-brand-border text-navy/60"
              }`}>
                <input type="radio" checked={formData.lunarLeapMonth === false} onChange={() => updateField("lunarLeapMonth", false)} className="sr-only" />
                평달
              </label>
              <label className={`flex-1 text-center py-2 border rounded-lg cursor-pointer text-xs font-semibold min-h-[44px] flex items-center justify-center ${
                formData.lunarLeapMonth === true
                  ? "border-gold bg-gold/5 text-gold"
                  : "border-brand-border text-navy/60"
              }`}>
                <input type="radio" checked={formData.lunarLeapMonth === true} onChange={() => updateField("lunarLeapMonth", true)} className="sr-only" />
                윤달
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 출생지 및 옵션 섹션 */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-navy border-b border-brand-border/60 pb-3 flex items-center space-x-1.5">
          <Clock className="w-5 h-5 text-gold" />
          <span>출생 시간 및 계산 세부 공식</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy/80 block">출생시각</label>
            <input 
              type="time" 
              value={formData.birthTime || ""} 
              disabled={formData.unknownBirthTime}
              onChange={(e) => updateField("birthTime", e.target.value)}
              className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm bg-surface text-navy focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px] disabled:opacity-40"
            />
          </div>

          <div className="flex items-end pb-2.5">
            <label className="flex items-center space-x-2 text-xs font-semibold text-navy/75 cursor-pointer min-h-[44px]">
              <input 
                type="checkbox" 
                checked={formData.unknownBirthTime} 
                onChange={(e) => updateField("unknownBirthTime", e.target.checked)}
                className="w-4.5 h-4.5 accent-gold border-brand-border rounded"
              />
              <span>태어난 시간 모름 (시주 생략 계산)</span>
            </label>
          </div>
        </div>

        {formData.unknownBirthTime && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg flex items-start space-x-2 text-xxs leading-normal">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>시간 미입력 시, 시(時) 기준 십신 및 오행 배치는 명조에 누락되어 결과 리포트가 제한적으로 작성됩니다.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy/80 block">출생 도시 (자동 제안)</label>
            <select 
              value={formData.selectedCityIndex} 
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-brand-border rounded-lg text-navy text-xs focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
            >
              {CITIES_DATABASE.map((c, i) => (
                <option key={i} value={i}>
                  {c.country} - {c.name} ({c.timezone})
                </option>
              ))}
              <option value="-1">-- 직접 입력 / 기타 도시 --</option>
            </select>
          </div>

          {formData.selectedCityIndex === "-1" ? (
            <div className="grid grid-cols-2 gap-2">
              <Input 
                label="국가명" 
                value={formData.birthCountry} 
                onChange={(e) => updateField("birthCountry", e.target.value)} 
              />
              <Input 
                label="도시명" 
                value={formData.birthCity} 
                onChange={(e) => updateField("birthCity", e.target.value)} 
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy/85 block">자동 매핑 좌표 정보</label>
              <div className="text-xxs text-navy/60 bg-[#EAE4D6]/20 border border-brand-border/60 p-2.5 rounded-lg">
                위경도: <strong className="text-navy">{formData.latitude}°N, {formData.longitude}°E</strong> • 시간대: <strong className="text-navy">{formData.timezone}</strong>
              </div>
            </div>
          )}
        </div>

        {formData.selectedCityIndex === "-1" && (
          <div className="grid grid-cols-3 gap-2 animate-slideDown">
            <div className="space-y-1.5 col-span-2">
              <label className="text-xxs font-bold text-navy/70 block">표준 시간대 지정</label>
              <select 
                value={formData.timezone} 
                onChange={(e) => updateField("timezone", e.target.value)}
                className="w-full px-2.5 py-2.5 bg-surface border border-brand-border rounded-lg text-navy text-xxs focus:outline-none"
              >
                {TIMEZONES_LIST.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-1 col-span-1">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-navy/60 block">위도</label>
                <input type="number" step="0.0001" value={formData.latitude || ""} onChange={(e) => updateField("latitude", parseFloat(e.target.value) || null)} className="w-full p-1.5 text-xxs border border-brand-border rounded-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-navy/60 block">경도</label>
                <input type="number" step="0.0001" value={formData.longitude || ""} onChange={(e) => updateField("longitude", parseFloat(e.target.value) || null)} className="w-full p-1.5 text-xxs border border-brand-border rounded-lg" />
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-brand-border/50 pt-5 space-y-4">
          <div className="flex items-start space-x-3">
            <input 
              type="checkbox" 
              checked={formData.useTrueSolarTime}
              onChange={(e) => updateField("useTrueSolarTime", e.target.checked)}
              className="w-5 h-5 accent-gold border-brand-border rounded mt-0.5 cursor-pointer"
            />
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-navy cursor-pointer">진태양시 정밀 계산 공식 적용</label>
              <p className="text-[10px] text-navy/60 leading-normal">출생 위경도 고유의 균시차를 분 단위로 보정합니다. (미지정 시 표준시 기준 적용)</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-navy block">자시(子時) 경계 일자 변경 룰</label>
            <div className="flex space-x-4 pl-1">
              <label className="flex items-center space-x-2 text-xs text-navy cursor-pointer">
                <input type="radio" name="borderTime" checked={formData.borderTimeRule === "23"} onChange={() => updateField("borderTimeRule", "23")} className="w-4.5 h-4.5 accent-gold" />
                <span>밤 23시 경계 (야자시/조자시 구분)</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-navy cursor-pointer">
                <input type="radio" name="borderTime" checked={formData.borderTimeRule === "0"} onChange={() => updateField("borderTimeRule", "0")} className="w-4.5 h-4.5 accent-gold" />
                <span>밤 0시 정각 경계 (단일 자시 적용)</span>
              </label>
            </div>
          </div>
        </div>

      </div>

      {/* 제출 및 돌아가기 */}
      <div className="flex justify-between items-center">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => router.push("/my/profiles")}
          disabled={loading}
          className="min-h-[44px] px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>보관함 목록으로</span>
        </Button>

        <Button 
          type="submit" 
          variant="primary" 
          disabled={loading}
          className="font-bold min-h-[44px] px-8 flex items-center space-x-1.5"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "저장 중..." : isEdit ? "수정 완료" : "프로필 저장"}</span>
        </Button>
      </div>

    </form>
  );
}
