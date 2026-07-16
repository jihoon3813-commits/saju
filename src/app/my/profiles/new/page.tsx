import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { requireAuth } from "@/lib/auth";
import ProfileForm from "@/components/profile/ProfileForm";
import { Database } from "lucide-react";

export const metadata: Metadata = getMetadata({
  title: "새 프로필 등록 | 꿈과 운의 사전",
  description: "사주명조와 궁합 분석을 위해 새로운 가족, 친구, 연인의 생년월일시 정보를 보관함에 추가합니다.",
  canonicalPath: "/my/profiles/new",
});

export default async function NewProfilePage() {
  // 1. 서버 측 인증 보안 적용
  await requireAuth();

  const breadcrumbs = [
    { name: "마이페이지", path: "/my" },
    { name: "프로필 보관함", path: "/my/profiles" },
    { name: "새 프로필 추가", path: "/my/profiles/new" }
  ];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1.5 text-center py-4">
          <span className="p-2.5 bg-gold/10 text-gold rounded-full inline-block mb-1">
            <Database className="w-6 h-6" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-navy font-serif">새 사주 프로필 등록</h1>
          <p className="text-xs text-navy/60 max-w-sm mx-auto leading-relaxed">
            나 혹은 알고 싶은 소중한 타인의 생년월일시 정보를 입력하여 보관함에 영구 추가합니다.
          </p>
        </div>

        <ProfileForm isEdit={false} />
      </div>
    </Container>
  );
}
