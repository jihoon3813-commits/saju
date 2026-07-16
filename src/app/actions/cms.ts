"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Content, Author } from "@/lib/db/types";
import { analyzeInternalLinks } from "@/lib/content/internalLinks";
import { AIProviderAdapter } from "@/lib/ai/provider";

/**
 * 1. 현재 로그인한 유저가 관리자('admin') 권한을 가지고 있는지 검증합니다.
 */
async function verifyAdmin(): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("403 Forbidden: 관리자 권한이 없거나 만료되었습니다.");
  }
}

/**
 * 2. 전체 콘텐츠 목록을 어드민 대시보드 표시용으로 가져옵니다.
 */
export async function getAdminContentListAction() {
  try {
    await verifyAdmin();
    const contents = await db.contents.findByQuery({});
    const authors = await db.authors.findAll();
    
    // 편의상 목록 조회를 위해 작성자명 결합
    const authorMap = new Map(authors.map((a) => [a.id, a.name]));
    
    // 내부링크 개수 통계 분석
    const analysis = analyzeInternalLinks(contents);

    const mapped = contents.map((c) => ({
      id: c.id,
      type: c.type,
      title: c.title,
      slug: c.slug,
      status: c.status,
      category: c.category,
      cluster: c.cluster,
      revision: c.revision,
      authorName: authorMap.get(c.authorId) || "알수없음",
      reviewerName: c.reviewerId ? authorMap.get(c.reviewerId) || "알수없음" : null,
      incomingCount: analysis.incomingCounts[c.slug.toLowerCase()] || 0,
      outgoingCount: analysis.outgoingCounts[c.slug.toLowerCase()] || 0,
      isIsolated: analysis.isolatedSlugs.includes(c.slug),
      updatedAt: c.updatedAt.toISOString(),
      publishedAt: c.publishedAt ? c.publishedAt.toISOString() : null
    }));

    return { success: true, list: mapped, analysis };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

/**
 * 3. 전체 필터링 링크 점검 및 내부링크 분석 리포트를 반환합니다.
 */
export async function getLinkAnalysisAction() {
  try {
    await verifyAdmin();
    const contents = await db.contents.findByQuery({});
    const analysis = analyzeInternalLinks(contents);
    return { success: true, analysis };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

/**
 * 4. 콘텐츠 단일 항목을 ID로 조회합니다.
 */
export async function getAdminContentDetailAction(id: string) {
  try {
    await verifyAdmin();
    const content = await db.contents.findById(id);
    if (!content) {
      return { success: false, error: "존재하지 않거나 삭제된 콘텐츠입니다." };
    }
    return { success: true, content };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

/**
 * 5. 콘텐츠 생성 또는 수정을 처리합니다 (중복 slug 유효성 검사 내장).
 */
export async function saveContentAction(
  id: string | null,
  fields: Partial<Content>
) {
  try {
    await verifyAdmin();

    if (!fields.title || !fields.slug || !fields.excerpt || !fields.body || !fields.authorId) {
      return { success: false, error: "필수 입력 항목(제목, 슬러그, 요약, 본문, 작성자)이 누락되었습니다." };
    }

    // 슬러그 패턴 유효성 점검
    if (!/^[a-z0-9-_]+$/.test(fields.slug)) {
      return { success: false, error: "슬러그는 소문자, 숫자, 하이픈(-), 언더바(_)만 가능합니다." };
    }

    if (id) {
      // 수정
      const updated = await db.contents.update(id, fields);
      return { success: true, id: updated.id, content: updated };
    } else {
      // 신규 등록
      const contentData: Omit<Content, "id" | "revision" | "createdAt" | "updatedAt" | "deletedAt"> = {
        type: fields.type || "article",
        title: fields.title,
        slug: fields.slug,
        excerpt: fields.excerpt,
        body: fields.body,
        cluster: fields.cluster || null,
        category: fields.category || null,
        tags: fields.tags || [],
        searchIntent: fields.searchIntent || null,
        primaryKeyword: fields.primaryKeyword || null,
        relatedServiceIds: fields.relatedServiceIds || [],
        relatedContentIds: fields.relatedContentIds || [],
        authorId: fields.authorId,
        reviewerId: fields.reviewerId || null,
        status: fields.status || "draft",
        publishedAt: fields.status === "published" ? new Date() : fields.publishedAt || null,
        canonicalUrl: fields.canonicalUrl || `/${fields.type || "article"}/${fields.slug}`,
        metaTitle: fields.metaTitle || fields.title,
        metaDescription: fields.metaDescription || fields.excerpt,
        ogImage: fields.ogImage || null,
        schemaType: fields.schemaType || "Article",
        noindex: fields.noindex || false,
        primarySymbol: fields.primarySymbol || null,
        action: fields.action || null,
        emotion: fields.emotion || null,
        setting: fields.setting || null,
        positiveInterpretation: fields.positiveInterpretation || null,
        cautionInterpretation: fields.cautionInterpretation || null,
        contextVariables: fields.contextVariables || null
      };

      const created = await db.contents.create(contentData);
      return { success: true, id: created.id, content: created };
    }
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

/**
 * 6. 콘텐츠 삭제(Soft Delete)를 수행합니다.
 */
export async function deleteContentAction(id: string) {
  try {
    await verifyAdmin();
    await db.contents.delete(id);
    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

/**
 * 7. 에디터/작가 목록을 가져옵니다.
 */
export async function getAuthorListAction() {
  try {
    await verifyAdmin();
    const list = await db.authors.findAll();
    return { success: true, list };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

/**
 * 8. 새 작가를 등록합니다.
 */
export async function createAuthorAction(fields: Omit<Author, "id" | "createdAt">) {
  try {
    await verifyAdmin();
    const created = await db.authors.create(fields);
    return { success: true, author: created };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

/**
 * 9. Gemini API를 활용해 상징어 및 제목 조건에 맞춰 10단계 가이드 초안 데이터를 자동 조립합니다.
 */
export async function generateAiContentDraftAction(
  type: "article" | "dream" | "glossary" | "guide" | "policy",
  title: string,
  primarySymbol?: string
) {
  try {
    await verifyAdmin();

    if (!title) {
      return { success: false, error: "초안 생성 대상 제목이 필요합니다." };
    }

    const prompt = `콘텐츠 제목: "${title}"
콘텐츠 종류: "${type}"
${primarySymbol ? `핵심 상징물: "${primarySymbol}"` : ""}`;

    const systemInstruction = `당신은 꿈해몽 사전과 사주명리 백과사전의 전문 콘텐츠 라이터 및 검색 최적화(SEO) 마케터다.
입력받은 제목과 상징어 정보를 분석하여, 사용자 유입 성격이 높고 애드센스 규격에 맞는 고품질 전문 초안을 JSON 형식으로 작성해야 한다.

출력 JSON 스펙 스키마:
{
  "excerpt": "사용자가 읽기 좋은 1-2문장의 직관적인 요약문 (HTML 제외)",
  "body": "검색 질문을 해결할 수 있도록 <h3>, <p>, <strong>, <ul>, <li> 태그만을 정갈하게 포함한 500자 이상의 고품질 본문 내용. 10단계 템플릿(상황별 해설, 현실 적용용 질문, FAQ 3개 포함 등)의 구조가 자연스럽게 나타나야 함. (AI가 만든 가짜 논문 출처나 사기성 통계치 절대 금지)",
  "tags": ["태그1", "태그2", "태그3"],
  "searchIntent": "이 글을 검색하는 독자의 궁극적인 내적 정보 검색 의도 서술",
  "primaryKeyword": "이 글이 집중해야 할 1순위 타겟 키워드",
  "metaTitle": "SEO 검색 결과 화면에 표시할 매력적인 타이틀 (35자 이하)",
  "metaDescription": "SEO 노출용 요약 설명문 (85자 이하)",
  
  // 꿈해몽(type=dream)일 때 필수, 아닐 시 null
  "primarySymbol": "상징 단일어 (예: 뱀)",
  "action": "상징의 행위 (예: 물리다)",
  "emotion": "대표 감정 (예: 두려움)",
  "setting": "대표 장소 (예: 집안)",
  "positiveInterpretation": "꿈이 제공하는 긍정적 측면 한 줄 요약",
  "cautionInterpretation": "꿈이 주는 주의/경고 측면 한 줄 요약",
  "contextVariables": { "clarity": "clear", "count": 1 }
}

[절대 금지 조항]
- '100% 당첨된다', '무조건 이혼한다', '죽게 된다'는 식의 극단적이고 미신적인 공포 조장 금지.
- 현실 지향적이고 마음가짐의 변화를 돕는 성실하고 따뜻한 어조를 띨 것.
- JSON 파싱 에러가 발생하지 않도록 역슬래시나 쌍따옴표 문자열 이스케이프 처리를 완벽하게 준수할 것.`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        excerpt: { type: "STRING" },
        body: { type: "STRING" },
        tags: { type: "ARRAY", items: { type: "STRING" } },
        searchIntent: { type: "STRING" },
        primaryKeyword: { type: "STRING" },
        metaTitle: { type: "STRING" },
        metaDescription: { type: "STRING" },
        primarySymbol: { type: "STRING" },
        action: { type: "STRING" },
        emotion: { type: "STRING" },
        setting: { type: "STRING" },
        positiveInterpretation: { type: "STRING" },
        cautionInterpretation: { type: "STRING" },
        contextVariables: { type: "OBJECT" }
      },
      required: [
        "excerpt", "body", "tags", "searchIntent", "primaryKeyword",
        "metaTitle", "metaDescription"
      ]
    };

    const aiRes = await AIProviderAdapter.generate(
      prompt,
      systemInstruction,
      responseSchema
    );

    try {
      const parsed = JSON.parse(aiRes.text);
      return { success: true, draft: parsed };
    } catch (parseErr) {
      return { success: false, error: "AI가 규격화된 JSON을 리턴했으나 파싱에 실패했습니다: " + aiRes.text };
    }
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}
