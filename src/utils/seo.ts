import { Metadata } from "next";

const SITE_URL = "https://dreamfortune.com"; // 서비스 실제 상용 도메인 설정 예정

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
  const fullTitle = `${title} | 꿈과 운의 사전`;

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
      siteName: "꿈과 운의 사전",
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
