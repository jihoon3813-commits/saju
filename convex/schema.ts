import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. 회원 정보 (users)
  users: defineTable({
    id: v.string(),
    email: v.string(),
    passwordHash: v.union(v.string(), v.null()),
    provider: v.string(), // "email" | "google" | "kakao" | "naver"
    role: v.string(), // "user" | "admin"
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.union(v.number(), v.null()),
  })
    .index("by_custom_id", ["id"])
    .index("by_email", ["email"]),

  // 2. 로그인 세션 (sessions)
  sessions: defineTable({
    id: v.string(),
    userId: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_custom_id", ["id"])
    .index("by_token", ["token"]),

  // 3. 만세력 프로필 (profiles / birthProfiles)
  profiles: defineTable({
    id: v.string(),
    userId: v.union(v.string(), v.null()),
    anonymousSessionId: v.union(v.string(), v.null()),
    alias: v.string(),
    relationship: v.string(), // "self" | "family" | "lover" | "friend" | "partner" | "other"
    calendarType: v.string(), // "solar" | "lunar"
    lunarLeapMonth: v.union(v.boolean(), v.null()),
    birthDate: v.string(), // "YYYY-MM-DD"
    birthTime: v.union(v.string(), v.null()), // "HH:MM"
    unknownBirthTime: v.boolean(),
    birthCountry: v.string(),
    birthCity: v.string(),
    timezone: v.string(),
    latitude: v.union(v.number(), v.null()),
    longitude: v.union(v.number(), v.null()),
    genderRuleOption: v.string(), // "male" | "female" | "unspecified"
    calculationPreference: v.object({
      useTrueSolarTime: v.boolean(),
      borderTimeRule: v.string()
    }),
    saveConsent: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.union(v.number(), v.null()),
  })
    .index("by_custom_id", ["id"])
    .index("by_userId", ["userId"])
    .index("by_anonymousSessionId", ["anonymousSessionId"]),

  // 4. 만세력 캐시 (caches / chartCaches)
  caches: defineTable({
    id: v.string(),
    inputHash: v.string(),
    engineVersion: v.string(),
    chartResult: v.string(), // ChartResult JSON String
    createdAt: v.number(),
  })
    .index("by_custom_id", ["id"])
    .index("by_hash_version", ["inputHash", "engineVersion"]),

  // 5. AI 해석 보고서 원장 (interpretations / interpretationResults)
  interpretations: defineTable({
    id: v.string(),
    profileId: v.string(),
    profileId2: v.union(v.string(), v.null()),
    serviceType: v.string(), // "basic-saju" | "today" | "compatibility"
    chartHash: v.string(),
    reportData: v.string(), // ReportData JSON String
    fallback: v.boolean(),
    engineVersion: v.string(),
    ruleVersion: v.string(),
    promptVersion: v.string(),
    modelName: v.string(),
    generatedAt: v.number(),
  })
    .index("by_custom_id", ["id"])
    .index("by_query", [
      "profileId",
      "serviceType",
      "chartHash",
      "engineVersion",
      "ruleVersion",
      "promptVersion",
    ]),

  // 6. 결과지 보안 공유 링크 (sharedLinks)
  sharedLinks: defineTable({
    id: v.string(),
    interpretationResultId: v.string(),
    expiresAt: v.number(),
    createdSessionId: v.union(v.string(), v.null()),
    key: v.string(),
    createdAt: v.number(),
  })
    .index("by_custom_id", ["id"]),

  // 7. 콘텐츠 집필 작가 프로필 (authors)
  authors: defineTable({
    id: v.string(),
    name: v.string(),
    role: v.string(),
    bio: v.union(v.string(), v.null()),
    avatarUrl: v.union(v.string(), v.null()),
    createdAt: v.number(),
  })
    .index("by_custom_id", ["id"]),

  // 8. CMS 통합 콘텐츠 (contents)
  contents: defineTable({
    id: v.string(),
    type: v.string(), // "article" | "dream" | "glossary" | "guide" | "policy"
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    body: v.string(),
    cluster: v.union(v.string(), v.null()),
    category: v.union(v.string(), v.null()),
    tags: v.array(v.string()),
    searchIntent: v.union(v.string(), v.null()),
    primaryKeyword: v.union(v.string(), v.null()),
    relatedServiceIds: v.array(v.string()),
    relatedContentIds: v.array(v.string()),
    authorId: v.string(),
    reviewerId: v.union(v.string(), v.null()),
    status: v.string(), // "draft" | "review" | "scheduled" | "published" | "archived"
    publishedAt: v.union(v.number(), v.null()),
    updatedAt: v.number(),
    canonicalUrl: v.union(v.string(), v.null()),
    metaTitle: v.union(v.string(), v.null()),
    metaDescription: v.union(v.string(), v.null()),
    ogImage: v.union(v.string(), v.null()),
    schemaType: v.union(v.string(), v.null()),
    noindex: v.boolean(),
    revision: v.number(),
    createdAt: v.number(),
    deletedAt: v.union(v.number(), v.null()),

    // 꿈해몽 변수 확장
    primarySymbol: v.optional(v.union(v.string(), v.null())),
    action: v.optional(v.union(v.string(), v.null())),
    emotion: v.optional(v.union(v.string(), v.null())),
    setting: v.optional(v.union(v.string(), v.null())),
    positiveInterpretation: v.optional(v.union(v.string(), v.null())),
    cautionInterpretation: v.optional(v.union(v.string(), v.null())),
    contextVariables: v.optional(v.union(v.string(), v.null())), // JSON String
  })
    .index("by_custom_id", ["id"])
    .index("by_slug", ["slug"])
    .index("by_type", ["type"])
    .index("by_type_status", ["type", "status"]),

  // 9. 광고 노출 슬롯 배치 설정 (adPlacements)
  adPlacements: defineTable({
    id: v.string(),
    slotKey: v.string(),
    pageType: v.string(),
    position: v.string(),
    deviceTarget: v.string(), // "all" | "pc" | "mobile"
    enabled: v.boolean(),
    minContentLength: v.number(),
    adFormat: v.string(), // "banner" | "infeed" | "sidebar" | "native"
    reserveHeight: v.number(),
    consentRequired: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_custom_id", ["id"])
    .index("by_slotKey", ["slotKey"]),

  // 10. 광고 관리 조작 감사 로그 (adAuditLogs)
  adAuditLogs: defineTable({
    id: v.string(),
    placementId: v.string(),
    slotKey: v.string(),
    action: v.string(),
    changedBy: v.string(),
    changes: v.string(), // JSON String
    createdAt: v.number(),
  })
    .index("by_custom_id", ["id"])
    .index("by_placementId", ["placementId"]),

  // 11. 사용자 활동 분석 로그 (analyticsLogs)
  analyticsLogs: defineTable({
    id: v.string(),
    eventName: v.string(),
    pageType: v.string(),
    sessionId: v.string(),
    properties: v.string(), // JSON String
    createdAt: v.number(),
  })
    .index("by_custom_id", ["id"])
    .index("by_eventName", ["eventName"])
    .index("by_sessionId", ["sessionId"]),

  // 12. 유료 운세 레포트 상품 정보 (products)
  products: defineTable({
    id: v.string(),
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    productType: v.string(), // "saju_report" | "mini_report" | "compatibility" | "planner"
    price: v.number(),
    currency: v.string(),
    active: v.boolean(),
    sampleReportId: v.union(v.string(), v.null()),
    requiredInputSchema: v.union(v.string(), v.null()),
    reportTemplateVersion: v.string(),
    refundPolicyVersion: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_custom_id", ["id"])
    .index("by_slug", ["slug"]),

  // 13. 상품 가격 변동 개정안 (priceVersions)
  priceVersions: defineTable({
    id: v.string(),
    productId: v.string(),
    price: v.number(),
    currency: v.string(),
    version: v.string(),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_custom_id", ["id"])
    .index("by_productId", ["productId"]),

  // 14. 할인 쿠폰 마케팅 설정 (coupons)
  coupons: defineTable({
    id: v.string(),
    code: v.string(),
    discountType: v.string(), // "amount" | "percent"
    discountValue: v.number(),
    maxUses: v.number(),
    usedCount: v.number(),
    active: v.boolean(),
    productRestrictions: v.union(v.array(v.string()), v.null()),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_custom_id", ["id"])
    .index("by_code", ["code"]),

  // 15. 결제 및 주문 대장 (orders)
  orders: defineTable({
    id: v.string(),
    userId: v.union(v.string(), v.null()),
    productId: v.string(),
    priceVersionId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(), // "pending" | "authorized" | "paid" | "report_generating" | "completed" | "failed" | "cancelled" | "refund_requested" | "refunded"
    paymentProvider: v.string(), // "tosspayments" | "portone" | "mock" | "none"
    providerOrderId: v.union(v.string(), v.null()),
    idempotencyKey: v.union(v.string(), v.null()),
    chartId: v.union(v.string(), v.null()),
    interpretationId: v.union(v.string(), v.null()),
    policyVersion: v.string(),
    couponId: v.union(v.string(), v.null()),
    refundReason: v.union(v.string(), v.null()),
    refundedAmount: v.union(v.number(), v.null()),
    refundedAt: v.union(v.number(), v.null()),
    createdAt: v.number(),
    paidAt: v.union(v.number(), v.null()),
    cancelledAt: v.union(v.number(), v.null()),
    updatedAt: v.number(),
  })
    .index("by_custom_id", ["id"])
    .index("by_idempotencyKey", ["idempotencyKey"])
    .index("by_userId", ["userId"]),

  // 16. 쿠폰 소진 내역 로그 (couponUses)
  couponUses: defineTable({
    id: v.string(),
    couponId: v.string(),
    orderId: v.string(),
    userId: v.union(v.string(), v.null()),
    createdAt: v.number(),
  })
    .index("by_custom_id", ["id"])
    .index("by_couponId", ["couponId"])
    .index("by_orderId", ["orderId"]),

  // 17. PG 웹훅 신호 수신 원장 (webhookLogs)
  webhookLogs: defineTable({
    id: v.string(),
    provider: v.string(),
    payload: v.string(),
    signature: v.union(v.string(), v.null()),
    processed: v.boolean(),
    errorMessage: v.union(v.string(), v.null()),
    createdAt: v.number(),
  })
    .index("by_custom_id", ["id"]),

  // 18. 오류/의견 신고 접수 큐 (userReports)
  userReports: defineTable({
    id: v.string(),
    reportType: v.string(), // "calculation_error" | "result_sentence" | "privacy" | "payment" | "content_error"
    orderId: v.union(v.string(), v.null()),
    errorCode: v.union(v.string(), v.null()),
    versionInfo: v.union(v.string(), v.null()),
    content: v.string(),
    status: v.string(), // "pending" | "resolved" | "ignored"
    createdAt: v.number(),
    resolvedAt: v.union(v.number(), v.null()),
  })
    .index("by_custom_id", ["id"]),

  // 19. 어드민 운영 제어 감사 로그 (auditLogs)
  auditLogs: defineTable({
    id: v.string(),
    adminId: v.string(),
    adminEmail: v.string(),
    action: v.string(),
    ipAddress: v.union(v.string(), v.null()),
    userAgent: v.union(v.string(), v.null()),
    createdAt: v.number(),
  })
    .index("by_custom_id", ["id"]),

  // 20. 법적 고지 및 동의 정책 버전 관리 (policyVersions)
  policyVersions: defineTable({
    id: v.string(),
    title: v.string(),
    version: v.string(),
    content: v.string(),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_custom_id", ["id"]),
});
