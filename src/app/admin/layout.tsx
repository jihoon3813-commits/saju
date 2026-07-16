import React from "react";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { 
  FileText, 
  Users, 
  Link2, 
  Home, 
  ShieldAlert, 
  Lock 
} from "lucide-react";
import AdminLoginInlineForm from "@/components/admin/AdminLoginInlineForm";

export const metadata = {
  title: "CMS 관리자 센터 - 꿈과 운의 사전",
  robots: "noindex, nofollow"
};

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // 1. 관리자 권한 최종 방어선 (비로그인 상태 시 인라인 로그인 컴포넌트를 즉각 호출)
  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream p-8">
        <AdminLoginInlineForm />
      </div>
    );
  }

  // 2. 로그인된 관리자를 위한 대시보드 구조 (로열블루 & 라이트 테마)
  return (
    <div className="min-h-screen bg-cream text-navy flex flex-col md:flex-row font-semibold">
      {/* 어드민 사이드바 */}
      <aside className="w-full md:w-64 bg-white border-r border-brand-border p-6 flex flex-col space-y-8 shrink-0 shadow-sm">
        <div>
          <Link href="/admin" className="flex items-center space-x-2 text-gold font-extrabold text-lg">
            <ShieldAlert className="w-6 h-6 text-gold" />
            <span>어드민 제어판</span>
          </Link>
          <div className="text-xs text-navy/40 mt-1 select-all font-mono">{user.email} (관리자)</div>
        </div>

        <nav className="flex-1 flex flex-col space-y-1.5">
          <Link 
            href="/admin" 
            className="flex items-center space-x-3 px-4 py-3 text-sm text-navy/70 hover:text-gold hover:bg-cream/45 rounded-xl transition font-bold"
          >
            <Home className="w-4 h-4 text-gold" />
            <span>종합 대시보드</span>
          </Link>
          <Link 
            href="/admin/content" 
            className="flex items-center space-x-3 px-4 py-3 text-sm text-navy/70 hover:text-gold hover:bg-cream/45 rounded-xl transition font-bold"
          >
            <FileText className="w-4 h-4 text-gold" />
            <span>콘텐츠·글 관리</span>
          </Link>
          <Link 
            href="/admin/authors" 
            className="flex items-center space-x-3 px-4 py-3 text-sm text-navy/70 hover:text-gold hover:bg-cream/45 rounded-xl transition font-bold"
          >
            <Users className="w-4 h-4 text-gold" />
            <span>작성자·작가 목록</span>
          </Link>
          <Link 
            href="/admin/ads" 
            className="flex items-center space-x-3 px-4 py-3 text-sm text-navy/70 hover:text-gold hover:bg-cream/45 rounded-xl transition font-bold"
          >
            <Link2 className="w-4 h-4 text-gold" />
            <span>광고 슬롯 제어</span>
          </Link>
          <Link 
            href="/admin/analytics" 
            className="flex items-center space-x-3 px-4 py-3 text-sm text-navy/70 hover:text-gold hover:bg-cream/45 rounded-xl transition font-bold"
          >
            <FileText className="w-4 h-4 text-gold" />
            <span>서비스 분석 통계</span>
          </Link>
          <Link 
            href="/admin/products" 
            className="flex items-center space-x-3 px-4 py-3 text-sm text-navy/70 hover:text-gold hover:bg-cream/45 rounded-xl transition font-bold"
          >
            <ShieldAlert className="w-4 h-4 text-gold" />
            <span>상품·가격 설정</span>
          </Link>
          <Link 
            href="/admin/orders" 
            className="flex items-center space-x-3 px-4 py-3 text-sm text-navy/70 hover:text-gold hover:bg-cream/45 rounded-xl transition font-bold"
          >
            <ShieldAlert className="w-4 h-4 text-gold" />
            <span>주문·결제 대장</span>
          </Link>
          <Link 
            href="/admin/coupons" 
            className="flex items-center space-x-3 px-4 py-3 text-sm text-navy/70 hover:text-gold hover:bg-cream/45 rounded-xl transition font-bold"
          >
            <ShieldAlert className="w-4 h-4 text-gold" />
            <span>할인 쿠폰 통제</span>
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center space-x-3 px-4 py-3 text-sm text-navy/60 hover:text-gold hover:bg-cream/45 rounded-xl transition font-bold mt-auto border-t border-brand-border/40 pt-4"
          >
            <Home className="w-4 h-4 text-gold" />
            <span>공개 서비스 홈</span>
          </Link>
        </nav>
      </aside>

      {/* 메인 어드민 본문 공간 */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
