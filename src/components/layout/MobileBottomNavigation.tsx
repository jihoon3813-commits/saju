"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Search, User } from "lucide-react";

export const MobileBottomNavigation: React.FC = () => {
  const pathname = usePathname();

  // 하단 4개 고정 메뉴 목록 정의
  const navItems = [
    { label: "홈", href: "/", icon: <Home className="w-5.5 h-5.5" /> },
    { label: "오늘", href: "/today", icon: <Calendar className="w-5.5 h-5.5" /> },
    { label: "검색", href: "/search", icon: <Search className="w-5.5 h-5.5" /> },
    { label: "마이", href: "/my", icon: <User className="w-5.5 h-5.5" /> },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-brand-border/60 shadow-lg px-2 pb-safe-bottom"
      aria-label="Mobile Navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] text-xs font-semibold transition-colors focus:outline-none ${
                isActive
                  ? "text-gold"
                  : "text-navy/50 hover:text-navy/85"
              }`}
            >
              <span className={`transition-transform duration-200 ${isActive ? "scale-105" : ""}`}>
                {item.icon}
              </span>
              <span className="mt-1 tracking-tight text-[10px] sm:text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
