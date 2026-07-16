import React from "react";
import Link from "next/link";
import { Container } from "./Container";

export const Footer: React.FC = () => {
  const footerGroups = [
    {
      title: "서비스 전체",
      links: [
        { label: "오늘의 운세", href: "/today" },
        { label: "정통 사주", href: "/saju" },
        { label: "맞춤 궁합", href: "/compatibility" },
        { label: "AI 신비 타로", href: "/tarot" },
      ],
    },
    {
      title: "콘텐츠 사전",
      links: [
        { label: "꿈해몽 사전", href: "/dreams" },
        { label: "운세백과 정보", href: "/articles" },
        { label: "자주 묻는 질문", href: "/faq" },
      ],
    },
    {
      title: "정책 및 원칙",
      links: [
        { label: "만세력 계산 방법", href: "/methodology" },
        { label: "콘텐츠 편집 원칙", href: "/editorial-policy" },
        { label: "서비스 소개(About)", href: "/about" },
        { label: "1:1 문의 채널", href: "/contact" },
      ],
    },
  ];

  const legalLinks = [
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy", isHighlight: true },
    { label: "광고·쿠키 안내", href: "/cookies" },
    { label: "관리자 센터", href: "/admin" },
  ];

  return (
    <footer className="w-full bg-navy text-cream/70 border-t border-brand-border/10 mt-auto pt-12 pb-24 md:pb-12 text-sm">
      <Container className="space-y-10">
        {/* 상단 사이트 맵 링크 그룹 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="block">
              <img 
                src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1784171074/Image_2_csmzku.png" 
                alt="꿈과 운의 사전" 
                className="h-8 w-auto object-contain brightness-0 invert" 
              />
            </Link>
            <p className="text-xs text-cream/50 leading-relaxed max-w-[200px]">
              수천 년 쌓인 명리학 공식과 최신 인공지능 해설을 융합한 동양 철학 프리미엄 매거진.
            </p>
          </div>
          
          {footerGroups.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-bold text-cream/35 uppercase tracking-widest">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      className="text-xs text-cream/70 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="border-cream/10" />

        {/* 하단 법적 규제 안내 및 가상 주소 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 text-xs text-cream/45 leading-relaxed">
            <p>© 2026 꿈과 운의 사전. All Rights Reserved.</p>
            <p>
              (주)꿈과운의사전 | 대표이사: 홍길동 | 서울특별시 강남구 테헤란로 123 | 사업자등록번호: 120-00-00000
            </p>
            <p className="text-[10px] text-cream/30">
              * 본 서비스에서 제공하는 운세 결과는 정통 명리학에 기반하되 삶의 참고용 정보로 활용해 주시기 바라며, 의료, 법률, 투자 등 전문 분야의 조언을 대신하지 않습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {legalLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className={`hover:underline ${
                  link.isHighlight ? "text-gold font-bold" : "text-cream/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
};
