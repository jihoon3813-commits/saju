/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { handleEmailLogin, handleEmailSignup, handleSocialLoginMock } from "@/app/actions/auth";
import { LogIn, UserPlus, Mail, Lock, ShieldCheck } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // 1. 이메일 로그인/가입 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      if (isRegisterMode) {
        formData.append("passwordConfirm", passwordConfirm);
        const result = await handleEmailSignup(null, formData);
        if (!result.success) {
          setError(result.error || "가입 중 오류가 발생했습니다.");
          setLoading(false);
          return;
        }
      } else {
        const result = await handleEmailLogin(null, formData);
        if (!result.success) {
          setError(result.error || "로그인 중 오류가 발생했습니다.");
          setLoading(false);
          return;
        }
      }

      // 성공 시 대시보드(마이페이지)로 이동
      router.push("/my");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "서버 통신 실패");
    } finally {
      setLoading(false);
    }
  };

  // 2. 소셜 간편 로그인 모형 시뮬레이션
  const handleSocialMockClick = async (provider: "google" | "kakao" | "naver") => {
    setLoading(true);
    setError(null);
    
    // 모의 소셜 이메일 매핑
    const mockEmail = `mock-${provider}-${Math.floor(Math.random() * 900) + 100}@example.com`;

    try {
      // 0.5초 가상 딜레이로 소셜 전환 애니메이션 유도
      await new Promise((res) => setTimeout(res, 500));
      
      const result = await handleSocialLoginMock(mockEmail, provider);
      if (result.success) {
        // 소셜 성공 시 콜백 화면으로 모의 전환했다가 마이페이지로 이동하는 동적 전환 테스트 지원
        router.push(`/auth/callback?provider=${provider}&email=${encodeURIComponent(mockEmail)}`);
      } else {
        setError(result.error || "소셜 가상 인증 실패");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "소셜 로그인 연동 에러");
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      
      {/* 탭 헤더 */}
      <div className="flex border-b border-brand-border/60">
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(false);
            setError(null);
          }}
          className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
            !isRegisterMode 
              ? "border-gold text-navy" 
              : "border-transparent text-navy/45 hover:text-navy/70"
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(true);
            setError(null);
          }}
          className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
            isRegisterMode 
              ? "border-gold text-navy" 
              : "border-transparent text-navy/45 hover:text-navy/70"
          }`}
        >
          이메일 가입
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xxs text-center">
          {error}
        </div>
      )}

      {/* 로그인 / 회원가입 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4.5">
        <div className="space-y-3">
          <div>
            <label className="text-xxs font-bold text-navy/60 block mb-1">이메일 주소</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-navy/40" />
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-lg text-sm bg-surface focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="text-xxs font-bold text-navy/60 block mb-1">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-navy/40" />
              <input
                type="password"
                required
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-lg text-sm bg-surface focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div className="animate-slideDown">
              <label className="text-xxs font-bold text-navy/60 block mb-1">비밀번호 확인</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-navy/40" />
                <input
                  type="password"
                  required
                  placeholder="••••••"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-lg text-sm bg-surface focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
                />
              </div>
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          disabled={loading}
          className="font-bold min-h-[44px]"
        >
          {loading ? (
            "처리 중..."
          ) : isRegisterMode ? (
            <span className="flex items-center justify-center space-x-1"><UserPlus className="w-4 h-4" /> <span>가입 및 회원 로그인</span></span>
          ) : (
            <span className="flex items-center justify-center space-x-1"><LogIn className="w-4 h-4" /> <span>로그인하기</span></span>
          )}
        </Button>
      </form>

      {/* 구분선 */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-brand-border/60"></div>
        <span className="flex-shrink mx-4 text-xxs font-semibold text-navy/40 uppercase tracking-widest">or social login</span>
        <div className="flex-grow border-t border-brand-border/60"></div>
      </div>

      {/* 모의 소셜 로그인 버튼 집합 */}
      <div className="space-y-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSocialMockClick("kakao")}
          className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer"
        >
          <span>💬</span>
          <span>카카오 1초 간편 로그인</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleSocialMockClick("naver")}
          className="w-full bg-[#03C75A] hover:bg-[#03C75A]/90 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer"
        >
          <span className="font-serif font-extrabold text-sm">N</span>
          <span>네이버 아이디로 로그인</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleSocialMockClick("google")}
          className="w-full bg-white hover:bg-cream/20 text-navy border border-brand-border font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer"
        >
          <span>🌐</span>
          <span>Google 계정으로 가입</span>
        </button>
      </div>

      <div className="text-center pt-2">
        <p className="text-[10px] text-navy/50 leading-relaxed flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-sage" />
          <span>보안 인증 시스템에 의한 데이터 1:1 격리 보호 적용 중</span>
        </p>
      </div>

    </div>
  );
}
