import React, { useEffect } from "react";
import Link from "next/link";
import { X, Calendar, Sparkles, Moon, Heart, BookOpen, User, LogIn, ChevronRight } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  // 모바일 메뉴 열렸을 때 뒷배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const coreMenus = [
    { label: "오늘의 운세", href: "/today", icon: <Calendar className="w-5 h-5 text-gold" /> },
    { label: "정통 사주", href: "/saju", icon: <Calendar className="w-5 h-5 text-gold" /> },
    { label: "맞춤 궁합", href: "/compatibility", icon: <Heart className="w-5 h-5 text-gold" /> },
    { label: "AI 타로", href: "/tarot", icon: <Sparkles className="w-5 h-5 text-gold" /> },
    { label: "꿈해몽 사전", href: "/dreams", icon: <Moon className="w-5 h-5 text-gold" /> },
    { label: "운세백과", href: "/articles", icon: <BookOpen className="w-5 h-5 text-gold" /> },
  ];

  const infoMenus = [
    { label: "꿈과 운의 사전 소개", href: "/about" },
    { label: "만세력 계산 방법", href: "/methodology" },
    { label: "콘텐츠 편집 원칙", href: "/editorial-policy" },
    { label: "자주 묻는 질문(FAQ)", href: "/faq" },
    { label: "1:1 고객 문의", href: "/contact" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* 백드롭 */}
      <div
        className="fixed inset-0 bg-navy/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* 서랍형 컨텐츠 박스 (오른쪽에서 미끄러져 나옴) */}
      <div className="relative w-full max-w-[320px] h-full bg-surface shadow-2xl border-l border-brand-border/60 flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4.5 border-b border-brand-border">
          <Link href="/" onClick={onClose} className="font-serif text-lg font-bold text-navy tracking-tight">
            꿈과 운의 사전
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-navy/40 hover:text-navy hover:bg-cream/40 transition-colors focus:ring-2 focus:ring-gold/40 focus:outline-none min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            aria-label="메뉴 닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 바디 영역 스크롤 */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
          {/* 비로그인 프로필 영역 */}
          <div className="bg-cream/50 rounded-xl p-4.5 border border-brand-border flex items-center justify-between">
            <div>
              <p className="text-xs text-navy/55">나의 운세를 기록해보세요</p>
              <h4 className="text-sm font-bold text-navy mt-0.5">간편 로그인 후 이용하기</h4>
            </div>
            <Link
              href="/login"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-navy text-cream flex items-center justify-center hover:bg-gold transition-colors focus:ring-2 focus:ring-gold/50"
            >
              <LogIn className="w-4 h-4" />
            </Link>
          </div>

          {/* 핵심 서비스 리스트 */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-navy/40 uppercase tracking-wider pl-1">
              운세 서비스
            </h5>
            <ul className="space-y-1">
              {coreMenus.map((menu) => (
                <li key={menu.href}>
                  <Link
                    href={menu.href}
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-cream/35 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 text-navy font-bold text-base">
                      {menu.icon}
                      <span>{menu.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-navy/30 group-hover:text-gold transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-brand-border/60" />

          {/* 정보 안내 리스트 */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-navy/40 uppercase tracking-wider pl-1">
              안내 및 정보
            </h5>
            <ul className="space-y-1 pl-1">
              {infoMenus.map((menu) => (
                <li key={menu.href}>
                  <Link
                    href={menu.href}
                    onClick={onClose}
                    className="block py-2 text-sm font-medium text-navy/75 hover:text-gold transition-colors"
                  >
                    {menu.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 푸터 고정 영역 */}
        <div className="p-5 border-t border-brand-border bg-cream/20 flex items-center justify-between">
          <Link
            href="/my"
            onClick={onClose}
            className="flex items-center space-x-2 text-sm font-bold text-navy hover:text-gold"
          >
            <User className="w-4.5 h-4.5" />
            <span>마이페이지</span>
          </Link>
          <span className="text-xxs text-navy/40">v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
