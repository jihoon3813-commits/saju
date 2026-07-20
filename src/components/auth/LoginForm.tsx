/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { handleEmailLogin, handleEmailSignup, handleSocialLoginMock, getGoogleAuthConfig } from "@/app/actions/auth";
import { LogIn, UserPlus, Mail, Lock, ShieldCheck } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoogleEmailInput, setShowGoogleEmailInput] = useState<boolean>(false);
  const [googleEmail, setGoogleEmail] = useState<string>("");

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

  // 구글 가입/로그인 처리
  const handleGoogleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await getGoogleAuthConfig();
      if (config.isConfigured) {
        window.location.href = "/api/auth/google";
      } else {
        setShowGoogleEmailInput(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "구글 인증 시도 중 에러");
      setLoading(false);
    }
  };

  // 구글 개발용 폴백 제출 처리
  const handleGoogleFallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail) return;
    setLoading(true);
    setError(null);

    try {
      const result = await handleSocialLoginMock(googleEmail, "google");
      if (result.success) {
        router.push(`/auth/callback?provider=google&email=${encodeURIComponent(googleEmail)}`);
      } else {
        setError(result.error || "구글 모의 가입 실패");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "구글 모의 가입 에러");
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

      {/* 소셜 로그인 (Google) */}
      <div className="space-y-2">
        {showGoogleEmailInput ? (
          <form onSubmit={handleGoogleFallbackSubmit} className="space-y-3 p-4 bg-[#EAE4D6]/20 border border-brand-border/60 rounded-xl animate-fadeIn">
            <p className="text-xxs font-bold text-navy/70 leading-relaxed">
              [개발자 모드] 구글 Client ID가 설정되지 않았습니다. 테스트할 구글 이메일을 입력하세요:
            </p>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-navy/40" />
              <input
                type="email"
                required
                placeholder="user@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-brand-border rounded-lg text-sm bg-surface focus:outline-none focus:ring-1 focus:ring-gold min-h-[44px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowGoogleEmailInput(false);
                  setError(null);
                }}
                disabled={loading}
                className="flex-1 text-xs"
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !googleEmail}
                className="flex-1 text-xs"
              >
                {loading ? "처리 중..." : "가입 완료"}
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleClick}
            className="w-full bg-white hover:bg-cream/20 text-navy border border-brand-border font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer"
          >
            <span>🌐</span>
            <span>Google 계정으로 가입</span>
          </button>
        )}
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
