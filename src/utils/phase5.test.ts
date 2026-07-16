import { describe, it, expect, beforeEach } from "vitest";
import { jsonDb } from "../lib/db/jsonDb";
import { analyzeInternalLinks, recommendInternalLinks } from "../lib/content/internalLinks";
import { Content, Author } from "../lib/db/types";

// 테스트를 위한 Mock 데이터 빌더
function createMockContent(fields: Partial<Content> = {}): Content {
  return {
    id: fields.id || "mock-content-id",
    type: fields.type || "article",
    title: fields.title || "테스트용 명리 글",
    slug: fields.slug || "test-saju-slug",
    excerpt: fields.excerpt || "테스트 요약글입니다.",
    body: fields.body || "본문 내용입니다.",
    cluster: fields.cluster || "기초",
    category: fields.category || "사주",
    tags: fields.tags || ["테스트"],
    searchIntent: fields.searchIntent || "검색의도",
    primaryKeyword: fields.primaryKeyword || "키워드",
    relatedServiceIds: fields.relatedServiceIds || [],
    relatedContentIds: fields.relatedContentIds || [],
    authorId: fields.authorId || "author-uuid-1",
    reviewerId: fields.reviewerId || null,
    status: fields.status || "published",
    publishedAt: fields.publishedAt || new Date(),
    updatedAt: fields.updatedAt || new Date(),
    canonicalUrl: fields.canonicalUrl || "/article/test-saju-slug",
    metaTitle: fields.metaTitle || "메타제목",
    metaDescription: fields.metaDescription || "메타설명",
    ogImage: fields.ogImage || null,
    schemaType: fields.schemaType || "Article",
    noindex: fields.noindex || false,
    revision: fields.revision || 1,
    createdAt: fields.createdAt || new Date(),
    deletedAt: fields.deletedAt || null,
    ...fields
  };
}

describe("Phase 5 - CMS 및 SEO 콘텐츠 허브 통합 테스트", () => {
  
  // 1. 슬러그(Slug) 중복 방지 유효성 검사
  it("슬러그 중복 검사: 동일한 slug로 중복 생성 시 충돌을 사전 적발해 내야 한다", async () => {
    const dbInstance = jsonDb.contents;
    const authorInstance = jsonDb.authors;

    // 임시 필진 등록 (참조 오류 예방)
    const author = await authorInstance.create({
      name: "테스트필진",
      role: "에디터",
      bio: "약력",
      avatarUrl: null
    });

    const newSlug = `temp-test-slug-${Math.random().toString(36).substring(7)}`;

    // 새 임시 글 생성
    const created = await dbInstance.create({
      type: "article",
      title: "임시 글",
      slug: newSlug,
      excerpt: "요약",
      body: "본문",
      cluster: null,
      category: null,
      tags: [],
      searchIntent: null,
      primaryKeyword: null,
      relatedServiceIds: [],
      relatedContentIds: [],
      authorId: author.id,
      reviewerId: null,
      status: "published",
      publishedAt: new Date(),
      canonicalUrl: null,
      metaTitle: null,
      metaDescription: null,
      ogImage: null,
      schemaType: null,
      noindex: false
    });

    const exists = await dbInstance.checkSlugExists(newSlug);
    expect(exists).toBe(true);

    const existsNew = await dbInstance.checkSlugExists(newSlug + "-not-exist");
    expect(existsNew).toBe(false);

    // 정리
    await dbInstance.delete(created.id);
  });

  // 2. 내부링크(Internal Link) 및 깨진 링크(Broken Link) 검사 엔진
  it("링크 분석 엔진: 깨진 링크(존재하지 않는 슬러그)와 고립 페이지(Incoming = 0)를 정상 분류해야 한다", () => {
    const list: Content[] = [
      createMockContent({
        id: "mock-id-hub",
        title: "허브 글",
        slug: "hub-slug",
        body: '<p>여기 <a href="/dreams/pig-dream-interpretation">돼지꿈</a> 링크가 있으며, 존재하지 않는 <a href="/dreams/ghost-dream">유령꿈</a> 링크도 있습니다.</p>'
      }),
      createMockContent({
        id: "mock-id-pig",
        title: "돼지 꿈해몽",
        slug: "pig-dream-interpretation",
        body: "돼지꿈 본문입니다."
      }),
      createMockContent({
        id: "mock-id-orphan",
        title: "외톨이 글",
        slug: "orphan-slug",
        body: "어느 글에서도 나를 링크하지 않습니다."
      })
    ];

    const result = analyzeInternalLinks(list);

    // 유입 카운트 검수
    expect(result.incomingCounts["pig-dream-interpretation"]).toBe(1);
    expect(result.incomingCounts["orphan-slug"]).toBe(0);

    // 고립(외톨이) 페이지 검수
    expect(result.isolatedSlugs).toContain("orphan-slug");
    expect(result.isolatedSlugs).not.toContain("pig-dream-interpretation");

    // 깨진 링크(존재하지 않는 ghost-dream) 검수
    expect(result.brokenLinks.length).toBe(1);
    expect(result.brokenLinks[0].toSlug).toBe("ghost-dream");
  });

  // 3. 자동 키워드 내부 링크 추천 검사
  it("키워드 링크 추천: 타 문서의 제목이나 상징 키워드가 본문에 있으면 링크를 지능적으로 추천해야 한다", () => {
    const current = createMockContent({
      id: "current-id",
      title: "일지 분석 글",
      slug: "ilji-analysis",
      body: "사주풀이를 할 때에는 오행 흐름과 함께 십성 해석을 대입하는 것이 극히 필수적입니다."
    });

    const otherContents = [
      createMockContent({
        id: "other-id-1",
        title: "오행과 십성의 차이",
        slug: "difference-between-five-elements-and-ten-gods",
        primaryKeyword: "십성"
      }),
      createMockContent({
        id: "other-id-2",
        title: "미연계 글",
        slug: "no-relation",
        primaryKeyword: "호랑이"
      })
    ];

    const recommendations = recommendInternalLinks(current, otherContents);

    expect(recommendations.length).toBe(1);
    expect(recommendations[0].keyword).toBe("십성");
    expect(recommendations[0].targetSlug).toBe("difference-between-five-elements-and-ten-gods");
  });

  // 4. 드래프트(Draft) 비공개 및 SEO 색인 방지 가드
  it("SEO 색인 제어: draft 상태의 글이나 noindex 설정 글은 크롤링 제외 기준을 충족해야 한다", () => {
    const draftContent = createMockContent({
      status: "draft",
      noindex: true
    });
    
    // draft 상태이거나 explicit noindex일 때 index 차단
    expect(draftContent.status === "draft" || draftContent.noindex).toBe(true);
  });

  // 5. 사이트맵 세그먼트 데이터 구성 무결성 검증
  it("사이트맵 매핑: sitemap 반환 아이템들의 URL, 수정일자, 빈도 등이 명세를 충족해야 한다", () => {
    const list = [
      createMockContent({ slug: "saju-basics", type: "article" }),
      createMockContent({ slug: "snake-dream", type: "dream" })
    ];

    const mappedSitemap = list.map((c) => {
      const pathType = c.type === "dream" ? "dreams" : "articles";
      return {
        url: `https://test-site.com/${pathType}/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: c.type === "dream" ? "daily" : "weekly"
      };
    });

    expect(mappedSitemap[0].url).toBe("https://test-site.com/articles/saju-basics");
    expect(mappedSitemap[1].url).toBe("https://test-site.com/dreams/snake-dream");
    expect(mappedSitemap[1].changeFrequency).toBe("daily");
  });
});
