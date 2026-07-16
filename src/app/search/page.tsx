"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Search, Sparkles, BookOpen, FileText, Compass, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { unifiedSearchAction, SearchResultItem } from "@/app/actions/search";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const breadcrumbs = [{ name: "통합 검색", path: "/search" }];

  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 검색 트리거 함수
  const triggerSearch = async (val: string) => {
    const term = val.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    const res = await unifiedSearchAction(term);
    setLoading(false);

    if (res.success) {
      setResults(res.results);
    } else {
      setError(res.error || "검색 중 알 수 없는 시스템 오류가 발생했습니다.");
    }
  };

  // 마운트 시 쿼리 파라미터 체크 연동
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      triggerSearch(initialQuery);
    }
  }, [initialQuery]);


  // 실시간 디바운스 검색 (사용자 편의성 제고)
  useEffect(() => {
    const handler = setTimeout(() => {
      triggerSearch(query);
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  // 검색 카테고리별 필터링 연산
  const services = results.filter((r) => r.type === "service");
  const dreams = results.filter((r) => r.type === "dream");
  const glossaries = results.filter((r) => r.type === "glossary");
  const articles = results.filter((r) => r.type === "article");

  // 결과 아이템 타입에 따른 아이콘 매칭
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "service":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold/15 text-gold border border-gold/30">
            <Compass className="w-3 h-3" />
            <span>운세 서비스</span>
          </span>
        );
      case "dream":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Sparkles className="w-3 h-3" />
            <span>꿈해몽 백과</span>
          </span>
        );
      case "glossary":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-navy/70 border border-brand-border">
            <BookOpen className="w-3 h-3" />
            <span>운세 용어집</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100">
            <FileText className="w-3 h-3" />
            <span>매거진·칼럼</span>
          </span>
        );
    }
  };

  return (
    <Container className="py-8 space-y-6 animate-fade-in">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-3xl mx-auto space-y-8 py-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-navy flex items-center justify-center space-x-2.5">
            <Search className="w-7 h-7 text-gold animate-pulse" />
            <span>꿈과 운의 통합 검색</span>
          </h1>
          <p className="text-xs text-navy/60 font-medium">
            꿈해몽 대사전, 사주 십신 용어, 프리미엄 운세 서비스를 한 번에 검색해 보세요.
          </p>
        </div>

        {/* 큰 검색바 지면 */}
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="궁금한 내용을 최소 2자 이상 입력하세요. 예: 이직, 태몽, 금전운..."
              className="w-full px-5 py-3.5 text-sm text-navy border border-brand-border rounded-2xl bg-white focus:outline-none focus:ring-1 focus:ring-gold/60 transition-all font-semibold"
            />
            {loading && (
              <div className="absolute right-4 top-4">
                <RefreshCw className="w-4 h-4 text-navy/40 animate-spin" />
              </div>
            )}
          </div>
          <Button
            variant="primary"
            onClick={() => triggerSearch(query)}
            className="px-6 font-bold bg-gold hover:bg-gold/95 text-white rounded-2xl min-h-[48px]"
          >
            검색
          </Button>
        </div>

        {/* 에러 피드백 */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-600 text-xs font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* 결과 표시 지면 */}
        {query.trim().length >= 2 && !loading && (
          <div className="space-y-6">
            <div className="text-xs text-navy/50 font-bold border-b border-brand-border pb-2 flex justify-between">
              <span>총 <span className="text-gold font-mono">{results.length}</span>개의 매칭 항목</span>
              <span>최대 50개까지 제공</span>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 bg-cream/20 border border-brand-border text-xs text-navy/40 rounded-2xl font-semibold">
                “{query}”에 대한 매칭 결과가 없습니다. 다른 검색어를 입력해 주세요.
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((item, idx) => (
                  <Link href={item.path} key={idx} className="block group select-none">
                    <div className="bg-white border border-brand-border group-hover:border-gold/40 hover:bg-cream/10 p-5 rounded-2xl transition-all space-y-2 shadow-sm">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-navy group-hover:text-gold transition-all">
                          {item.title}
                        </h4>
                        {getTypeBadge(item.type)}
                      </div>
                      <p className="text-xs text-navy/60 leading-relaxed line-clamp-2 font-medium">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 검색 팁 가이드 */}
        {query.trim().length < 2 && (
          <div className="bg-cream/40 border border-brand-border rounded-2xl p-5 text-xs text-navy/70 space-y-3 font-medium">
            <h4 className="font-bold text-navy flex items-center space-x-1.5">
              <span className="w-1 h-3 bg-gold rounded-full inline-block"></span>
              <span>💡 효율적인 검색 가이드</span>
            </h4>
            <ul className="list-disc list-inside space-y-1.5 pl-1 leading-relaxed">
              <li>명사나 키워드 상징 위주로 단어를 짧게 입력해보세요. (예: <span className="text-navy font-bold font-mono">"뱀"</span>, <span className="text-navy font-bold font-mono">"용희신"</span>, <span className="text-navy font-bold font-mono">"재물"</span>)</li>
              <li>꿈해몽의 경우 행동과 인물을 조합하여 검색하면 용이합니다. (예: <span className="text-navy font-bold font-mono">"개에게 물리다"</span>)</li>
              <li>용어집의 경우 특정 신살이나 신성(예: <span className="text-navy font-bold font-mono">"역마살"</span>, <span className="text-navy font-bold font-mono">"비견"</span>)을 바로 찾아 해석을 읽을 수 있습니다.</li>
            </ul>
          </div>
        )}
      </div>
    </Container>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-8 space-y-6">
          <div className="max-w-3xl mx-auto text-center py-20 text-navy/40 text-sm animate-pulse font-medium">
            검색 결과 로딩 대기 중...
          </div>
        </Container>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
