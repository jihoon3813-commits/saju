import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "@/components/auth/LoginForm";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = getMetadata({
  title: "회원가입 및 로그인 | 꿈과 운의 사전",
  description: "꿈과 운의 사전에 로그인하고 개인화된 사주 보관함, 다중 궁합 프로필 관리 기능을 이용해 보세요.",
  canonicalPath: "/login",
});

export default async function LoginPage() {
  const user = await getCurrentUser();
  
  // 이미 로그인된 사용자는 계정 대시보드(/my)로 즉시 튕겨줍니다.
  if (user) {
    redirect("/my");
  }

  const breadcrumbs = [{ name: "로그인", path: "/login" }];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="space-y-8 max-w-md mx-auto py-4">
        {/* 헤더 안내 */}
        <div className="text-center space-y-2">
          <span className="p-2.5 bg-[#EAE4D6]/50 border border-brand-border/60 text-gold rounded-full inline-block mb-1">
            ✨
          </span>
          <h1 className="text-2xl font-bold text-navy font-serif">나만의 프로필 보관함</h1>
          <p className="text-xs text-navy/70 leading-relaxed">
            회원으로 시작하시면 분석해 둔 사주 데이터를 무기한 저장하고, 가족이나 친구와의 인연궁합을 실시간 비교할 수 있습니다.
          </p>
        </div>

        <LoginForm />

        <div className="bg-[#EAE4D6]/20 border border-brand-border/60 p-4.5 rounded-xl flex items-start space-x-2 text-[10px] text-navy/60 leading-normal">
          <ShieldAlert className="w-4.5 h-4.5 text-gold shrink-0 mt-0.5" />
          <span>
            비회원으로 이용하시더라도 쿠키 기반으로 분석 도구 이용이 가능하나, 브라우저 캐시 삭제 시 소장 데이터가 영구 소실될 수 있으므로 간편 회원 등록을 권장합니다.
          </span>
        </div>
      </div>
    </Container>
  );
}
