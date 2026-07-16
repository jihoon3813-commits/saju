"use server";

import { db } from "@/lib/db";
import { FORTUNE_SERVICES } from "@/lib/ai/serviceRegistry";

export interface SearchResultItem {
  id: string;
  title: string;
  type: "dream" | "glossary" | "article" | "service";
  description: string;
  path: string;
}

export async function unifiedSearchAction(query: string): Promise<{
  success: boolean;
  results: SearchResultItem[];
  error?: string;
}> {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, results: [] };
    }

    const cleanQuery = query.toLowerCase().trim();
    const results: SearchResultItem[] = [];

    // 1. 서비스 카탈로그 매칭 (FORTUNE_SERVICES Registry)
    Object.values(FORTUNE_SERVICES).forEach((svc) => {
      const matchTitle = svc.title.toLowerCase().includes(cleanQuery);
      const matchSections = svc.sections.some(
        (s) =>
          s.title.toLowerCase().includes(cleanQuery) ||
          s.description.toLowerCase().includes(cleanQuery)
      );

      if (matchTitle || matchSections) {
        results.push({
          id: svc.id,
          title: svc.title,
          type: "service",
          description: svc.sections.map((s) => s.title).join(", "),
          path: svc.freePaid === "free" ? `/today` : `/products/${svc.id}-saju`
        });
      }
    });

    // 2. 데이터베이스 콘텐츠(꿈해몽, 백과용어, 매거진) 매칭
    try {
      const matchedContents = await db.contents.findByQuery({ searchTerm: cleanQuery });

      matchedContents.forEach((c) => {
        let typeStr: "dream" | "glossary" | "article" = "article";
        let pathStr = `/articles/${c.slug}`;
        let desc = c.body.substring(0, 100) + "...";

        if (c.type === "dream") {
          typeStr = "dream";
          pathStr = `/dreams/${c.slug}`;
        } else if (c.type === "glossary") {
          typeStr = "glossary";
          pathStr = `/glossary/${c.slug}`;
        }

        results.push({
          id: c.id,
          title: c.title,
          type: typeStr,
          description: desc,
          path: pathStr
        });
      });
    } catch (dbErr) {
      console.error("DB content search error:", dbErr);
    }

    return {
      success: true,
      results: results.slice(0, 50) // 최대 50개까지 잘라 제공
    };
  } catch (err: any) {
    console.error("Unified search system error:", err);
    return {
      success: false,
      results: [],
      error: err?.message || "검색 연산 처리 중 에러가 발생했습니다."
    };
  }
}
