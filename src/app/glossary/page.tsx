import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Book, HelpCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "명리 용어 사전 - 꿈과 운의 사전",
  description: "사주명리학에서 자주 쓰이는 오행, 십성, 일주, 절기 등 기초 개념의 정의와 설명 백과사전입니다."
};

export default async function GlossaryPage() {
  // published 상태의 glossary(용어) 데이터만 조회
  const glossaryList = await db.contents.findByType("glossary", "published");

  return (
    <div className="min-h-screen bg-cream text-navy py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 font-semibold">
        
        {/* 헤더 */}
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-navy flex items-center justify-center sm:justify-start gap-2">
            <Book className="w-8 h-8 text-gold" />
            <span>명리학 용어 사전</span>
          </h1>
          <p className="text-navy/60 text-sm leading-relaxed max-w-lg">
            사주 분석을 풀이할 때 나오는 난해한 전문 단어들을 알기 쉽게 일상적인 언어로 번역해 드립니다.
          </p>
        </div>

        {/* 용어 카드 리스트 */}
        {glossaryList.length === 0 ? (
          <div className="text-center py-12 text-navy/40 text-sm">
            등록된 용어 정의가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {glossaryList.map((term) => (
              <Link
                key={term.id}
                href={`/glossary/${term.slug}`}
                className="bg-white hover:bg-cream/15 border border-brand-border hover:border-gold/30 p-5 rounded-2xl transition flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
              >
                <div className="space-y-1.5">
                  <div className="text-[10px] text-navy/40 font-bold font-mono">
                    TERM GLOSSARY
                  </div>
                  <h3 className="text-lg font-bold text-navy hover:text-gold transition">
                    {term.title}
                  </h3>
                  <p className="text-xs text-navy/60 line-clamp-2 leading-relaxed">
                    {term.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-end text-xs text-gold font-bold pt-1 border-t border-brand-border/40">
                  <span className="flex items-center space-x-0.5">
                    <span>용어 정의 보기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
