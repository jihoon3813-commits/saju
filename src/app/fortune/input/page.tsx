import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { getCurrentUser, getOrCreateAnonymousSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { initializeDatabase } from "@/lib/db/init";
import FortuneInputWizard from "@/components/fortune/FortuneInputWizard";
import { BirthProfile } from "@/schemas/fortune";

export const metadata: Metadata = getMetadata({
  title: "운세 정보 입력 | 꿈과 운의 사전",
  description: "사주명조 산출을 위한 별칭, 생년월일시, 출생지 정보 및 정밀 계산법 옵션을 단계별로 안전하게 기입합니다.",
  canonicalPath: "/fortune/input",
});

export default async function FortuneInputPage() {
  // DB 초기화 보장
  await initializeDatabase();

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
    console.error("Failed to load existing profiles in page:", err);
  }

  const breadcrumbs = [
    { name: "운세 입력", path: "/fortune/input" }
  ];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />
      
      <div className="max-w-3xl mx-auto text-center space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy font-serif">정밀 사주 산출 정보 기입</h1>
        <p className="text-xs text-navy/70 max-w-md mx-auto leading-relaxed">
          동양 전통 명리학 공식과 지구 공전 궤도 보정을 결합하여 한 치의 오차 없는 절기각을 연산합니다.
        </p>
      </div>

      <FortuneInputWizard existingProfiles={existingProfiles} />
    </Container>
  );
}
