import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { requireAuth } from "@/lib/auth";
import AccountSettings from "@/components/settings/AccountSettings";
import { Settings } from "lucide-react";

export const metadata: Metadata = getMetadata({
  title: "계정 설정 | 꿈과 운의 사전",
  description: "꿈과 운의 사전 회원 계정의 연결 상세 정보를 조회하고 회원 탈퇴 및 보관 프로필 영구 삭제 작업을 수행합니다.",
  canonicalPath: "/settings/account",
});

export default async function AccountSettingsPage() {
  // 1. 서버 측 인증 보안 적용
  const user = await requireAuth();

  const breadcrumbs = [
    { name: "마이페이지", path: "/my" },
    { name: "계정 설정", path: "/settings/account" }
  ];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="space-y-1.5 text-center py-4">
          <span className="p-2.5 bg-navy/5 text-navy rounded-full inline-block mb-1">
            <Settings className="w-6 h-6" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-navy font-serif">계정 설정</h1>
          <p className="text-xs text-navy/60 max-w-sm mx-auto leading-relaxed">
            나의 기본 연동 세션 정보 조회 및 회원 계정 탈퇴 처리를 진행할 수 있습니다.
          </p>
        </div>

        <AccountSettings userEmail={user.email} userProvider={user.provider} />
      </div>
    </Container>
  );
}
