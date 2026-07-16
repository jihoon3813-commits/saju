import { Content } from "@/lib/db/types";

interface LinkAnalysisResult {
  incomingCounts: Record<string, number>; // 각 슬러그로 유입되는 링크 수
  outgoingCounts: Record<string, number>; // 각 슬러그에서 나가는 링크 수
  brokenLinks: { fromSlug: string; toSlug: string; url: string; text: string }[]; // 깨진 링크 목록
  isolatedSlugs: string[]; // 다른 곳에서 유입되는 링크가 전혀 없는 고립 페이지 슬러그 목록
}

interface LinkRecommendation {
  keyword: string;
  targetSlug: string;
  targetTitle: string;
  targetType: string;
}

/**
 * 1. 전체 콘텐츠의 본문 HTML을 분석하여 링크 연결 상태를 전수 검수합니다.
 */
export function analyzeInternalLinks(allContents: Content[]): LinkAnalysisResult {
  const published = allContents.filter((c) => c.status === "published" && c.deletedAt === null);
  const slugSet = new Set(published.map((c) => c.slug.toLowerCase()));
  
  const incomingCounts: Record<string, number> = {};
  const outgoingCounts: Record<string, number> = {};
  const brokenLinks: LinkAnalysisResult["brokenLinks"] = [];

  // 초기화
  for (const c of published) {
    incomingCounts[c.slug.toLowerCase()] = 0;
    outgoingCounts[c.slug.toLowerCase()] = 0;
  }

  // 정규식을 이용해 href="/(dreams|articles|glossary)/[slug]" 형태를 스캔합니다.
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["'](\/(?:dreams|articles|glossary)\/([^"'\s#]+))["'](?:[^>]*?)>([\s\S]*?)<\/a>/gi;

  for (const c of published) {
    const body = c.body || "";
    let match;
    let outCount = 0;

    // 본문에서 정규식 반복 매칭
    while ((match = linkRegex.exec(body)) !== null) {
      const fullUrl = match[1];
      const targetSlug = match[2].toLowerCase();
      const linkText = match[3].replace(/<[^>]*>/g, "").trim(); // HTML 태그 제거

      outCount++;

      if (slugSet.has(targetSlug)) {
        incomingCounts[targetSlug] = (incomingCounts[targetSlug] || 0) + 1;
      } else {
        // 존재하지 않는 내부 슬러그인 경우 깨진 링크로 규정
        brokenLinks.push({
          fromSlug: c.slug,
          toSlug: targetSlug,
          url: fullUrl,
          text: linkText || "(텍스트 없음)"
        });
      }
    }

    outgoingCounts[c.slug.toLowerCase()] = outCount;
  }

  // 유입 카운트가 0인 슬러그들을 고립(Orphan) 페이지로 산출
  const isolatedSlugs = published
    .filter((c) => (incomingCounts[c.slug.toLowerCase()] || 0) === 0)
    .map((c) => c.slug);

  return {
    incomingCounts,
    outgoingCounts,
    brokenLinks,
    isolatedSlugs
  };
}

/**
 * 2. 현재 편집 중인 본문을 분석하여 다른 콘텐츠의 제목이나 대표 키워드가 존재할 시, 내부링크 연결을 자동 추천합니다.
 */
export function recommendInternalLinks(
  currentContent: Content,
  allContents: Content[]
): LinkRecommendation[] {
  const published = allContents.filter(
    (c) => c.status === "published" && c.id !== currentContent.id && c.deletedAt === null
  );

  const bodyLower = (currentContent.body || "").toLowerCase();
  const recommendations: LinkRecommendation[] = [];

  // 본문에서 이미 나가는 링크들의 목적지 슬러그 수집 (중복 추천 방지)
  const linkRegex = /href=["']\/(?:dreams|articles|glossary)\/([^"'\s#]+)["']/gi;
  const existingLinks = new Set<string>();
  let match;
  while ((match = linkRegex.exec(currentContent.body || "")) !== null) {
    existingLinks.add(match[1].toLowerCase());
  }

  for (const target of published) {
    // 이미 링크가 걸려있는 대상은 추천 제외
    if (existingLinks.has(target.slug.toLowerCase())) {
      continue;
    }

    // 1순위: 대상 제목 전체가 포함되는가?
    // 2순위: 대상 primaryKeyword가 본문에 직접 기재되었는가?
    const keywordsToTry = [target.title, target.primaryKeyword].filter(Boolean) as string[];
    
    // 꿈 상징인 경우 primarySymbol도 타겟팅에 추가
    if (target.type === "dream" && target.primarySymbol) {
      keywordsToTry.push(target.primarySymbol);
    }

    for (const kw of keywordsToTry) {
      if (kw.length >= 2 && bodyLower.includes(kw.toLowerCase())) {
        recommendations.push({
          keyword: kw,
          targetSlug: target.slug,
          targetTitle: target.title,
          targetType: target.type
        });
        break; // 하나의 문서에 대해서는 1개의 추천만 적용
      }
    }
  }

  return recommendations;
}
