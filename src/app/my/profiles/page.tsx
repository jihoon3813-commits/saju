import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfileCard from "@/components/profile/ProfileCard";
import { Button } from "@/components/ui/Button";
import { Database, Plus, Heart, User } from "lucide-react";

export const metadata: Metadata = getMetadata({
  title: "프로필 보관함 관리 | 꿈과 운의 사전",
  description: "저장된 사주 정보 보관함을 조회 및 관리하며 가족, 연인, 동업자의 생년월일시 데이터를 세밀하게 격리 저장합니다.",
  canonicalPath: "/my/profiles",
});

export default async function MyProfilesPage() {
  // 1. 서버 측 인증 보호
  const user = await requireAuth();

  // 2. 이 유저에 등록된 전 프로필 인출 (Soft Deleted 항목 제외됨)
  const profiles = await db.profiles.findByUserId(user.id);

  const breadcrumbs = [
    { name: "마이페이지", path: "/my" },
    { name: "프로필 보관함", path: "/my/profiles" }
  ];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 헤더 바 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-5">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-navy font-serif flex items-center space-x-2">
              <Database className="w-5.5 h-5.5 text-gold" />
              <span>사주 프로필 보관함</span>
            </h1>
            <p className="text-xs text-navy/60 leading-relaxed">
              본인, 가족, 연인, 친구 등 다중 사주 데이터를 보관하고 삭제할 수 있습니다.
            </p>
          </div>

          <Link href="/my/profiles/new" className="shrink-0">
            <Button variant="primary" className="font-bold min-h-[44px] flex items-center space-x-1.5 px-6">
              <Plus className="w-4 h-4" />
              <span>새 프로필 추가</span>
            </Button>
          </Link>
        </div>

        {/* 안내문 */}
        <div className="bg-[#EAE4D6]/20 border border-brand-border/60 p-4.5 rounded-xl space-y-2 text-xxs text-navy/70 leading-normal">
          <div className="font-bold text-navy flex items-center space-x-1">
            <User className="w-4 h-4 text-gold" />
            <span>타인 정보 관리 안내 및 개인정보 준수 고지</span>
          </div>
          <p>
            가족, 배우자, 연인 등 타인의 사주 정보를 기입하고 보관할 시에는 정보 주체의 명시적인 동의를 득하여 주시기 바랍니다. 수집 목적(운세 및 궁합 분석)을 달성했거나 보관의 필요성이 없어지면 우측 하단의 <strong>삭제</strong> 버튼을 눌러 데이터베이스에서 완전히 격리 파기해 주실 것을 권고합니다.
          </p>
        </div>

        {/* 프로필 카드 격자 */}
        {profiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {profiles.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-brand-dashed-border border-dashed rounded-2xl py-16 text-center space-y-4">
            <div className="text-4xl text-navy/20">🪐</div>
            <h3 className="text-sm font-bold text-navy">아직 등록된 사주 프로필이 없습니다</h3>
            <p className="text-xxs text-navy/60 max-w-xs mx-auto leading-normal">
              새 프로필을 추가하여 매일 아침의 나만의 십신 일일 운세와 소중한 사람들과의 상생상극 궁합 분석을 시작해 보세요.
            </p>
            <div className="pt-2">
              <Link href="/my/profiles/new">
                <Button variant="primary" size="sm" className="font-bold min-h-[40px] px-6">
                  첫 프로필 등록하러 가기
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </Container>
  );
}
