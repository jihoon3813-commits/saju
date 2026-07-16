"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ShieldCheck, RefreshCw, KeyRound } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dots, setDots] = useState("");

  const provider = searchParams.get("provider") || "social";
  const email = searchParams.get("email") || "user@example.com";

  // 로딩 점 점 점 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // 1.5초 가상 세션 수립 대기 후 마이페이지로 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/my");
      router.refresh();
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="bg-surface border border-brand-border rounded-2xl p-8 max-w-sm w-full text-center space-y-6 shadow-md">
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <RefreshCw className="w-16 h-16 text-gold animate-spin absolute" />
        <KeyRound className="w-6 h-6 text-navy z-10" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-navy font-serif">
          소셜 세션 인증 연동 중{dots}
        </h2>
        <p className="text-xxs text-navy/60 leading-relaxed">
          {provider.toUpperCase()}로부터 암호화된 서명 식별자를 안전하게 전달받아 꿈과 운의 사전 보안 세션을 발급하는 중입니다.
        </p>
      </div>

      <div className="bg-[#EAE4D6]/20 border border-brand-border/60 p-3 rounded-lg text-[10px] text-navy/70 space-y-1">
        <div>연동 프로바이더: <strong className="text-gold font-bold uppercase">{provider}</strong></div>
        <div className="truncate">인증 이메일: <span className="font-mono text-navy/80">{email}</span></div>
      </div>

      <div className="text-[10px] text-navy/40 flex items-center justify-center space-x-1">
        <ShieldCheck className="w-3.5 h-3.5 text-sage" />
        <span>보안 프로토콜 수립 완료</span>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Container className="py-20 flex items-center justify-center">
      <Suspense fallback={
        <div className="bg-surface border border-brand-border rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-md">
          <RefreshCw className="w-8 h-8 text-gold animate-spin mx-auto" />
          <p className="text-xs text-navy/60">소셜 인증 계정 정보를 수신하는 중입니다...</p>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </Container>
  );
}
