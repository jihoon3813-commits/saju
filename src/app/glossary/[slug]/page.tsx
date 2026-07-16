import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Book, 
  UserCheck, 
  Calendar, 
  Compass, 
  ArrowRight 
} from "lucide-react";

interface GlossaryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GlossaryDetailPageProps) {
  const { slug } = await params;
  const content = await db.contents.findBySlug(slug);

  if (!content || content.type !== "glossary") {
    return {
      title: "존재하지 않는 페이지 - 꿈과 운의 사전"
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: `${content.metaTitle || content.title} 정의 및 어원 - 꿈과 운의 사전`,
    description: content.metaDescription || content.excerpt,
    alternates: {
      canonical: `${siteUrl}/glossary/${content.slug}`
    },
    robots: content.noindex ? { index: false, follow: true } : { index: true, follow: true }
  };
}

export default async function GlossaryDetailPage({ params }: GlossaryDetailPageProps) {
  const { slug } = await params;
  const content = await db.contents.findBySlug(slug);

  if (!content || content.type !== "glossary" || content.status !== "published") {
    notFound();
  }

  const author = await db.authors.findById(content.authorId);
  const reviewer = content.reviewerId ? await db.authors.findById(content.reviewerId) : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // DefinedTerm 및 BreadcrumbList 스키마 정의
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "홈", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "용어사전", "item": `${siteUrl}/glossary` },
      { "@type": "ListItem", "position": 3, "name": content.title, "item": `${siteUrl}/glossary/${content.slug}` }
    ]
  };

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": content.title,
    "description": content.excerpt,
    "inDefinedTermSet": `${siteUrl}/glossary`
  };

  return (
    <div className="min-h-screen bg-cream text-navy py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
      />

      <div className="max-w-3xl mx-auto space-y-8 font-semibold">
        
        {/* 백버튼 */}
        <Link href="/glossary" className="inline-flex items-center space-x-1.5 text-xs text-navy/50 hover:text-gold transition font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>사전 홈으로</span>
        </Link>

        {/* 용어 헤더 */}
        <div className="space-y-4 border-b border-brand-border pb-6">
          <div className="text-[10px] text-gold font-extrabold uppercase tracking-wider font-mono">
            DEFINED TERM DICTIONARY
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy flex items-center gap-2">
            <Book className="w-8 h-8 text-gold" />
            <span>{content.title}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-navy/55">
            {author && (
              <span className="flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-gold" />
                <span>집필: <strong>{author.name}</strong> ({author.role})</span>
              </span>
            )}
            {reviewer && (
              <span className="flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>감수: <strong>{reviewer.name}</strong></span>
              </span>
            )}
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-navy/40" />
              <span>최종 수정: {content.updatedAt.toISOString().split("T")[0]}</span>
            </span>
          </div>
        </div>

        {/* 사전식 핵심 정의 요약 */}
        <div className="bg-white border border-brand-border p-6 rounded-3xl space-y-2 shadow-sm">
          <div className="text-xs font-bold text-gold">학문적 정의 요약</div>
          <p className="text-xs sm:text-sm text-navy/70 leading-relaxed italic">
            &quot;{content.excerpt}&quot;
          </p>
        </div>

        {/* 해설 상세 */}
        <article 
          className="prose prose-slate max-w-none text-navy/80 leading-relaxed text-sm sm:text-base space-y-4 font-semibold"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />

        {/* 관련 툴 연결 */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-navy">내 사주에서 {content.title} 대입해보기</h3>
            <p className="text-xs text-navy/60 leading-relaxed max-w-sm">
              정밀 계산 엔진으로 계산된 사주 원국에서 {content.title}의 분포와 흐름을 직접 관측해 보십시오.
            </p>
          </div>
          <Link
            href="/fortune/input"
            className="px-4 py-2.5 bg-gold hover:bg-gold/95 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 shrink-0 shadow-sm"
          >
            <span>무료 사주 분석하러가기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
