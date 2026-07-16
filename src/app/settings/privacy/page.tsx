import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { getCurrentUser, getOrCreateAnonymousSession } from "@/lib/auth";
import { db } from "@/lib/db";
import PrivacySettings from "@/components/settings/PrivacySettings";
import { ShieldCheck } from "lucide-react";
import { BirthProfile } from "@/schemas/fortune";

export const metadata: Metadata = getMetadata({
  title: "개인정보 처리 및 관리 | 꿈과 운의 사전",
  description: "꿈과 운의 사전에 저장된 나의 데이터를 확인 및 다운로드하고, 보관 중인 개인정보를 파기 또는 철회합니다.",
  canonicalPath: "/settings/privacy",
});

export default async function PrivacySettingsPage() {
  const user = await getCurrentUser();
  const anonymousSessionId = await getOrCreateAnonymousSession();

  let existingProfiles: BirthProfile[] = [];
  try {
    if (user) {
      existingProfiles = await db.profiles.findByUserId(user.id);
    } else if (anonymousSessionId) {
      existingProfiles = await db.profiles.findByAnonymousSessionId(anonymousSessionId);
    }
  } catch (err) {
    console.error("Failed to load profiles for privacy page:", err);
  }

  const breadcrumbs = [
    { name: "마이페이지", path: "/my" },
    { name: "개인정보 관리", path: "/settings/privacy" }
  ];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="space-y-1.5 text-center py-4">
          <span className="p-2.5 bg-sage/10 text-sage rounded-full inline-block mb-1">
            <ShieldCheck className="w-6 h-6" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-navy font-serif">개인정보 처리 방침 & 데이터 제어</h1>
          <p className="text-xs text-navy/60 max-w-sm mx-auto leading-relaxed">
            나의 저장된 민감 사주 정보를 직접 투명하게 조회하여 내보내거나 파기할 권리를 실현합니다.
          </p>
        </div>

        <PrivacySettings 
          initialProfiles={existingProfiles} 
          isLoggedIn={!!user} 
        />
      </div>
    </Container>
  );
}
