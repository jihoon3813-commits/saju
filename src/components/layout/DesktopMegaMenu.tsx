import React from "react";
import Link from "next/link";
import { Sparkles, Moon, Calendar, Award } from "lucide-react";

interface DesktopMegaMenuProps {
  isOpen: boolean;
  activeMenu: string | null;
  onClose: () => void;
}

export const DesktopMegaMenu: React.FC<DesktopMegaMenuProps> = ({
  isOpen,
  activeMenu,
  onClose,
}) => {
  if (!isOpen || !activeMenu) return null;

  // 카테고리별 다단 구성 데이터
  const menuData: Record<
    string,
    {
      title: string;
      desc: string;
      icon: React.ReactNode;
      groups: {
        title: string;
        links: { label: string; href: string; desc?: string }[];
      }[];
    }
  > = {
    saju: {
      title: "정통 명리학 사주",
      desc: "수천 년 검증된 만세력 규칙과 십신 격국 분석을 통해 인생의 사계절을 읽습니다.",
      icon: <Calendar className="w-5 h-5 text-gold" />,
      groups: [
        {
          title: "개인 사주분석",
          links: [
            { label: "무료 만세력 조회", href: "/saju?type=manse", desc: "나의 여덟 글자와 오행 분포" },
            { label: "평생 사주 종합", href: "/saju?type=pyungsaeng", desc: "타고난 격국과 오행 비율" },
            { label: "10대 대운 흐름", href: "/saju?type=daewun", desc: "인생의 큰 전환기 타이밍" },
          ],
        },
        {
          title: "시기별 신수",
          links: [
            { label: "신년 신수 비결", href: "/saju?type=tojung", desc: "올해 일어날 주요 사건 예견" },
            { label: "월간 종합 운세", href: "/saju?type=monthly", desc: "달마다 변화하는 길흉화복" },
            { label: "오늘의 일진 상세", href: "/saju?type=today", desc: "가장 알맞은 행동 지침" },
          ],
        },
      ],
    },
    dreams: {
      title: "상징 꿈해몽 사전",
      desc: "무의식이 보내는 신호를 현대 심리 분석과 동양 길흉 철학으로 번역합니다.",
      icon: <Moon className="w-5 h-5 text-gold" />,
      groups: [
        {
          title: "인기 꿈 키워드",
          links: [
            { label: "동물 꿈 (용, 돼지, 뱀)", href: "/dreams", desc: "태몽과 권세를 부르는 꿈" },
            { label: "재물 꿈 (불, 똥, 물)", href: "/dreams", desc: "재수가 대통하는 대표 길몽" },
            { label: "인물 꿈 (부모, 귀인, 연인)", href: "/dreams", desc: "인간관계와 조력의 메시지" },
          ],
        },
        {
          title: "해몽 가이드",
          links: [
            { label: "길몽과 흉몽 구별법", href: "/articles", desc: "꿈의 느낌이 좌우하는 징조" },
            { label: "태몽의 상징물 해석", href: "/articles", desc: "아이의 기질을 나타내는 꿈" },
            { label: "심리 억압과 꿈의 관계", href: "/articles", desc: "스트레스가 유발하는 자각몽" },
          ],
        },
      ],
    },
    tarot: {
      title: "신비 타로 운세",
      desc: "78장의 아르카나 카드를 통해 당면한 고민의 무의식적 원인과 조언을 탐색합니다.",
      icon: <Sparkles className="w-5 h-5 text-gold" />,
      groups: [
        {
          title: "타로 스프레드",
          links: [
            { label: "원 카드 (One Card)", href: "/tarot", desc: "오늘 하루에 대한 원포인트 조언" },
            { label: "쓰리 카드 (과거/현재/미래)", href: "/tarot", desc: "문제 흐름의 종합적 진단" },
            { label: "켈틱 크로스 스프레드", href: "/tarot", desc: "복잡한 문제의 심층 다각도 분석" },
          ],
        },
        {
          title: "고민 상담소",
          links: [
            { label: "그 사람의 속마음", href: "/tarot", desc: "연애운과 관계의 실마리" },
            { label: "금전 이직의 양자택일", href: "/tarot", desc: "선택에 따른 예상 시나리오" },
          ],
        },
      ],
    },
  };

  const data = menuData[activeMenu];
  if (!data) return null;

  return (
    <div
      className="absolute left-0 w-full bg-surface border-b border-brand-border shadow-lg z-40 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      onMouseLeave={onClose}
    >
      <div className="max-w-[1200px] mx-auto px-8 py-8 grid grid-cols-12 gap-8">
        {/* 설명 영역 (좌측 4열) */}
        <div className="col-span-4 border-r border-brand-border/60 pr-8">
          <div className="flex items-center space-x-2.5 mb-3">
            <span className="p-2 rounded-lg bg-cream">{data.icon}</span>
            <h4 className="text-lg font-bold text-navy">{data.title}</h4>
          </div>
          <p className="text-sm text-navy/70 leading-relaxed mb-4">
            {data.desc}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gold font-semibold">
            <Award className="w-4 h-4" />
            <span>꿈과 운의 사전 전속 편집인 검증</span>
          </div>
        </div>

        {/* 링크 메뉴 목록 영역 (우측 8열) */}
        <div className="col-span-8 grid grid-cols-2 gap-8 pl-4">
          {data.groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-4">
              <h5 className="text-sm font-bold text-navy/40 tracking-wider uppercase">
                {group.title}
              </h5>
              <ul className="space-y-3">
                {group.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="block p-2 rounded-lg hover:bg-cream/40 transition-colors group"
                    >
                      <span className="block text-sm font-bold text-navy group-hover:text-gold transition-colors">
                        {link.label}
                      </span>
                      {link.desc && (
                        <span className="block text-xs text-navy/55 mt-0.5">
                          {link.desc}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
