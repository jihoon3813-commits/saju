import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { handleLogout } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { 
  User, 
  Settings, 
  Database, 
  LogOut, 
  Calendar, 
  Compass, 
  Sparkles,
  Heart,
  ChevronRight
} from "lucide-react";

export const metadata: Metadata = getMetadata({
  title: "마이페이지 대시보드 | 꿈과 운의 사전",
  description: "꿈과 운의 사전 회원님의 개인 정보 및 저장된 사주 보관함 현황을 확인합니다.",
  canonicalPath: "/my",
});

export default async function MyDashboardPage() {
  // 1. 서버 사이드 인증 보호 검사 (RSC 권한 검사)
  const user = await requireAuth();

  // 2. 이 유저가 등록한 보관함 프로필 수집
  const profiles = await db.profiles.findByUserId(user.id);
  const selfProfile = profiles.find((p) => p.relationship === "self");

  const breadcrumbs = [{ name: "마이페이지", path: "/my" }];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 회원 웰컴 카드 */}
        <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xxs font-bold text-gold uppercase tracking-wider block">premium member dashboard</span>
            <h1 className="text-xl sm:text-2xl font-bold text-navy font-serif flex items-center space-x-2">
              <span>{user.email.split("@")[0]} 님, 반갑습니다</span>
            </h1>
            <p className="text-xs text-navy/60">
              이메일: <strong className="text-navy">{user.email}</strong> • 가입 수단: <strong className="text-navy uppercase">{user.provider}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Link href="/settings/account">
              <Button variant="secondary" size="sm" className="text-xs flex items-center space-x-1 min-h-[40px]">
                <Settings className="w-3.5 h-3.5" />
                <span>계정 설정</span>
              </Button>
            </Link>
            
            {/* Server Action 기반 로그아웃 form */}
            <form action={async () => { "use server"; await handleLogout(); }}>
              <Button type="submit" variant="secondary" size="sm" className="text-xs text-red-500 hover:bg-red-50 min-h-[40px] flex items-center space-x-1">
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </Button>
            </form>
          </div>
        </div>

        {/* 2단 대시보드 구조 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 왼쪽: 프로필 보관함 요약 카드 (2칸 차지) */}
          <div className="md:col-span-2 bg-surface border border-brand-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-2">
              <h2 className="text-base font-bold text-navy border-b border-brand-border/60 pb-2.5 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Database className="w-4.5 h-4.5 text-gold" />
                  <span>사주 프로필 보관함</span>
                </span>
                <span className="text-xs text-navy/50 font-sans">총 {profiles.length}개 보관 중</span>
              </h2>

              {profiles.length > 0 ? (
                <div className="divide-y divide-brand-border/40">
                  {profiles.slice(0, 3).map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-navy text-sm">{p.alias}</strong>
                        <span className="ml-2 px-1.5 py-0.5 bg-cream text-navy/70 text-[9px] rounded-md font-semibold capitalize">
                          {p.relationship === "self" ? "본인" : p.relationship}
                        </span>
                        <div className="text-navy/55 text-xxs mt-0.5">
                          {p.birthDate} • {p.calendarType === "solar" ? "양력" : "음력"} {p.birthTime ? p.birthTime : "시간 모름"} • {p.birthCity}
                        </div>
                      </div>
                      <Link href={`/my/profiles/${p.id}/edit`}>
                        <Button variant="secondary" size="sm" className="text-xxs">
                          수정/관리
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-navy/50 text-xs">
                  등록된 사주 프로필이 없습니다.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between">
              <Link href="/my/profiles/new">
                <Button variant="primary" size="sm" className="text-xs font-bold min-h-[40px]">
                  + 새 프로필 등록하기
                </Button>
              </Link>
              <Link href="/my/profiles" className="text-xs text-gold font-bold flex items-center hover:underline">
                <span>보관함 전체 목록 보기</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 오른쪽: 추천 기능 및 바로가기 */}
          <div className="bg-[#EAE4D6]/20 border border-brand-border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-navy flex items-center space-x-1">
              <Compass className="w-4 h-4 text-gold" />
              <span>바로 시작하기</span>
            </h3>

            <div className="space-y-2.5">
              <Link 
                href="/fortune/input" 
                className="block bg-surface border border-brand-border hover:border-gold p-3 rounded-xl transition-all group"
              >
                <div className="text-xs font-bold text-navy flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    <span>오늘의 운세 진단</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-navy/30 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[10px] text-navy/60 mt-1 leading-normal">
                  저장된 내 사주 정보를 불러와 오늘의 십신 세부 운세를 즉시 확인합니다.
                </p>
              </Link>

              <Link 
                href="/fortune/input" 
                className="block bg-surface border border-brand-border hover:border-gold p-3 rounded-xl transition-all group"
              >
                <div className="text-xs font-bold text-navy flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-3.5 h-3.5 text-red-400" />
                    <span>인연 궁합 매칭</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-navy/30 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[10px] text-navy/60 mt-1 leading-normal">
                  내 프로필과 등록해 둔 지인/연인 프로필을 매칭하여 오행 궁합지수를 산출합니다.
                </p>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </Container>
  );
}
