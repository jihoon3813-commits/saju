import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Search, Sparkles, BookOpen, AlertCircle, HelpCircle, ArrowRight } from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";

interface DreamsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    symbol?: string;
  }>;
}

export async function generateMetadata({ searchParams }: DreamsPageProps) {
  const params = await searchParams;
  const hasFilter = params.q || params.category || params.symbol;

  return {
    title: "신비한 꿈해몽 사전 - 꿈과 운의 사전",
    description: "무의식이 보내는 신호를 정밀 해독하는 꿈해몽 사전입니다.",
    robots: hasFilter ? { index: false, follow: true } : { index: true, follow: true }
  };
}

const CATEGORIES = [
  { name: "전체", value: "" },
  { name: "동물", value: "동물" },
  { name: "사람", value: "사람" },
  { name: "자연", value: "자연" },
  { name: "물건", value: "물건" },
  { name: "장소", value: "장소" }
];

const POPULAR_KEYWORDS = ["뱀", "돼지", "불", "돈", "물", "죽은 사람"];

export default async function DreamsPage({ searchParams }: DreamsPageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "";
  const symbol = params.symbol || "";

  // 1. 검색어로 필터링하여 노출 (published 상태만 노출)
  let dreams = await db.contents.findByQuery({
    type: "dream",
    status: "published",
    searchTerm: q || symbol || undefined
  });

  // 카테고리 필터링 추가
  if (category) {
    dreams = dreams.filter((d) => d.category === category);
  }

  return (
    <div className="min-h-screen bg-cream text-navy py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 상단 소개 및 타이틀 */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-gold/10 border border-gold/20 text-gold rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>무의식이 보내는 정밀 암호 해독기</span>
          </div>
          <h1 className="text-4xl font-extrabold text-navy tracking-tight sm:text-5xl">
            신비한 꿈해몽 사전
          </h1>
          <p className="text-navy/60 text-sm max-w-lg mx-auto leading-relaxed font-semibold">
            길몽과 흉몽의 무분별한 맹신을 넘어, 심리적 불안과 기운의 흐름을 분석하는 과학적·현대적 해몽 공간입니다.
          </p>
        </div>

        {/* 통합 검색창 폼 */}
        <form method="GET" action="/dreams" className="bg-white border border-brand-border rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-4.5 w-5 h-5 text-navy/40" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="어젯밤 꿈의 내용을 입력하세요 (예: 뱀에게 물리는 꿈, 황금 돼지)"
              className="w-full bg-white border border-brand-border focus:border-gold rounded-2xl py-4 pl-12 pr-4 text-sm text-navy outline-none transition font-semibold"
            />
          </div>

          {/* 인기 검색 상징어 */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-navy/60 font-semibold">
            <span className="font-bold text-navy/40">인기 상징:</span>
            {POPULAR_KEYWORDS.map((k) => (
              <Link
                key={k}
                href={`/dreams?q=${encodeURIComponent(k)}`}
                className="px-2.5 py-1 bg-cream hover:bg-cream/70 border border-brand-border/60 rounded-lg transition"
              >
                #{k}
              </Link>
            ))}
          </div>
        </form>

        {/* 카테고리 필터 탭 */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.value;
            return (
              <Link
                key={cat.name}
                href={`/dreams?category=${cat.value}${q ? `&q=${q}` : ""}`}
                className={`px-4 py-2 text-xs font-bold rounded-full transition whitespace-nowrap border ${
                  isSelected
                    ? "bg-gold border-gold text-white"
                    : "bg-white border-brand-border text-navy/55 hover:text-navy"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* 검색 결과 리스트 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-brand-border pb-2">
            <span className="text-xs text-navy/50 font-bold">
              검색 결과 ({dreams.length}건)
            </span>
            {dreams.length > 0 && (
              <span className="text-[10px] text-navy/40 bg-white border border-brand-border px-2 py-0.5 rounded font-mono">
                noindex 적용 검색 결과
              </span>
            )}
          </div>

          {dreams.length === 0 ? (
            /* 결과 없음 뷰 */
            <div className="bg-white border border-brand-border rounded-3xl p-10 text-center space-y-6 shadow-sm">
              <div className="inline-flex p-4 bg-cream border border-brand-border text-navy/40 rounded-full">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2 font-semibold">
                <h3 className="text-lg font-bold text-navy">꿈해몽 일치 항목을 찾지 못했습니다</h3>
                <p className="text-xs text-navy/50 max-w-md mx-auto leading-relaxed">
                  동물명, 행동 혹은 감정어(예: &quot;뱀&quot;, &quot;피&quot;, &quot;도망&quot;) 등 간단한 명사 위주로 검색어를 변경해 보시기 바랍니다.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/dreams"
                  className="px-4 py-2 bg-white border border-brand-border text-navy/70 rounded-xl text-xs font-bold transition hover:bg-cream/40"
                >
                  필터 초기화
                </Link>
                <Link
                  href="/dreams/7-rules-of-dream-interpretation"
                  className="px-4 py-2 bg-gold/10 border border-gold/20 text-gold hover:bg-gold/15 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  <span>꿈 해석 가이드 읽기</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            /* 결과 카드 목록 */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dreams.map((d, index) => (
                <React.Fragment key={d.id}>
                  <Link
                    href={`/dreams/${d.slug}`}
                    className="bg-white hover:bg-cream/15 border border-brand-border hover:border-gold/30 rounded-3xl p-6 transition flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-2 font-semibold">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-2 py-0.5 bg-gold/10 border border-gold/20 text-gold rounded-full font-bold">
                          {d.category || "꿈 상징"}
                        </span>
                        {d.primarySymbol && (
                          <span className="text-xs text-navy/50 font-medium">
                            상징: {d.primarySymbol}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-navy group-hover:text-gold transition">
                        {d.title}
                      </h3>
                      <p className="text-xs text-navy/60 line-clamp-2 leading-relaxed">
                        {d.excerpt}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-brand-border/40 font-semibold">
                      {d.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-navy/40">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                  {/* 6번째 카드(index === 5) 다음에 인피드 광고 삽입 */}
                  {index === 5 && (
                    <div className="col-span-1 md:col-span-2">
                      <AdSlot slotKey="content_list_infeed" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* 하단 꿈해몽 대가이드 안내 */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="p-4 bg-gold/10 border border-gold/20 text-gold rounded-2xl shrink-0">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2 text-center sm:text-left font-semibold">
            <h3 className="text-lg font-bold text-navy">올바른 무의식 판별 독법</h3>
            <p className="text-xs text-navy/60 leading-relaxed max-w-lg">
              꿈에서 등장한 사물과 본인의 주관적인 감정, 그리고 출생 시간대의 조화 등을 대조해야 올바른 분석이 가능합니다. 7가지 핵심 원칙 칼럼을 읽어 보시는 것을 적극 권장합니다.
            </p>
            <Link 
              href="/dreams/7-rules-of-dream-interpretation" 
              className="inline-flex items-center space-x-1 text-xs text-gold hover:text-gold/90 font-bold transition pt-1"
            >
              <span>7가지 해석 가이드라인 전문 보기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
