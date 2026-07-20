"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, User, Globe } from "lucide-react";
import { Container } from "./Container";
import { DesktopMegaMenu } from "./DesktopMegaMenu";
import { MobileMenu } from "./MobileMenu";
import { Button } from "../ui/Button";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 메가메뉴 제어 헬퍼
  const handleMegaMenuOpen = (category: string) => {
    setActiveMegaCategory(category);
    setMegaMenuOpen(true);
  };

  const handleMegaMenuClose = () => {
    setMegaMenuOpen(false);
    setActiveMegaCategory(null);
  };

  const navLinks = [
    { label: "오늘", href: "/today" },
    { label: "사주", href: "/saju", hasMega: true, category: "saju" },
    { label: "궁합", href: "/compatibility" },
    { label: "타로", href: "/tarot", hasMega: true, category: "tarot" },
    { label: "꿈해몽", href: "/dreams" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-brand-border/60 shadow-xs">
        <Container className="h-16 flex items-center justify-between">
          {/* 1. 로고 */}
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="focus:outline-none rounded px-1 flex items-center justify-center"
            >
              <img 
                src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1784171074/Image_2_csmzku.png" 
                alt="꿈과 운의 사전" 
                className="h-8 w-auto object-contain"
              />
            </Link>

            {/* 2. PC 네비게이션 링크 */}
            <nav className="hidden md:flex items-center space-x-6" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                if (link.hasMega) {
                  return (
                    <div
                      key={link.href}
                      className="relative"
                      onMouseEnter={() => handleMegaMenuOpen(link.category!)}
                    >
                      <button
                        type="button"
                        className={`text-sm font-semibold tracking-tight py-2 border-b-2 transition-colors cursor-pointer focus:outline-none ${
                          isActive || (activeMegaCategory === link.category)
                            ? "border-gold text-gold"
                            : "border-transparent text-navy/70 hover:text-navy hover:border-navy/15"
                        }`}
                      >
                        {link.label}
                      </button>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-semibold tracking-tight py-2 border-b-2 transition-colors focus:outline-none ${
                      isActive
                        ? "border-gold text-gold"
                        : "border-transparent text-navy/70 hover:text-navy hover:border-navy/15"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 3. 우측 컨트롤 유틸리티 */}
          <div className="flex items-center space-x-2">
            {/* 검색 버튼 */}
            <Link
              href="/search"
              aria-label="통합 검색 페이지로 이동"
              className="p-2 text-navy/60 hover:text-navy hover:bg-cream/40 rounded-full transition-colors focus:ring-2 focus:ring-gold/40 focus:outline-none min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* PC용 마이페이지/로그인 */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/my">
                <Button variant="outline" size="sm" className="min-h-[36px] flex items-center space-x-1.5 px-3">
                  <User className="w-4 h-4" />
                  <span>마이페이지</span>
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="primary" size="sm" className="min-h-[36px] px-4.5">
                  로그인
                </Button>
              </Link>
            </div>

            {/* 모바일 햄버거 토글 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-navy/60 hover:text-navy hover:bg-cream/40 rounded-full transition-colors focus:ring-2 focus:ring-gold/40 focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              aria-label="전체 메뉴 열기"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </Container>

        {/* 데스크톱 메가메뉴 패널 */}
        <DesktopMegaMenu
          isOpen={megaMenuOpen}
          activeMenu={activeMegaCategory}
          onClose={handleMegaMenuClose}
        />
      </header>

      {/* 모바일 서랍형 메뉴 오버레이 */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};
