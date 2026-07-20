import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    // 1. 핵심 랜딩 페이지
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

    const staticUrls = corePages.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: (path === "" || path === "/today" ? "daily" : "weekly") as "daily" | "weekly",
      priority: path === "" ? 1.0 : 0.8
    }));

    // 2. 공개 발행 상태인 콘텐츠 조회
    const all = await db.contents.findByQuery({ status: "published" });

    const dynamicUrls = all.map((c) => {
      const pathType = c.type === "dream" ? "dreams" : c.type === "glossary" ? "glossary" : "articles";
      return {
        url: `${siteUrl}/${pathType}/${c.slug}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        changeFrequency: (c.type === "dream" ? "daily" : "weekly") as "daily" | "weekly",
        priority: c.type === "dream" ? 0.8 : 0.6
      };
    });

    return [...staticUrls, ...dynamicUrls];
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return [];
  }
}
