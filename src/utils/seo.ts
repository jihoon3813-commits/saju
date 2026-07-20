import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dreamfortune.com";

interface MetadataParams {
  title: string;
  description: string;
  canonicalPath: string;
  noindex?: boolean;
}

/**
 * Next.js App Router용 메타데이터 생성 헬퍼 함수
 */
export function getMetadata({
  title,
  description,
  canonicalPath,
  noindex = false,
}: MetadataParams): Metadata {
  const url = `${SITE_URL}${canonicalPath}`;
  
  // 타이틀에 이미 브랜드명이 포함되어 있는지 검증하여 중복 결합 방지
  const brandName = "꿈과 운의 사전";
  const fullTitle = title.includes(brandName) ? title : `${title} | ${brandName}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: !noindex,
      follow: !noindex,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: brandName,
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

/**
 * Google 및 네이버용 Sitelinks Searchbox 구조화 데이터 스크립트 객체 생성 (JSON-LD)
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "꿈과 운의 사전",
    "alternateName": ["무료 사주", "무료 운세", "꿈해몽 사전"],
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * 브레드크럼용 JSON-LD 구조화 데이터 스크립트 객체 생성
 */
export function getBreadcrumbSchema(items: { name: string; item: string }[]) {
  const schemaList = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.item.startsWith("http") ? item.item : `${SITE_URL}${item.item}`,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: schemaList,
  };
}
