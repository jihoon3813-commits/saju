"use client";

import React, { useState } from "react";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { 
  Sparkles, 
  Coffee, 
  Map, 
  Heart, 
  CheckCircle2, 
  Maximize2,
  Download,
  Image as ImageIcon
} from "lucide-react";

type TabType = "brand" | "company" | "bi";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<TabType>("bi");
  const breadcrumbs = [{ name: "브랜드 소개", path: "/about" }];

  const logoImages = [
    {
      title: "기본형 (Basic)",
      desc: "브랜드 아이덴티티를 대표하는 가장 표준적인 형태의 단선형 로고입니다.",
      url: "https://res.cloudinary.com/lyjyvy54/image/upload/v1784642722/120%ED%8C%8C%EC%9D%B4_%EC%BB%A4%ED%94%BC_%EA%B8%88%EC%A0%95%EC%A0%90_%EC%B1%84%EB%84%90%EC%82%AC%EC%9D%B8_%EB%94%94%EC%9E%90%EC%9D%B8_250828_j3kejm.png"
    },
    {
      title: "두줄가로형 (Two-line Horizontal)",
      desc: "공간 레이아웃이나 인쇄물 패키지에 적합하도록 배열을 가로로 최적화한 혼합형 로고입니다.",
      url: "https://res.cloudinary.com/lyjyvy54/image/upload/v1784730823/Group_1_6_cm1oeu.png"
    },
    {
      title: "심볼형 (Symbol)",
      desc: "파이와 커피 잔의 핵심 형태를 직관적으로 형상화하여 모바일 앱이나 패치 등으로 사용하기 적합한 단독형 심볼입니다.",
      url: "https://res.cloudinary.com/lyjyvy54/image/upload/v1784730823/120%ED%8C%8C%EC%9D%B4_%EC%BB%A4%ED%94%BC_%EA%B8%88%EC%A0%95%EC%A0%90_%EC%B1%84%EB%84%90%EC%82%AC%EC%9D%B8_%EB%94%94%EC%9E%90%EC%9D%B8_250828_5_eadptv.png"
    },
    {
      title: "두줄 심볼형 (Two-line Symbol)",
      desc: "가시성을 극대화하기 위해 심볼과 사명을 유기적인 2단 스택 구조로 결합한 시그니처 배지형 로고입니다.",
      url: "https://res.cloudinary.com/lyjyvy54/image/upload/v1784730823/Group_2_2_atzhmu.png"
    }
  ];

  const interiorImages = [
    {
      title: "Wood & Warmth",
      desc: "따뜻한 질감의 우드와 은은한 난색조 조명으로 고객에게 편안한 안식을 선사하는 메인 홀입니다.",
      url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600"
    },
    {
      title: "Modern Typography & Signage",
      desc: "시그니처 로고 타입과 메탈 악센트 벽면 디자인이 어우러져 세련된 도시적 감성을 연출합니다.",
      url: "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600"
    },
    {
      title: "Comfort Zone",
      desc: "오랜 시간 머물러도 피로하지 않도록 인체공학적 의자와 넉넉한 커뮤니티 테이블로 설계되었습니다.",
      url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=600"
    }
  ];

  return (
    <div className="bg-cream/20 min-h-screen pb-20">
      {/* 1. 비주얼 헤더 영역 */}
      <section className="relative h-[260px] md:h-[300px] w-full overflow-hidden bg-slate-950 text-white flex items-center">
        {/* 카페 인테리어 배경 그래픽 overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-35" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=1200')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
        
        <Container className="relative z-10 space-y-3 px-4">
          <span className="text-xxs md:text-xs font-bold text-gold uppercase tracking-widest block">
            {activeTab === "brand" ? "120PIE & COFFEE" : activeTab === "company" ? "CORPORATE IDENTITY" : "BRAND IDENTITY & INTERIOR SPACE DESIGN"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-white">
            {activeTab === "brand" ? "120PIE & COFFEE" : activeTab === "company" ? "기업 소개" : "BI & 인테리어"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
            {activeTab === "brand" 
              ? "120겹의 정성을 담은 시그니처 파이와 최고급 원두의 감동적인 조화" 
              : activeTab === "company" 
              ? "정직한 맛과 공간의 미학을 바탕으로 더 가치 있는 일상을 선물합니다" 
              : "따뜻함과 세련됨이 교차하는 프리미엄 공간 디자인 🥐"}
          </p>
        </Container>
      </section>

      {/* 2. 탭 제어 메뉴 */}
      <Container className="mt-8">
        <div className="flex justify-center border-b border-brand-border/60 pb-6">
          <div className="bg-white border border-brand-border p-1.5 rounded-2xl flex space-x-1 shadow-sm">
            {[
              { id: "brand", label: "120PIE & COFFEE" },
              { id: "company", label: "기업소개" },
              { id: "bi", label: "BI & 인테리어" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-gold text-navy shadow-sm"
                    : "bg-transparent text-navy/60 hover:text-navy"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Container>

      {/* 3. 탭별 상세 본문 콘텐츠 */}
      <Container className="mt-10 max-w-5xl px-4">
        
        {/* [TAB 3] BI & 인테리어 */}
        {activeTab === "bi" && (
          <div className="space-y-12 animate-fade-in">
            {/* 로고 카드 메인 그리드 */}
            <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-navy/55 flex items-center space-x-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-gold animate-spin-slow" />
                <span>Brand Logo System Specifications</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {logoImages.map((logo, idx) => (
                  <div 
                    key={idx} 
                    className="border border-brand-border/55 rounded-2xl p-5 bg-cream/10 space-y-4 hover:shadow-xs transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <span className="px-2.5 py-0.5 bg-gold/10 text-gold-dark text-[10px] font-bold rounded-full">
                        TYPE 0{idx + 1}
                      </span>
                      <h4 className="text-sm font-black text-navy">{logo.title}</h4>
                      <p className="text-xxs sm:text-xs text-navy/65 leading-relaxed">
                        {logo.desc}
                      </p>
                    </div>

                    {/* 로고 이미지 렌더링 박스 */}
                    <div className="w-full h-36 bg-white border border-brand-border/40 rounded-xl flex items-center justify-center p-6 relative overflow-hidden group">
                      <img 
                        src={logo.url} 
                        alt={logo.title} 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-navy/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <a 
                          href={logo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xxs font-bold flex items-center space-x-1.5 transition-colors"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>크게 보기</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BASIC SYSTEM 설명문 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                <h3 className="text-lg font-black tracking-wider font-mono text-navy">BASIC SYSTEM</h3>
              </div>
              <p className="text-xs sm:text-sm text-navy/80 leading-relaxed max-w-3xl font-medium">
                120PIE의 BI(brand identity)는 120겹의 정성이 깃든 수제 파이와 깊은 풍미의 로스팅 커피의 조화, 맛과 가격, 품질 등 모든 면에서 고급스럽게 더 솔직한 120PIE의 정신을 나타냅니다. 대한민국 No.1 디저트 카페 120PIE & COFFEE와 함께해 주세요!
              </p>
            </div>

            {/* SPACE DESIGN 설명문 및 쇼케이스 */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-6 bg-gold rounded-full" />
                <h3 className="text-lg font-black tracking-wider font-mono text-navy">INTERIOR SPACE DESIGN</h3>
              </div>
              
              <p className="text-xs sm:text-sm text-navy/80 leading-relaxed max-w-3xl font-medium">
                따뜻한 뉴트럴 톤의 샌드/머드 오가닉 팔레트와 도시적인 메탈릭 액센트를 결합하여, 바쁜 도시 생활 속에서 편안하게 맛있는 디저트를 즐길 수 있는 고급스러운 모던-클래식 카페 공간을 제안합니다.
              </p>

              {/* 인테리어 공간 이미지 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {interiorImages.map((space, idx) => (
                  <div key={idx} className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xs transition-shadow">
                    <div className="h-44 w-full overflow-hidden relative">
                      <img 
                        src={space.url} 
                        alt={space.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h4 className="text-xs font-black text-navy">{space.title}</h4>
                      <p className="text-[10px] text-navy/60 leading-normal">
                        {space.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* [TAB 1] 120PIE & COFFEE */}
        {activeTab === "brand" && (
          <div className="space-y-12 animate-fade-in">
            {/* 브랜드 특징 세션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <span className="text-gold text-xs font-black tracking-widest uppercase">Signature Concept</span>
                <h3 className="text-2xl font-bold font-serif text-navy leading-tight">
                  120겹의 극적 바삭함 속에<br />담아낸 건강한 한 끼 디저트
                </h3>
                <p className="text-xs sm:text-sm text-navy/70 leading-relaxed font-medium">
                  120PIE의 모든 파이는 엄선된 프랑스산 최고급 버터와 유기농 밀가루를 활용하여, 매일 아침 매장에서 정성스럽게 120겹을 직접 밀어 구워냅니다. 입안 가득 흩어지는 풍부한 결의 식감과 달콤한 원재료의 깊은 본연의 맛을 선사합니다.
                </p>
              </div>
              <div className="rounded-3xl overflow-hidden border border-brand-border shadow-md h-64 relative">
                <img 
                  src="https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=600" 
                  alt="Premium Bakery Pie" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 브랜드 주요 메뉴 소개 */}
            <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-navy/55 flex items-center space-x-1.5 uppercase tracking-wider">
                <Coffee className="w-4 h-4 text-gold" />
                <span>Our Signature Menu</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-cream/10 border border-brand-border/60 rounded-xl space-y-2">
                  <h4 className="text-xs font-black text-navy">Signature Croissant Pie</h4>
                  <p className="text-[10px] text-navy/60 leading-normal">천연 발효 버터로 완성된 120결의 에어리한 식감이 일품인 오리지널 쉘 파이</p>
                </div>
                <div className="p-4 bg-cream/10 border border-brand-border/60 rounded-xl space-y-2">
                  <h4 className="text-xs font-black text-navy">Apple Cinnamon Pie</h4>
                  <p className="text-[10px] text-navy/60 leading-normal">직접 졸인 상큼한 제철 사과 슬라이스와 시나몬 허브 향이 조화로운 클래식 애플 파이</p>
                </div>
                <div className="p-4 bg-cream/10 border border-brand-border/60 rounded-xl space-y-2">
                  <h4 className="text-xs font-black text-navy">Premium Custom Roasting Coffee</h4>
                  <p className="text-[10px] text-navy/60 leading-normal">달콤한 수제 파이의 풍미를 더욱 돋보이게 하는 에티오피아 및 브라질 산지별 커스텀 블렌딩 에스프레소</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* [TAB 2] 기업소개 */}
        {activeTab === "company" && (
          <div className="space-y-12 animate-fade-in">
            {/* 기업 가치 체계 */}
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-3 py-6">
                <span className="text-gold text-xs font-black tracking-widest uppercase">Our Mission</span>
                <h3 className="text-2xl font-bold font-serif text-navy">
                  “맛의 정직함과 아늑한 공간으로<br />일상의 소소한 가치를 제공합니다”
                </h3>
                <p className="text-xs text-navy/65 leading-relaxed">
                  (주)120파이코퍼레이션은 단순히 음료와 디저트를 파는 것을 넘어, 최상급 식자재로 빚어낸 정직한 식감과 편안한 쉼터를 통해 일상에 기분 좋은 활기를 충전해 주는 복합 공간 문화를 지향합니다.
                </p>
              </div>

              {/* 3대 핵심 가치 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm space-y-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <h4 className="text-sm font-bold text-navy">정직한 고집 (Honesty)</h4>
                  <p className="text-xs text-navy/70 leading-relaxed">마가린이나 인공 버터를 섞지 않고 100% 뉴질랜드/프랑스 천연 버터만을 고수해 120결의 솔직한 맛을 빚어냅니다.</p>
                </div>

                <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm space-y-3">
                  <CheckCircle2 className="w-6 h-6 text-gold" />
                  <h4 className="text-sm font-bold text-navy">따뜻한 연결 (Connection)</h4>
                  <p className="text-xs text-navy/70 leading-relaxed">지점별 바리스타의 숙련된 핸드드립과 온화한 인테리어 설계로 사람이 머무는 곳마다 온기를 이어갑니다.</p>
                </div>

                <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm space-y-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  <h4 className="text-sm font-bold text-navy">지속 가능 경영 (Sustainability)</h4>
                  <p className="text-xs text-navy/70 leading-relaxed">친환경 종이 패키지 도입 및 원두 공정무역 원칙 준수를 통해 사회적 책임을 성실히 수행합니다.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </Container>
    </div>
  );
}
