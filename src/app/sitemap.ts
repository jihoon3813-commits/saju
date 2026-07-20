import { MetadataRoute } from "next";
import { db } from "@/lib/db";

// Next.js 14/15/16 분리형 사이트맵 세그먼트 생성용 API
export async function generateSitemaps() {
  return [
    { id: "pages" },
    { id: "contents" },
    { id: "dreams" },
    { id: "glossary" }
  ];
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    // 1. 핵심 랜딩 페이지 사이트맵 분기 처리
    if (id === "pages") {
      const corePages = [
        "",
        "/saju",
        "/today",
        "/compatibility",
        "/tarot",
        "/dreams",
        "/articles",
        "/about",
        "/faq"
      ];
      return corePages.map((path) => ({
        url: `${siteUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" || path === "/today" ? "daily" : "weekly",
        priority: path === "" ? 1.0 : 0.8
      }));
    }

    // 2. 공개 발행 상태인 콘텐츠 조회
    const all = await db.contents.findByQuery({ status: "published" });

    let filtered = all;
    if (id === "dreams") {
      filtered = all.filter((c) => c.type === "dream");
    } else if (id === "glossary") {
      filtered = all.filter((c) => c.type === "glossary");
    } else {
      // 일반 아티클, 가이드, 정책 문서
      filtered = all.filter((c) => c.type !== "dream" && c.type !== "glossary");
    }

    return filtered.map((c) => {
      // 주소 매핑 규칙
      const pathType = c.type === "dream" ? "dreams" : c.type === "glossary" ? "glossary" : "articles";
      
      return {
        url: `${siteUrl}/${pathType}/${c.slug}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        changeFrequency: c.type === "dream" ? "daily" : "weekly",
        priority: c.type === "dream" ? 0.8 : 0.6
      };
    });
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return [];
  }
}
