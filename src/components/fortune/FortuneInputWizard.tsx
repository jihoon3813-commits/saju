"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Calendar, 
  Clock, 
  MapPin, 
  Sliders, 
  Sparkles, 
  Check, 
  RotateCcw, 
  User,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CITIES_DATABASE, TIMEZONES_LIST, CityData } from "@/data/cities";
import { BirthProfile } from "@/schemas/fortune";

interface FortuneInputWizardProps {
  existingProfiles: BirthProfile[];
}

const LOCAL_STORAGE_KEY = "fortune_input_draft";

export default function FortuneInputWizard({ existingProfiles = [] }: FortuneInputWizardProps) {
  const router = useRouter();

  // 1. 위저드 단계 상태 (Step 1 ~ 4)
  const [step, setStep] = useState<number>(1);

  // 2. 입력 폼 상태 정의
  const [formData, setFormData] = useState({
    profileId: "",
    alias: "",
    genderRuleOption: "unspecified", // male, female, unspecified
    calendarType: "solar",           // solar, lunar
    lunarLeapMonth: false,           // false (평달), true (윤달)
    birthDate: "1995-10-24",
    birthTime: "12:30",
    unknownBirthTime: false,
    birthCountry: "대한민국",
    birthCity: "서울",
    selectedCityIndex: "0",          // CITIES_DATABASE 인덱스 (기타 직접 입력은 "-1")
    timezone: "Asia/Seoul",
    latitude: 37.5665,
    longitude: 126.9780,
    useTrueSolarTime: false,         // 진태양시
    borderTimeRule: "23",            // 자시 경계 (23시/0시)
    topicPriority: ["종합"]          // 관심 우선순위 배열
  });

  // 3. 복구 안내 모달 노출 상태
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tempRestoreData, setTempRestoreData] = useState<any>(null);

  // 4. 컴포넌트 로드 시 임시 저장(Draft) 확인
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const autoRestore = searchParams.get("autoRestore") === "true";
    const draft = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.alias || parsed.birthDate) {
          if (autoRestore) {
            setFormData(parsed);
          } else {
            // react-hooks/set-state-in-effect 경고를 피하기 위해 setTimeout 사용
            setTimeout(() => {
              setTempRestoreData(parsed);
              setShowRestoreModal(true);
            }, 0);
          }
        }
      } catch (e) {
        console.error("Draft parsing failed:", e);
      }
    }
  }, []);

  // 5. 로컬스토리지에 지속적 상태 백업
  const saveDraft = (data: typeof formData) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (key: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      saveDraft(next);
      return next;
    });
  };

  // 6. 저장된 프로필 선택 시 자동 채우기
  const handleLoadProfile = (profileId: string) => {
    if (!profileId) {
      // 직접 입력 모드로 환원
      updateField("profileId", "");
      return;
    }

    const selected = existingProfiles.find((p) => p.id === profileId);
    if (selected) {
      // 도시 매핑 확인
      let cityIdx = "-1";
      const dbMatchIdx = CITIES_DATABASE.findIndex(
        (c) => c.name === selected.birthCity && c.country === selected.birthCountry
      );
      if (dbMatchIdx !== -1) {
        cityIdx = dbMatchIdx.toString();
      }

      setFormData((prev) => {
        const next = {
          ...prev,
          profileId: selected.id || "",
          alias: selected.alias,
          genderRuleOption: selected.genderRuleOption,
          calendarType: selected.calendarType,
          lunarLeapMonth: selected.lunarLeapMonth ?? false,
          birthDate: selected.birthDate,
          birthTime: selected.birthTime || "12:00",
          unknownBirthTime: selected.unknownBirthTime,
          birthCountry: selected.birthCountry,
          birthCity: selected.birthCity,
          selectedCityIndex: cityIdx,
          timezone: selected.timezone,
          latitude: selected.latitude ?? 37.5665,
          longitude: selected.longitude ?? 126.9780,
          useTrueSolarTime: selected.calculationPreference.useTrueSolarTime,
          borderTimeRule: selected.calculationPreference.borderTimeRule
        };
        saveDraft(next);
        return next;
      });
    }
  };

  // 7. 도시 선택 변경 시 데이터 연동
  const handleCityChange = (idxStr: string) => {
    const idx = parseInt(idxStr, 10);
    updateField("selectedCityIndex", idxStr);

    if (idx >= 0 && idx < CITIES_DATABASE.length) {
      const city = CITIES_DATABASE[idx];
      setFormData((prev) => {
        const next = {
          ...prev,
          selectedCityIndex: idxStr,
          birthCountry: city.country,
          birthCity: city.name,
          timezone: city.timezone,
          latitude: city.latitude,
          longitude: city.longitude
        };
        saveDraft(next);
        return next;
      });
    }
  };

  // 8. 관심 주제 클릭 정렬 제어
  const toggleTopic = (topic: string) => {
    let current = [...formData.topicPriority];
    if (current.includes(topic)) {
      // 이미 있으면 해제 (단, 최소 1개는 유지)
      if (current.length > 1) {
        current = current.filter((t) => t !== topic);
      }
    } else {
      // 없으면 추가
      current.push(topic);
    }
    updateField("topicPriority", current);
  };

  // 9. 임시 백업 복구 적용 / 파기
  const handleRestore = () => {
    if (tempRestoreData) {
      setFormData(tempRestoreData);
    }
    setShowRestoreModal(false);
  };

  const handleDiscardRestore = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setShowRestoreModal(false);
  };

  // 10. 단계별 유효성 검증 규칙 (Step 1, 2)
  const validateStep = (): string | null => {
    if (step === 1) {
      if (!formData.alias.trim()) return "별칭을 입력해 주세요.";
      if (!formData.birthDate) return "생년월일을 지정해 주세요.";
      
      const [year, month, day] = formData.birthDate.split("-").map(Number);
      if (year < 1900 || year > 2050) {
        return "만세력 연산 지원 범위를 벗어났습니다 (1900년 ~ 2050년).";
      }
      
      // 실제 존재하는 날짜인지 검증
      const testDate = new Date(year, month - 1, day);
      if (testDate.getFullYear() !== year || testDate.getMonth() !== month - 1 || testDate.getDate() !== day) {
        return "실존하지 않는 날짜 규격입니다.";
      }
      
      // 미래 날짜 차단
      if (testDate.getTime() > Date.now()) {
        return "미래의 날짜는 입력할 수 없습니다.";
      }
    }
    if (step === 2) {
      if (!formData.unknownBirthTime && !formData.birthTime) {
        return "출생 시간을 입력하시거나 '시간 모름'을 활성화해 주세요.";
      }
      if (!formData.birthCountry.trim() || !formData.birthCity.trim()) {
        return "출생지 정보가 누락되었습니다.";
      }
      if (!formData.timezone) {
        return "시간대 설정을 완료해 주세요.";
      }
    }
    return null;
  };

  // 11. 다음 / 이전 단계 처리
  const handleNext = () => {
    const error = validateStep();
    if (error) {
      alert(error);
      return;
    }
    
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      // 4단계 완료 시, 로컬 스토리지에 최종 드래프트를 보관하고 최종 검토 페이지(/fortune/input/review)로 포워딩
      const searchParams = new URLSearchParams(window.location.search);
      const type = searchParams.get("type") || "pyungsaeng";
      saveDraft(formData);
      router.push(`/fortune/input/review?type=${type}`);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  // 12. 국가명과 시간대의 불일치 점검 고지
  const isTimezoneMismatch = () => {
    const country = formData.birthCountry;
    const tz = formData.timezone;
    if (country === "대한민국" && tz !== "Asia/Seoul") return true;
    if (country === "일본" && tz !== "Asia/Tokyo") return true;
    return false;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* 1. 상단 프로필 간편 불러오기 */}
      {step === 1 && existingProfiles.length > 0 && (
        <div className="bg-cream/20 border border-brand-border rounded-xl p-4.5 space-y-2.5">
          <label className="text-xs font-bold text-navy/70 flex items-center space-x-1">
            <User className="w-4 h-4 text-gold" />
            <span>저장된 운세 프로필 불러오기</span>
          </label>
          <select 
            value={formData.profileId} 
            onChange={(e) => handleLoadProfile(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-brand-border rounded-lg text-navy text-xs focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="">-- 직접 새로 입력하기 --</option>
            {existingProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.relationship === "self" ? "본인" : p.relationship}] {p.alias} - {p.birthDate} ({p.calendarType === "solar" ? "양력" : "음력"})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 2. 단계 스텝 바 (Step Indicators) */}
      <div className="flex items-center justify-between px-2 py-1">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-initial">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all ${
              step === s 
                ? "bg-navy text-cream border-navy shadow-sm ring-2 ring-gold/45Scale" 
                : step > s 
                  ? "bg-gold text-navy border-gold" 
                  : "bg-surface text-navy/40 border-brand-border"
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 4 && (
              <div className={`h-0.5 flex-grow mx-2 transition-colors ${
                step > s ? "bg-gold" : "bg-brand-border"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* 3. 단계별 본체 (Wizard Form Container) */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs min-h-[380px] flex flex-col justify-between">
        
        {/* STEP 1: 기본정보 */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold text-navy font-serif">Step 1. 기본정보 입력</h3>
              <p className="text-xxs text-navy/60 mt-0.5">운세 주인공의 인적사항을 입력해 주세요. 실명은 수집하지 않습니다.</p>
            </div>

            <div className="space-y-4">
              <Input 
                label="별칭 (실명 금지)" 
                placeholder="예: 홍길동, 대운대박" 
                value={formData.alias}
                onChange={(e) => updateField("alias", e.target.value)}
                required 
              />

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy/80">성별 규칙 옵션</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "male", label: "남성 (乾命)" },
                    { val: "female", label: "여성 (坤命)" },
                    { val: "unspecified", label: "선택 안 함" }
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy/80">달력 유형</label>
                  <div className="flex space-x-2">
                    <label className={`flex-1 text-center py-2 border rounded-lg cursor-pointer text-xs font-semibold min-h-[44px] flex items-center justify-center ${
                      formData.calendarType === "solar"
                        ? "border-gold bg-gold/5 text-gold"
                        : "border-brand-border text-navy/60"
                    }`}>
                      <input type="radio" checked={formData.calendarType === "solar"} onChange={() => {
                        updateField("calendarType", "solar");
                        updateField("lunarLeapMonth", null);
                      }} className="sr-only" />
                      양력
                    </label>
                    <label className={`flex-1 text-center py-2 border rounded-lg cursor-pointer text-xs font-semibold min-h-[44px] flex items-center justify-center ${
                      formData.calendarType === "lunar"
                        ? "border-gold bg-gold/5 text-gold"
                        : "border-brand-border text-navy/60"
                    }`}>
                      <input type="radio" checked={formData.calendarType === "lunar"} onChange={() => {
                        updateField("calendarType", "lunar");
                        updateField("lunarLeapMonth", false);
                      }} className="sr-only" />
                      음력
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy/80">생년월일</label>
                  <input 
                    type="date" 
                    value={formData.birthDate}
                    onChange={(e) => updateField("birthDate", e.target.value)}
                    className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm bg-surface text-navy focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
                  />
                </div>
              </div>

              {formData.calendarType === "lunar" && (
                <div className="space-y-1.5 animate-slideDown">
                  <label className="text-xs font-bold text-navy/80 block">음력 윤달 여부 <span className="text-red-500">*</span></label>
                  <div className="flex space-x-2">
                    <label className={`flex-1 text-center py-2 border rounded-lg cursor-pointer text-xs font-semibold min-h-[44px] flex items-center justify-center ${
                      formData.lunarLeapMonth === false
                        ? "border-gold bg-gold/5 text-gold"
                        : "border-brand-border text-navy/60"
                    }`}>
                      <input type="radio" checked={formData.lunarLeapMonth === false} onChange={() => updateField("lunarLeapMonth", false)} className="sr-only" />
                      평달 (일반 음력)
                    </label>
                    <label className={`flex-1 text-center py-2 border rounded-lg cursor-pointer text-xs font-semibold min-h-[44px] flex items-center justify-center ${
                      formData.lunarLeapMonth === true
                        ? "border-gold bg-gold/5 text-gold"
                        : "border-brand-border text-navy/60"
                    }`}>
                      <input type="radio" checked={formData.lunarLeapMonth === true} onChange={() => updateField("lunarLeapMonth", true)} className="sr-only" />
                      윤달 (중복 윤달)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: 출생시간 및 장소 */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold text-navy font-serif">Step 2. 출생 시각 및 장소 입력</h3>
              <p className="text-xxs text-navy/60 mt-0.5">정확한 시(時) 기준 연산과 서머타임 보정을 위해 장소를 지정해 주세요.</p>
            </div>

            <div className="space-y-4">
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
                    <span>태어난 시간 모름 (시주 제외)</span>
                  </label>
                </div>
              </div>

              {formData.unknownBirthTime && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg flex items-start space-x-2 text-xxs leading-normal animate-slideDown">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    출생시간을 입력하지 않으시면, 사주팔자(四柱八字) 중 시주(時柱) 연산이 누락되어 정밀 일일 운세와 시간대별 세부 길흉 분석 기능이 일부 제한됩니다.
                  </span>
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
                    <option value="-1">-- 해외 직접 입력 / 기타 --</option>
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
                    <label className="text-xs font-bold text-navy/85 block">좌표 및 시간대 자동 매핑</label>
                    <div className="text-xxs text-navy/60 bg-[#EAE4D6]/20 border border-brand-border/60 p-2.5 rounded-lg space-y-1">
                      <div>위도/경도: <strong className="text-navy">{formData.latitude}°N, {formData.longitude}°E</strong></div>
                      <div>표준 시간대: <strong className="text-navy">{formData.timezone}</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {formData.selectedCityIndex === "-1" && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xxs font-bold text-navy/70 block">수동 시간대(Timezone) 설정</label>
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

              {isTimezoneMismatch() && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg flex items-start space-x-2 text-xxs leading-normal">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                  <span>
                    출생 국가({formData.birthCountry})와 시간대({formData.timezone}) 정보가 다소 상이하게 선택되었습니다. 서머타임 보정 등은 최종 매핑된 표준 시간대 규격에 맞춰 서버에서 정밀 자동 처리됩니다.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: 계산 기준 */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy font-serif">Step 3. 사주 계산 정밀 옵션</h3>
                <p className="text-xxs text-navy/60 mt-0.5">명조 도출 시 적용할 세부 보정 공식을 지정합니다.</p>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                className="text-xxs font-bold text-gold hover:text-gold/80" 
                onClick={() => {
                  updateField("useTrueSolarTime", false);
                  updateField("borderTimeRule", "23");
                }}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                기본값 복원
              </Button>
            </div>

            <div className="space-y-5 py-2">
              <div className="flex items-start space-x-3.5">
                <input 
                  type="checkbox" 
                  checked={formData.useTrueSolarTime}
                  onChange={(e) => updateField("useTrueSolarTime", e.target.checked)}
                  className="w-5 h-5 accent-gold border-brand-border rounded mt-1 cursor-pointer"
                />
                <div className="space-y-1">
                  <label className="text-sm font-bold text-navy cursor-pointer">
                    진태양시(眞太陽時) 분 단위 정밀 보정
                  </label>
                  <p className="text-xxs text-navy/65 leading-relaxed">
                    지구 공전 궤도의 미세한 이심률에 따른 시간차(균시차)를 좌표 기준 분 단위로 재산출하여 보정합니다. 비활성화 시 한국 표준시(동경 135도) 평태양시가 보정 없이 기본 적용됩니다.
                  </p>
                </div>
              </div>

              <div className="border-t border-brand-border/60 pt-4 space-y-3">
                <label className="text-sm font-bold text-navy block">자시(子時) 일자 경계 기준 설정</label>
                
                <div className="space-y-3 pl-1">
                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="borderTime" 
                      checked={formData.borderTimeRule === "23"}
                      onChange={() => updateField("borderTimeRule", "23")}
                      className="w-4.5 h-4.5 accent-gold mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-semibold text-navy">밤 23시 경계 (야자시/조자시 구분) - <strong className="text-gold">추천</strong></span>
                      <p className="text-xxs text-navy/60 leading-normal mt-0.5">
                        밤 23:00~23:59시(야자시) 출생은 오늘 일간을 쓰고 다음 날짜의 시를 배정하며, 00:00~01:29시(조자시) 출생은 다음날 일간을 쓰는 동양 전통 절기 기준입니다.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="borderTime" 
                      checked={formData.borderTimeRule === "0"}
                      onChange={() => updateField("borderTimeRule", "0")}
                      className="w-4.5 h-4.5 accent-gold mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-semibold text-navy">밤 0시 정각 경계 (단일 자시 적용)</span>
                      <p className="text-xxs text-navy/60 leading-normal mt-0.5">
                        전통 야자시 구분을 거부하고 현대적 24시간제 날짜 경계와 동일하게 00시 정각을 기준으로 사주팔자의 일간 날짜를 변경하는 간소 계산식입니다.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: 관심 주제 */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold text-navy font-serif">Step 4. 관심 분야 태그 지정</h3>
              <p className="text-xxs text-navy/60 mt-0.5">
                AI 해석 도출 시 정해진 오행 십신 계산 결과를 바탕으로 어떤 주제를 핵심으로 서술할지 정합니다.
              </p>
            </div>

            <div className="space-y-5 py-4">
              <span className="text-xxs font-bold text-navy/55 block uppercase tracking-wider">주제 우선순위 지정 (복수 선택 가능, 상단에 위치한 태그가 1순위)</span>
              
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: "종합", label: "🪐 종합대운" },
                  { id: "재물", label: "💰 재물운" },
                  { id: "직업", label: "💼 직업·사업" },
                  { id: "연애", label: "💞 연애·인연" },
                  { id: "가족", label: "🏡 가족관계" },
                  { id: "건강", label: "🌿 건강·일상" }
                ].map((topic) => {
                  const isSelected = formData.topicPriority.includes(topic.id);
                  const rank = formData.topicPriority.indexOf(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className={`px-4 py-2.5 text-xs rounded-xl font-bold border transition-all cursor-pointer flex items-center space-x-1.5 min-h-[44px] ${
                        isSelected 
                          ? "bg-navy text-cream border-navy shadow-sm ring-1 ring-gold/30" 
                          : "bg-surface border-brand-border text-navy/65 hover:bg-cream/15"
                      }`}
                    >
                      <span>{topic.label}</span>
                      {isSelected && (
                        <span className="w-4.5 h-4.5 bg-gold text-navy rounded-full text-[10px] flex items-center justify-center font-bold">
                          {rank + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="bg-[#EAE4D6]/20 border border-brand-border/60 p-4 rounded-xl flex items-start space-x-2">
                <Sparkles className="w-4.5 h-4.5 text-gold shrink-0 mt-0.5" />
                <p className="text-xxs text-navy/70 leading-relaxed">
                  선택하신 순서 <strong>[{formData.topicPriority.join(" > ")}]</strong> 에 기초하여, 향후 AI 결과서 작성 시 해당 우선순위에 따른 종합 리포트 비중이 극대화 조율됩니다. 사주 자체의 오행 음양 계산 결과 자체는 바뀌지 않습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 하단 제어 바 (Previous / Next Buttons) */}
        <div className="flex justify-between items-center border-t border-brand-border/50 pt-4 mt-6">
          <Button 
            variant="secondary" 
            disabled={step === 1}
            onClick={handlePrev}
            className="flex items-center space-x-1 min-h-[44px] px-4"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 단계</span>
          </Button>

          <span className="text-xxs font-bold text-navy/40">
            {step} / 4단계
          </span>

          <Button 
            variant="primary" 
            onClick={handleNext}
            className="flex items-center space-x-1 min-h-[44px] px-5"
          >
            <span>{step === 4 ? "입력값 최종 검토" : "다음 단계"}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 4. 임시 백업 복구 안내 모달 (Restore Modal) */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface border border-brand-border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="text-center space-y-2">
              <span className="p-2.5 bg-gold/10 text-gold rounded-full inline-block">
                <Sliders className="w-6 h-6" />
              </span>
              <h3 className="text-base font-bold text-navy font-serif">임시 저장된 입력값 복구</h3>
              <p className="text-xxs text-navy/65 leading-relaxed">
                작성 도중 이탈하셨거나 새로고침된 이전의 임시 정보가 존재합니다.<br />
                별칭: <strong>{tempRestoreData?.alias || "(이름없음)"}</strong> ({tempRestoreData?.birthDate})<br />
                기존 임시 작성 데이터를 복구하시겠습니까?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="secondary" onClick={handleDiscardRestore} className="text-xs min-h-[44px]">
                새로 작성하기
              </Button>
              <Button variant="primary" onClick={handleRestore} className="text-xs min-h-[44px]">
                데이터 복구
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
