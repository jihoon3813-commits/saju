import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfileForm from "@/components/profile/ProfileForm";
import { Database, AlertTriangle } from "lucide-react";

export const metadata: Metadata = getMetadata({
  title: "프로필 수정 | 꿈과 운의 사전",
  description: "사주 보관함에 저장된 기존 인적사항 생년월일시와 타임존 정밀 보정 옵션을 변경합니다.",
  canonicalPath: "/my/profiles",
});

interface EditProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  // 1. 서버 측 인증 보안 적용
  const user = await requireAuth();

  // 2. 동적 파라미터(id) 해석 (Next.js 16 Promise 지원 규격)
  const { id } = await params;

  // 3. 프로필 상세 조회
  const profile = await db.profiles.findById(id);

  if (!profile) {
    return (
      <Container className="py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-navy">프로필을 찾을 수 없습니다</h2>
        <p className="text-xs text-navy/60">요청하신 프로필이 존재하지 않거나 이미 삭제되었을 수 있습니다.</p>
      </Container>
    );
  }

  // 4. 엄격한 서버 사이드 소유권 검증
  if (profile.userId !== user.id) {
    // 권한이 없으면 프로필 목록으로 튕겨줍니다.
    redirect("/my/profiles");
  }

  const breadcrumbs = [
    { name: "마이페이지", path: "/my" },
    { name: "프로필 보관함", path: "/my/profiles" },
    { name: `${profile.alias} 수정`, path: `/my/profiles/${id}/edit` }
  ];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1.5 text-center py-4">
          <span className="p-2.5 bg-gold/10 text-gold rounded-full inline-block mb-1">
            <Database className="w-6 h-6" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-navy font-serif">사주 프로필 수정</h1>
          <p className="text-xs text-navy/60 max-w-sm mx-auto leading-relaxed">
            별칭, 태어난 날짜 및 시각의 좌표, 타임존 등의 설정 값을 보정 수정합니다.
          </p>
        </div>

        <ProfileForm initialData={profile} isEdit={true} />
      </div>
    </Container>
  );
}
