"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Sun, Sparkles, Clock, RefreshCw, UserPlus, Users, AlertCircle, ShieldAlert } from "lucide-react";
import { handleGetProfilesAction, handleCreateProfile } from "@/app/actions/profile";
import { getOrCreateInterpretationAction } from "@/app/actions/interpretation";
import { BirthProfile } from "@/schemas/fortune";

export default function TodayFortunePage() {
  const breadcrumbs = [{ name: "오늘의 운세", path: "/today" }];

  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [profilesLoading, setProfilesLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [todayFortune, setTodayFortune] = useState<any | null>(null);

  // 새 프로필 폼 필드
  const [alias, setAlias] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "unspecified">("male");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [lunarLeap, setLunarLeap] = useState<boolean>(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);

  // 프로필 로드
  const loadProfiles = async () => {
    setProfilesLoading(true);
    const res = await handleGetProfilesAction();
    setProfilesLoading(false);
    if (res.success && res.list) {
      setProfiles(res.list);
      if (res.list.length > 0) {
        setSelectedProfileId(res.list[0].id || "");
      }
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  // 새 프로필 생성
  const handleAddNewProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim() || !birthDate) {
      setError("이름(별칭)과 생년월일을 정확히 작성해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await handleCreateProfile({
      alias,
      genderRuleOption: gender,
      calendarType,
      lunarLeapMonth: calendarType === "lunar" ? lunarLeap : null,
      birthDate,
      birthTime: unknownTime ? null : birthTime || null,
      unknownBirthTime: unknownTime,
      birthCountry: "KR",
      birthCity: "Seoul",
      timezone: "Asia/Seoul",
      latitude: 37.5665,
      longitude: 126.978,
      relationship: "self",
      saveConsent: true,
      calculationPreference: {
        useTrueSolarTime: false,
        borderTimeRule: "23"
      }
    });

    setLoading(false);

    if (res.success && res.profile) {
      setShowAddForm(false);
      setAlias("");
      setBirthDate("");
      setBirthTime("");
      await loadProfiles();
      setSelectedProfileId(res.profile.id || "");
    } else {
      setError(res.error || "프로필 저장 중 오류가 발생했습니다.");
    }
  };

  // 오늘의 운세 연산 및 조회
  const handleViewFortune = async () => {
    if (!selectedProfileId) {
      setError("조회할 프로필을 선택하거나 새로 등록해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setTodayFortune(null);

    const res = await getOrCreateInterpretationAction({
      profileId: selectedProfileId,
      serviceType: "today"
    });

    setLoading(false);

    if (res.success && res.result) {
      setTodayFortune(res.result.reportData);
    } else {
      setError(res.error || "오늘의 운세를 분석하는 중 오류가 발생했습니다.");
    }
  };

  const activeProfile = profiles.find((p) => p.id === selectedProfileId);

  return (
    <Container className="py-8 space-y-6 animate-fade-in">
      <Breadcrumb items={breadcrumbs} />

      <div className="space-y-8 max-w-3xl mx-auto">
        {/* 헤더 안내 */}
        <div className="text-center space-y-2 py-6">
          <span className="p-3 bg-gold/10 text-gold border border-gold/20 rounded-full inline-block mb-2 shadow-sm">
            <Sun className="w-6 h-6 text-gold animate-spin-slow" />
          </span>
          <h1 className="text-3xl font-extrabold text-navy">오늘의 사주 운세</h1>
          <p className="text-sm text-navy/60 max-w-md mx-auto leading-relaxed font-medium">
            나의 고유 일간(日干)과 오늘 날짜 천간 간의 명리학적 대조를 거친 맞춤형 십신 일일 가이드라인
          </p>
        </div>

        {/* 1. 프로필 관리 카드 */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex justify-between items-center border-b border-brand-border pb-4">
            <h2 className="text-md font-bold text-navy flex items-center space-x-2">
              <Users className="w-4 h-4 text-gold" />
              <span>운세 대상 선택</span>
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs text-gold hover:text-gold/80 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "목록으로 돌아가기" : "새 프로필 등록"}</span>
            </button>
          </div>

          {profilesLoading ? (
            <div className="text-center py-6 text-xs text-slate-500 flex justify-center items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
              <span>나의 프로필 데이터 로드 중...</span>
            </div>
          ) : showAddForm ? (
            /* 새 프로필 추가 폼 */
            <form onSubmit={handleAddNewProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy/60">별칭/이름</label>
                  <input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-3 py-2 text-xs text-navy border border-brand-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-gold/60 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy/60">성별</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-navy border border-brand-border rounded-lg bg-white focus:outline-none font-semibold"
                  >
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                    <option value="unspecified">선택안함</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy/60">달력</label>
                  <select
                    value={calendarType}
                    onChange={(e: any) => setCalendarType(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-navy border border-brand-border rounded-lg bg-white focus:outline-none font-semibold"
                  >
                    <option value="solar">양력</option>
                    <option value="lunar">음력</option>
                  </select>
                </div>

                {calendarType === "lunar" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy/60">윤달 여부</label>
                    <select
                      value={lunarLeap ? "leap" : "normal"}
                      onChange={(e) => setLunarLeap(e.target.value === "leap")}
                      className="w-full px-3 py-2 text-xs text-navy border border-brand-border rounded-lg bg-white focus:outline-none font-semibold"
                    >
                      <option value="normal">평달</option>
                      <option value="leap">윤달</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-navy/60">생년월일 (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-navy border border-brand-border rounded-lg bg-white focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy/60">태어난 시간 (선택)</label>
                  <input
                    type="time"
                    value={birthTime}
                    disabled={unknownTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-navy border border-brand-border rounded-lg bg-white focus:outline-none disabled:opacity-40 font-semibold"
                  />
                </div>
                <div className="pb-2.5 flex items-center">
                  <label className="text-xs text-navy/60 font-bold flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={unknownTime}
                      onChange={(e) => setUnknownTime(e.target.checked)}
                      className="rounded border-brand-border text-gold bg-white focus:ring-0"
                    />
                    <span>태어난 시간 모름</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" disabled={loading} className="px-6 text-xs bg-gold hover:bg-gold/95 text-white font-bold shadow-sm">
                  {loading ? "등록 중..." : "프로필 생성 저장"}
                </Button>
              </div>
            </form>
          ) : (
            /* 기존 프로필 선택 지면 */
            <div className="space-y-4">
              {profiles.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 font-medium">
                  등록된 사주 프로필이 없습니다. 우측 상단의 '새 프로필 등록'을 선택해 생성해 주세요.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-navy/60">분석할 프로필</label>
                    <select
                      value={selectedProfileId}
                      onChange={(e) => {
                        setSelectedProfileId(e.target.value);
                        setTodayFortune(null);
                        setError(null);
                      }}
                      className="w-full px-4 py-3 text-sm text-navy border border-brand-border rounded-xl bg-white focus:outline-none font-semibold"
                    >
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.alias} ({p.genderRuleOption === "male" ? "남" : p.genderRuleOption === "female" ? "여" : "무관"}) - {p.birthDate} {p.birthTime || "(시간모름)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeProfile && (
                    <div className="bg-cream/40 p-4 rounded-2xl border border-brand-border/60 text-xs text-navy/70 space-y-2 font-medium">
                      <div className="flex justify-between">
                        <span>달력 구분: <strong className="text-navy">{activeProfile.calendarType === "solar" ? "양력" : "음력(평달)"}</strong></span>
                        <span>태생지: <strong className="text-navy">대한민국 서울 (KST)</strong></span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center pt-2">
                    <Button
                      variant="primary"
                      onClick={handleViewFortune}
                      disabled={loading || !selectedProfileId}
                      className="w-full sm:w-64 font-bold text-xs py-3.5 bg-gold hover:bg-gold/95 text-white rounded-xl shadow-md"
                    >
                      {loading ? (
                        <span className="flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI 우주 일진 대조 중...</span>
                        </span>
                      ) : (
                        <span>오늘의 운세 연산 및 결과 보기</span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-600 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* 2. 오늘의 운세 결과판 */}
        {todayFortune && (
          <div className="space-y-6 animate-fade-in">
            {/* 총평 한줄 */}
            <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-md">
              <div className="flex items-center justify-center space-x-2 text-gold text-xs font-black tracking-widest uppercase animate-pulse">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>TODAY'S FORtune SUMmary</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-navy leading-snug">
                “ {todayFortune.summary} ”
              </h3>
            </div>

            {/* 카드 하이라이트 요약 */}
            {todayFortune.highlights && todayFortune.highlights.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-3">
                {todayFortune.highlights.map((hl: any, idx: number) => (
                  <div key={idx} className="bg-white border border-brand-border rounded-2xl p-4 space-y-1.5 shadow-sm text-center">
                    <span className="text-[10px] text-navy/50 font-bold block">{hl.title}</span>
                    <strong className="text-sm text-gold font-extrabold">{hl.value}</strong>
                  </div>
                ))}
              </div>
            )}

            {/* 세부 운세 섹션 본문 */}
            <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
              {todayFortune.sections && todayFortune.sections.map((sect: any, sIdx: number) => (
                <div key={sIdx} className={`space-y-4 ${sIdx > 0 ? "border-t border-brand-border pt-6" : ""}`}>
                  <h4 className="text-sm font-extrabold text-gold flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block"></span>
                    <span>{sect.title}</span>
                  </h4>
                  <p className="text-xs text-navy/60 font-semibold leading-relaxed">
                    {sect.summary}
                  </p>

                  <div className="space-y-3 pl-2.5">
                    {sect.paragraphs && sect.paragraphs.map((p: string, pIdx: number) => (
                      <p key={pIdx} className="text-xs text-navy/80 leading-relaxed font-medium">
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* 긍정적 조언 & 주의 지표 */}
                  <div className="grid gap-3 sm:grid-cols-2 pt-2 text-[11px]">
                    {sect.positiveSignals && sect.positiveSignals.length > 0 && (
                      <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl space-y-1.5">
                        <span className="font-bold text-emerald-600">💡 행운의 길잡이 / 기회 지표</span>
                        <ul className="list-disc list-inside space-y-1 text-navy/85 font-medium pl-1">
                          {sect.positiveSignals.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}
                    {sect.cautionSignals && sect.cautionSignals.length > 0 && (
                      <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl space-y-1.5">
                        <span className="font-bold text-rose-600">⚠️ 조율할 주의점 / 기만 경계</span>
                        <ul className="list-disc list-inside space-y-1 text-navy/85 font-medium pl-1">
                          {sect.cautionSignals.map((item: string, i: number) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* 오늘의 처방전 가이드 */}
                  {sect.actions && sect.actions.length > 0 && (
                    <div className="bg-indigo-50/75 border border-indigo-100 p-4 rounded-xl space-y-2 text-[11px]">
                      <span className="font-bold text-indigo-600">🎯 실천 개운 행동 요령</span>
                      <ul className="list-decimal list-inside space-y-1.5 text-navy/90 font-medium pl-1">
                        {sect.actions.map((act: string, i: number) => <li key={i}>{act}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              <div className="text-[10px] text-navy/40 border-t border-brand-border pt-4 flex items-center space-x-1.5 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-navy/30 flex-shrink-0" />
                <span>본 해석은 천체 운동학에 근거한 명리 연산이며, 행위의 책임은 당사자 본인에게 속해 있습니다.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
