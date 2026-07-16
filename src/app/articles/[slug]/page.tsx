import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  UserCheck, 
  Calendar, 
  Sparkles, 
  BookOpen,
  ArrowRight,
  Compass
} from "lucide-react";

import { AdSlot } from "@/components/ads/AdSlot";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const content = await db.contents.findBySlug(slug);

  if (!content) {
    // 클러스터 매칭 여부 체크
    const all = await db.contents.findByQuery({ status: "published" });
    const isCluster = all.some(
      (c) => c.cluster?.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
    );

    if (isCluster) {
      return {
        title: `${slug} 관련 글 목록 - 꿈과 운의 사전`
      };
    }

    return { title: "존재하지 않는 페이지 - 꿈과 운의 사전" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: `${content.metaTitle || content.title} - 꿈과 운의 사전`,
    description: content.metaDescription || content.excerpt,
    alternates: {
      canonical: `${siteUrl}/articles/${content.slug}`
    },
    robots: content.noindex ? { index: false, follow: true } : { index: true, follow: true }
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;

  // 1. 단일 아티클 슬러그 조회
  const content = await db.contents.findBySlug(slug);

  // 2. 만약 단일 글이 발견되지 않았다면, 혹시 클러스터(주제 그룹) 카테고리 진입인지 교차 검증
  if (!content) {
    const allPublished = await db.contents.findByQuery({ status: "published" });
    const clusterArticles = allPublished.filter(
      (c) => c.cluster && c.cluster.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
    );

    if (clusterArticles.length === 0) {
      notFound();
    }

    const clusterRealName = clusterArticles[0].cluster || slug;

    // 클러스터 카테고리 지면 렌더링
    return (
      <div className="min-h-screen bg-cream text-navy py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8 font-semibold">
          <Link href="/articles" className="inline-flex items-center space-x-1.5 text-xs text-gold hover:text-gold/90 font-bold transition">
            <ArrowLeft className="w-4 h-4 text-gold" />
            <span>백과사전 홈으로</span>
          </Link>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-navy">{clusterRealName} 주제군</h1>
            <p className="text-xs text-navy/50">총 {clusterArticles.length}편의 연계 깊이 있는 기사 목록</p>
          </div>

          <div className="space-y-4">
            {clusterArticles.map((art) => (
              <Link
                key={art.id}
                href={`/articles/${art.slug}`}
                className="block bg-white border border-brand-border hover:border-gold/30 p-6 rounded-2xl transition space-y-2 shadow-sm hover:shadow-md"
              >
                <h3 className="font-bold text-navy text-lg hover:text-gold transition">{art.title}</h3>
                <p className="text-xs text-navy/60 leading-relaxed">{art.excerpt}</p>
                <div className="text-[10px] text-navy/40 pt-1">최종 업데이트: {art.updatedAt.toISOString().split("T")[0]}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. 단일 아티클 세부 정보 노출 (published 상태 한정)
  if (content.status !== "published") {
    notFound();
  }

  const author = await db.authors.findById(content.authorId);
  const reviewer = content.reviewerId ? await db.authors.findById(content.reviewerId) : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // 구조화 데이터
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "홈", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "운세백과", "item": `${siteUrl}/articles` },
      { "@type": "ListItem", "position": 3, "name": content.title, "item": `${siteUrl}/articles/${content.slug}` }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": content.title,
    "description": content.excerpt,
    "datePublished": content.publishedAt || content.createdAt,
    "dateModified": content.updatedAt,
    "author": {
      "@type": "Person",
      "name": author?.name || "전문 에디터"
    }
  };

  // 본문 HTML 문단 분사 처리
  const paragraphs = content.body.split("</p>").filter(p => p.trim() !== "");
  const total = paragraphs.length;
  const upperIndex = total > 2 ? Math.floor(total * 0.3) : -1;
  const lowerIndex = total > 4 ? Math.floor(total * 0.7) : -1;

  return (
    <div className="min-h-screen bg-cream text-navy py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 font-semibold">
        
        {/* 본문 열 (8열) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 뒤로가기 */}
          <Link href="/articles" className="inline-flex items-center space-x-1.5 text-xs text-navy/50 hover:text-gold transition font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>아티클 리스트로</span>
          </Link>

          {/* 상단 기사 소개 */}
          <div className="space-y-4 border-b border-brand-border pb-6">
            <div className="flex flex-wrap gap-2">
              {content.cluster && (
                <span className="px-2.5 py-0.5 bg-cream border border-brand-border text-navy/55 text-[10px] font-bold rounded-full">
                  {content.cluster}
                </span>
              )}
              {content.category && (
                <span className="px-2.5 py-0.5 bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold rounded-full">
                  {content.category}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy leading-tight">
              {content.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-navy/55 pt-1">
              {author && (
                <span className="flex items-center space-x-1.5">
                  <UserCheck className="w-4 h-4 text-gold" />
                  <span>글쓴이: <strong>{author.name}</strong> ({author.role})</span>
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
                <span>작성일: {content.updatedAt.toISOString().split("T")[0]}</span>
              </span>
            </div>
          </div>

          {/* 요약 */}
          <div className="bg-white border border-brand-border p-6 rounded-3xl text-sm text-navy/65 leading-relaxed italic shadow-sm">
            요약: &quot;{content.excerpt}&quot;
          </div>

          {/* 기사 본문 (광고 슬롯 분사) */}
          <article className="prose prose-slate max-w-none text-navy/80 leading-relaxed text-sm sm:text-base space-y-4 font-semibold">
            {paragraphs.map((p, index) => {
              const html = p + "</p>";
              return (
                <React.Fragment key={index}>
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                  {index === upperIndex && (
                    <AdSlot slotKey="content_detail_upper" />
                  )}
                  {index === lowerIndex && (
                    <AdSlot slotKey="content_detail_lower" />
                  )}
                </React.Fragment>
              );
            })}
          </article>

          {/* 무료 도구 결합 카드 */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-navy">무료 천문 만세력 계산기</h3>
              <p className="text-xs text-navy/60 leading-relaxed max-w-sm">
                내 출생년월일시 절기를 대입해 정확한 사주 오행 분포도를 1초 만에 확인해 보세요.
              </p>
            </div>
            <Link
              href="/fortune/input"
              className="px-4 py-2.5 bg-gold hover:bg-gold/95 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 shrink-0 shadow-sm"
            >
              <span>만세력 측정기 이동</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 사이드바 열 (4열 - PC에선 스티키 우측 고정, 모바일에선 하단 배치) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-6 space-y-6">
            {author && (
              <div className="bg-white border border-brand-border p-5 rounded-3xl space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-navy/40 uppercase tracking-widest">글쓴이 소개</h4>
                <div className="flex items-center space-x-3">
                  {author.avatarUrl && (
                    <img src={author.avatarUrl} alt={author.name} className="w-10 h-10 rounded-full border border-brand-border" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-navy">{author.name}</div>
                    <div className="text-xxs text-gold font-medium">{author.role}</div>
                  </div>
                </div>
                {author.bio && (
                  <p className="text-xs text-navy/60 leading-normal">{author.bio}</p>
                )}
              </div>
            )}
            
            {/* 사이드바 광고 슬롯 마운트 */}
            <AdSlot slotKey="content_detail_sidebar" />
          </div>
        </div>

      </div>
    </div>
  );
}
