import React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { BookOpen, Sparkles, User, Calendar, ArrowRight } from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";

export const metadata = {
  title: "운세·명리 백과사전 - 꿈과 운의 사전",
  description: "사주명리 만세력 분석 원리부터 오행, 십성의 체계적 지식을 다루는 학술 콘텐츠 허브입니다."
};

export default async function ArticlesPage() {
  // published 상태의 일반 기사, 가이드, 정책 조회
  const all = await db.contents.findByQuery({ status: "published" });
  const articles = all.filter((c) => c.type !== "dream" && c.type !== "glossary");

  // 클러스터(주제군)별 그룹핑
  const clusterMap: Record<string, typeof articles> = {};
  for (const a of articles) {
    const cl = a.cluster || "기타 가이드";
    if (!clusterMap[cl]) {
      clusterMap[cl] = [];
    }
    clusterMap[cl].push(a);
  }

  return (
    <div className="min-h-screen bg-cream text-navy py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12 font-semibold">
        
         {/* 헤더 */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-gold/10 border border-gold/20 text-gold rounded-full text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>정통 학술 백과사전</span>
          </div>
          <h1 className="text-4xl font-extrabold text-navy tracking-tight sm:text-5xl">
            명리학 콘텐츠 허브
          </h1>
          <p className="text-navy/60 text-sm max-w-lg mx-auto leading-relaxed">
            시간의 입체 좌표를 계산하는 만세력 원리부터, 오행 및 십성의 현대적 사회 관계 조명까지 학문적 칼럼을 만나보세요.
          </p>
        </div>

        {/* 클러스터 목록 */}
        <div className="space-y-10">
          {Object.entries(clusterMap).map(([clusterName, list]) => (
            <div key={clusterName} className="space-y-4">
              <h2 className="text-lg font-bold text-navy flex items-center space-x-2 border-b border-brand-border pb-2">
                <span className="w-2 h-2 bg-gold rounded-full" />
                <span>{clusterName}</span>
                <span className="text-xs text-navy/40 font-normal">({list.length}편)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map((art) => (
                  <Link
                    key={art.id}
                    href={`/articles/${art.slug}`}
                    className="bg-white hover:bg-cream/15 border border-brand-border hover:border-gold/30 rounded-3xl p-6 transition flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 bg-cream border border-brand-border/60 text-navy/60 rounded-full">
                          {art.category || "칼럼"}
                        </span>
                        <span className="text-navy/40 font-mono">
                          Revision {art.revision}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-navy">
                        {art.title}
                      </h3>
                      <p className="text-xs text-navy/60 line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-brand-border/40 text-xs text-navy/40">
                      <span>{art.updatedAt.toISOString().split("T")[0]}</span>
                      <span className="text-gold font-bold hover:text-gold/90 transition flex items-center space-x-0.5">
                        <span>글 읽기</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 인피드 광고 슬롯 */}
        <AdSlot slotKey="content_list_infeed" />

      </div>
    </div>
  );
}
