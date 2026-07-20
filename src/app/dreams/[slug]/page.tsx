import React from "react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  Activity, 
  BookOpen, 
  UserCheck, 
  Calendar, 
  Compass, 
  AlertTriangle 
} from "lucide-react";
import { AdSlot } from "@/components/ads/AdSlot";

interface DreamDetailPageProps {
  params: Promise<{ slug: string }>;
}

// 1. 동적 SEO 메타데이터 바인딩
export async function generateMetadata({ params }: DreamDetailPageProps) {
  const { slug } = await params;
  const content = await db.contents.findBySlug(slug);

  if (!content || (content.type !== "dream" && content.type !== "guide")) {
    return {
      title: "존재하지 않는 페이지 - 꿈과 운의 사전"
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: `${content.metaTitle || content.title} - 꿈과 운의 사전`,
    description: content.metaDescription || content.excerpt,
    alternates: {
      canonical: `${siteUrl}/dreams/${content.slug}`
    },
    robots: content.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: content.metaTitle || content.title,
      description: content.metaDescription || content.excerpt,
      url: `${siteUrl}/dreams/${content.slug}`,
      images: content.ogImage ? [{ url: content.ogImage }] : []
    }
  };
}

export default async function DreamDetailPage({ params }: DreamDetailPageProps) {
  const { slug } = await params;
  const content = await db.contents.findBySlug(slug);

  // published 상태의 꿈해몽 및 가이드 글 노출
  if (!content || (content.type !== "dream" && content.type !== "guide") || content.status !== "published") {
    notFound();
  }

  const author = await db.authors.findById(content.authorId);
  const reviewer = content.reviewerId ? await db.authors.findById(content.reviewerId) : null;

  // 관련 꿈 3개 추천 (동일 카테고리 내 타 꿈)
  const allContents = await db.contents.findByQuery({ type: "dream", status: "published" });
  const relatedDreams = allContents
    .filter((c) => c.id !== content.id && c.category === content.category)
    .slice(0, 3);

  // FAQ mock 데이터 생성 (본문 혹은 메타 기준 조율)
  const faqs = [
    {
      q: `${content.primarySymbol || "상징"} 꿈은 무조건 현실에서 실현되나요?`,
      a: "꿈의 선명도가 높고 깬 후 기분이 상쾌했다면 3일 내에 현실적인 기회로 실현될 가능성이 큽니다. 단순한 스트레스성 잔상인 경우는 실현되지 않습니다."
    },
    {
      q: `꿈속에서 느낀 감정이 왜 중요하나요?`,
      a: "전통 꿈해몽에서 가장 중요한 척도는 감정입니다. 아무리 좋은 돼지나 불이 나왔더라도 기분이 나빴거나 무서웠다면 결과가 와전되어 걱정거리가 되는 흉몽이 될 수 있습니다."
    },
    {
      q: `이 꿈과 내 사주 오행은 어떤 관계가 있나요?`,
      a: "특정 원초 상징(예: 불, 물)은 자신의 사주 원국에서 결핍되었거나 과다한 오행 기운의 보충 열망일 수 있습니다. 무료 사주 도구를 통해 확인해 보세요."
    }
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // 2. 구조화 데이터(JSON-LD) 생성
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "홈",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "꿈해몽 사전",
        "item": `${siteUrl}/dreams`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": content.category || "상징",
        "item": `${siteUrl}/dreams?category=${encodeURIComponent(content.category || "")}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": content.title,
        "item": `${siteUrl}/dreams/${content.slug}`
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": content.title,
    "description": content.excerpt,
    "image": content.ogImage || `${siteUrl}/og-default.png`,
    "datePublished": content.publishedAt || content.createdAt,
    "dateModified": content.updatedAt,
    "author": {
      "@type": "Person",
      "name": author?.name || "전문가 에디터"
    },
    "publisher": {
      "@type": "Organization",
      "name": "꿈과 운의 사전",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  // 본문 HTML 문단 분사 처리
  const paragraphs = content.body.split("</p>").filter(p => p.trim() !== "");
  const total = paragraphs.length;
  const upperIndex = total > 2 ? Math.floor(total * 0.3) : -1;
  const lowerIndex = total > 4 ? Math.floor(total * 0.7) : -1;

  return (
    <div className="min-h-screen bg-cream text-navy py-12 px-4 sm:px-6 lg:px-8">
      
      {/* JSON-LD 구조화 데이터 주입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 font-semibold">
        
        {/* 본문 열 (8열) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 상단 브레드크럼 */}
          <nav className="text-xs text-navy/40 flex items-center space-x-2">
            <Link href="/dreams" className="hover:text-gold transition">꿈해몽 홈</Link>
            <span>/</span>
            {content.category && (
              <>
                <Link href={`/dreams?category=${encodeURIComponent(content.category)}`} className="hover:text-gold transition">
                  {content.category}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-navy/60 truncate">{content.title}</span>
          </nav>

          {/* 1. 글 제목 및 집필진 소개 헤더 */}
          <div className="space-y-4 border-b border-brand-border pb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy leading-tight">
              {content.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-navy/55">
              {author && (
                <div className="flex items-center space-x-1.5">
                  <UserCheck className="w-4 h-4 text-gold" />
                  <span>작성: <strong>{author.name}</strong> ({author.role})</span>
                </div>
              )}
              {reviewer && (
                <div className="flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>감수: <strong>{reviewer.name}</strong></span>
                </div>
              )}
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-navy/40" />
                <span>수정일: {content.updatedAt.toISOString().split("T")[0]}</span>
              </div>
            </div>
          </div>

          {/* 2. 질문에 대한 2~3문장 요약 */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 flex items-start space-x-4 shadow-sm">
            <div className="p-3 bg-gold/10 border border-gold/20 text-gold rounded-2xl shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-navy">핵심 요점 요약</h3>
              <p className="text-xs sm:text-sm text-navy/65 leading-relaxed italic">
                &quot;{content.excerpt}&quot;
              </p>
            </div>
          </div>

          {/* 3. 의미가 달라지는 핵심 변수 */}
          {content.primarySymbol && (
            <div className="bg-cream/40 border border-brand-border rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-navy flex items-center space-x-1.5">
                <Activity className="w-4.5 h-4.5 text-gold" />
                <span>상징 대칭 지표</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-white border border-brand-border/60 rounded-2xl text-center space-y-0.5 shadow-sm">
                  <div className="text-[10px] text-navy/45 font-semibold">핵심 상징</div>
                  <div className="text-xs font-extrabold text-navy">{content.primarySymbol}</div>
                </div>
                <div className="p-3 bg-white border border-brand-border/60 rounded-2xl text-center space-y-0.5 shadow-sm">
                  <div className="text-[10px] text-navy/45 font-semibold">대표 행동</div>
                  <div className="text-xs font-extrabold text-navy">{content.action || "미상"}</div>
                </div>
                <div className="p-3 bg-white border border-brand-border/60 rounded-2xl text-center space-y-0.5 shadow-sm">
                  <div className="text-[10px] text-navy/45 font-semibold">꿈속 감정</div>
                  <div className="text-xs font-extrabold text-navy">{content.emotion || "미상"}</div>
                </div>
                <div className="p-3 bg-white border border-brand-border/60 rounded-2xl text-center space-y-0.5 shadow-sm">
                  <div className="text-[10px] text-navy/45 font-semibold">장소 설정</div>
                  <div className="text-xs font-extrabold text-navy">{content.setting || "미상"}</div>
                </div>
              </div>
            </div>
          )}

          {/* 4. 상황별 해석 본문 (HTML 분할 광고 삽입) */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold text-navy flex items-center space-x-2 border-b border-brand-border pb-3">
              <span className="w-1.5 h-1.5 bg-gold rounded-full" />
              <span>상황별 심층 풀이</span>
            </h3>
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
          </div>

          {/* 5. 긍정적 의미 & 주의해서 볼 의미 */}
          {(content.positiveInterpretation || content.cautionInterpretation) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.positiveInterpretation && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 space-y-2">
                  <h4 className="text-xs font-extrabold text-emerald-600 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>이 꿈이 지닌 긍정적 기운</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-navy/80 leading-relaxed">
                    {content.positiveInterpretation}
                  </p>
                </div>
              )}
              
              {content.cautionInterpretation && (
                <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 space-y-2">
                  <h4 className="text-xs font-extrabold text-amber-600 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>현실에서 조심할 경고</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-navy/80 leading-relaxed">
                    {content.cautionInterpretation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 6. 현실에서 확인할 질문 (독자 성찰 질문) */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 space-y-3 shadow-sm">
            <h3 className="text-xs font-extrabold text-navy/50 uppercase tracking-wider">
              현실에서 자문해 볼 3가지 성찰
            </h3>
            <ul className="text-xs sm:text-sm text-navy/85 space-y-2 list-disc pl-5 leading-relaxed">
              <li>꿈에서 깬 직후 몸의 피로도나 신경성 스트레스 지수가 높았는가?</li>
              <li>최근 대인관계 혹은 비즈니스에서 약속한 서명/날인이 예정되어 있는가?</li>
              <li>원하는 성취의 조바심 때문에 스스로를 지나치게 압박하지 않았는가?</li>
            </ul>
          </div>

          {/* 8. FAQ 3~5개 */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-navy flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-gold" />
              <span>자주 묻는 질문 (FAQ)</span>
            </h3>
            <div className="space-y-4 divide-y divide-brand-border/60">
              {faqs.map((faq, idx) => (
                <div key={idx} className={`${idx > 0 ? "pt-4" : ""} space-y-1.5`}>
                  <div className="text-xs sm:text-sm font-bold text-navy flex items-start space-x-1.5">
                    <span className="text-gold">Q.</span>
                    <span>{faq.q}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-navy/60 pl-4 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 10. 관련 무료 도구 1개 연결 */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-lg font-extrabold text-navy">내 사주 원국의 오행 균형 측정하기</h3>
              <p className="text-xs text-navy/60 max-w-md leading-relaxed">
                꿈속 상징은 내 사주팔자 오행의 결핍/과다 작용과 긴밀히 통합니다. 무료 천문 만세력을 통해 오행의 치우침을 분석해 보세요.
              </p>
            </div>
            <Link
              href="/fortune/input"
              className="px-5 py-3 bg-gold hover:bg-gold/95 text-white rounded-2xl font-bold transition text-xs sm:text-sm flex items-center space-x-1 shrink-0 shadow-sm"
            >
              <span>무료 만세력 조회하기</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 9. 관련 꿈 3개 추천 */}
          {relatedDreams.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-navy/55 uppercase tracking-wider">
                동일 상징군 연관 꿈 추천
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedDreams.map((d) => (
                  <Link
                    key={d.id}
                    href={`/dreams/${d.slug}`}
                    className="bg-white hover:bg-cream/15 border border-brand-border rounded-2xl p-4 flex flex-col justify-between h-32 transition shadow-sm"
                  >
                    <h4 className="text-xs font-bold text-navy line-clamp-2 hover:text-gold transition">
                      {d.title}
                    </h4>
                    <span className="text-[10px] text-navy/45">
                      상징: {d.primarySymbol || "동일 상징군"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* 사이드바 열 (4열 - PC에선 스티키 우측 고정, 모바일에선 하단 배치) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-6 space-y-6">
            {author && (
              <div className="bg-white border border-brand-border p-5 rounded-3xl space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-navy/40 uppercase tracking-widest">분석가 소개</h4>
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
