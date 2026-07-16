import { BirthProfile } from "@/schemas/fortune";
import { ChartResult } from "@/lib/manse/types";

// 1. 회원 정보 모델 정의 (auth용)
export interface User {
  id: string;
  email: string;
  passwordHash: string | null; // 소셜 로그인인 경우 null
  provider: "email" | "google" | "kakao" | "naver";
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// 2. 세션 모델 정의
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// 캐시 모델 정의
export interface ChartCache {
  id: string;
  inputHash: string;
  engineVersion: string;
  chartResult: ChartResult;
  createdAt: Date;
}

// 3. 데이터베이스 저장소 인터페이스 정의 (어댑터 패턴)
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: Omit<User, "id" | "role" | "createdAt" | "updatedAt" | "deletedAt"> & { role?: "user" | "admin" }): Promise<User>;
  update(id: string, user: Partial<Omit<User, "id">>): Promise<User>;
  delete(id: string): Promise<void>; // Soft Delete 수행
  hardDelete(id: string): Promise<void>; // 물리 파기 수행
}

export interface SessionRepository {
  create(userId: string, token: string, expiresAt: Date): Promise<UserSession>;
  findByToken(token: string): Promise<UserSession | null>;
  deleteByToken(token: string): Promise<void>;
  deleteExpired(): Promise<number>;
}

export interface BirthProfileRepository {
  findById(id: string): Promise<BirthProfile | null>;
  findByUserId(userId: string): Promise<BirthProfile[]>;
  findByAnonymousSessionId(sessionId: string): Promise<BirthProfile[]>;
  create(profile: Omit<BirthProfile, "id" | "createdAt" | "updatedAt" | "deletedAt">): Promise<BirthProfile>;
  update(id: string, profile: Partial<Omit<BirthProfile, "id">>): Promise<BirthProfile>;
  delete(id: string): Promise<void>; // Soft Delete 수행
  hardDelete(id: string): Promise<void>; // 물리 파기 수행
  linkAnonymousToUser(anonymousSessionId: string, userId: string): Promise<number>; // 회원가입 후 프로필 병합
}

export interface ChartCacheRepository {
  find(inputHash: string, engineVersion: string): Promise<ChartResult | null>;
  create(inputHash: string, engineVersion: string, chartResult: ChartResult): Promise<void>;
}

// 5. AI 해석 보고서 정보 모델 정의
export interface InterpretationResult {
  id: string;
  profileId: string;
  profileId2: string | null; // 궁합용 두번째 프로필
  serviceType: "basic-saju" | "today" | "compatibility";
  chartHash: string;
  reportData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  fallback: boolean;
  engineVersion: string;
  ruleVersion: string;
  promptVersion: string;
  modelName: string;
  generatedAt: Date;
}

// 6. 보안 접근형 공유 링크 모델 정의
export interface SharedLink {
  id: string;
  interpretationResultId: string;
  expiresAt: Date;
  createdSessionId: string | null;
  key: string;
  createdAt: Date;
}

export interface InterpretationResultRepository {
  findById(id: string): Promise<InterpretationResult | null>;
  findByQuery(
    profileId: string,
    serviceType: string,
    chartHash: string,
    engineVersion: string,
    ruleVersion: string,
    promptVersion: string
  ): Promise<InterpretationResult | null>;
  create(
    result: Omit<InterpretationResult, "id" | "generatedAt">
  ): Promise<InterpretationResult>;
  findAll(): Promise<InterpretationResult[]>;
}

export interface SharedLinkRepository {
  findById(id: string): Promise<SharedLink | null>;
  create(link: Omit<SharedLink, "id" | "createdAt">): Promise<SharedLink>;
  delete(id: string): Promise<void>;
}

// 7. 콘텐츠 작성자(에디터/전문가) 모델 정의
export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}

// 8. CMS 콘텐츠 정보 모델 정의
export interface Content {
  id: string;
  type: "article" | "dream" | "glossary" | "guide" | "policy";
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cluster: string | null;
  category: string | null;
  tags: string[];
  searchIntent: string | null;
  primaryKeyword: string | null;
  relatedServiceIds: string[];
  relatedContentIds: string[];
  authorId: string;
  reviewerId: string | null;
  status: "draft" | "review" | "scheduled" | "published" | "archived";
  publishedAt: Date | null;
  updatedAt: Date;
  canonicalUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  schemaType: string | null;
  noindex: boolean;
  revision: number;
  createdAt: Date;
  deletedAt: Date | null;

  // DreamEntry 추가 필드
  primarySymbol?: string | null;
  action?: string | null;
  emotion?: string | null;
  setting?: string | null;
  positiveInterpretation?: string | null;
  cautionInterpretation?: string | null;
  contextVariables?: any | null;
}

export interface AuthorRepository {
  findById(id: string): Promise<Author | null>;
  findAll(): Promise<Author[]>;
  create(author: Omit<Author, "id" | "createdAt">): Promise<Author>;
}

export interface ContentRepository {
  findById(id: string): Promise<Content | null>;
  findBySlug(slug: string): Promise<Content | null>;
  findByType(type: string, status?: string): Promise<Content[]>;
  findByQuery(filter: {
    type?: string;
    category?: string;
    status?: string;
    searchTerm?: string;
  }): Promise<Content[]>;
  create(
    content: Omit<Content, "id" | "revision" | "createdAt" | "updatedAt" | "deletedAt">
  ): Promise<Content>;
  update(id: string, content: Partial<Omit<Content, "id">>): Promise<Content>;
  delete(id: string): Promise<void>;
  checkSlugExists(slug: string, excludeId?: string): Promise<boolean>;
}

// 9. 광고 배치(AdPlacement) 모델 정의
export interface AdPlacement {
  id: string;
  slotKey: string;
  pageType: string;
  position: string;
  deviceTarget: "all" | "pc" | "mobile";
  enabled: boolean;
  minContentLength: number;
  adFormat: "banner" | "infeed" | "sidebar" | "native";
  reserveHeight: number;
  consentRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 10. 광고 관리 변경 감사 로그 모델 정의
export interface AdAuditLog {
  id: string;
  placementId: string;
  slotKey: string;
  action: string; // "create" | "update" | "delete" | "toggle_enable"
  changedBy: string;
  changes: string; // JSON string
  createdAt: Date;
}

export interface AdPlacementRepository {
  findById(id: string): Promise<AdPlacement | null>;
  findBySlotKey(slotKey: string): Promise<AdPlacement | null>;
  findAll(): Promise<AdPlacement[]>;
  create(placement: Omit<AdPlacement, "id" | "createdAt" | "updatedAt">): Promise<AdPlacement>;
  update(id: string, placement: Partial<Omit<AdPlacement, "id" | "createdAt" | "updatedAt">>): Promise<AdPlacement>;
  delete(id: string): Promise<void>;
}

export interface AdAuditLogRepository {
  create(log: Omit<AdAuditLog, "id" | "createdAt">): Promise<AdAuditLog>;
  findByPlacementId(placementId: string): Promise<AdAuditLog[]>;
  findAll(): Promise<AdAuditLog[]>;
}

// 11. 비개인식별 분석 로그(AnalyticsLog) 모델 정의
export interface AnalyticsLog {
  id: string;
  eventName: string;
  pageType: string;
  sessionId: string;
  properties: string; // JSON string
  createdAt: Date;
}

export interface AnalyticsLogRepository {
  create(log: Omit<AnalyticsLog, "id" | "createdAt">): Promise<AnalyticsLog>;
  findAll(): Promise<AnalyticsLog[]>;
  findByEventName(eventName: string): Promise<AnalyticsLog[]>;
  findBySessionId(sessionId: string): Promise<AnalyticsLog[]>;
}

// 12. 유료 리포트 상품 모델 정의
export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  productType: "saju_report" | "mini_report" | "compatibility" | "planner";
  price: number;
  currency: string;
  active: boolean;
  sampleReportId: string | null;
  requiredInputSchema: string | null; // JSON Schema format
  reportTemplateVersion: string;
  refundPolicyVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

// 13. 상품 가격 버저닝 모델 정의
export interface PriceVersion {
  id: string;
  productId: string;
  price: number;
  currency: string;
  version: string;
  active: boolean;
  createdAt: Date;
}

// 14. 쿠폰 모델 정의
export interface Coupon {
  id: string;
  code: string;
  discountType: "amount" | "percent";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  productRestrictions: string[] | null; // 대상 상품 ID 제한 목록
  expiresAt: Date;
  createdAt: Date;
}

// 15. 결제 및 운세 주문 모델 정의
export interface Order {
  id: string;
  userId: string | null;
  productId: string;
  priceVersionId: string;
  amount: number;
  currency: string;
  status: "pending" | "authorized" | "paid" | "report_generating" | "completed" | "failed" | "cancelled" | "refund_requested" | "refunded";
  paymentProvider: "tosspayments" | "portone" | "mock" | "none";
  providerOrderId: string | null;
  idempotencyKey: string | null;
  chartId: string | null; // references birthProfile
  interpretationId: string | null; // references interpretationResult
  policyVersion: string;
  couponId: string | null;
  refundReason: string | null;
  refundedAmount: number | null;
  refundedAt: Date | null;
  createdAt: Date;
  paidAt: Date | null;
  cancelledAt: Date | null;
  updatedAt: Date;
}

// 16. 쿠폰 사용 로그 모델 정의
export interface CouponUse {
  id: string;
  couponId: string;
  orderId: string;
  userId: string | null;
  createdAt: Date;
}

// 17. PG 웹훅 로그 모델 정의
export interface WebhookLog {
  id: string;
  provider: string;
  payload: string;
  signature: string | null;
  processed: boolean;
  errorMessage: string | null;
  createdAt: Date;
}

// 각 레포지토리 인터페이스 정의
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  create(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product>;
  update(id: string, product: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>): Promise<Product>;
}

export interface PriceVersionRepository {
  findById(id: string): Promise<PriceVersion | null>;
  findByProductId(productId: string): Promise<PriceVersion[]>;
  findLatestByProductId(productId: string): Promise<PriceVersion | null>;
  create(priceVersion: Omit<PriceVersion, "id" | "createdAt">): Promise<PriceVersion>;
}

export interface CouponRepository {
  findById(id: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  findAll(): Promise<Coupon[]>;
  create(coupon: Omit<Coupon, "id" | "createdAt">): Promise<Coupon>;
  update(id: string, coupon: Partial<Omit<Coupon, "id" | "createdAt">>): Promise<Coupon>;
  incrementUsedCount(id: string): Promise<boolean>; // atomically increment usedCount if < maxUses
}

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByIdempotencyKey(key: string): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  create(order: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order>;
  update(id: string, order: Partial<Omit<Order, "id" | "createdAt" | "updatedAt">>): Promise<Order>;
}

export interface CouponUseRepository {
  create(use: Omit<CouponUse, "id" | "createdAt">): Promise<CouponUse>;
  findByCouponId(couponId: string): Promise<CouponUse[]>;
  findByOrderId(orderId: string): Promise<CouponUse | null>;
}

export interface WebhookLogRepository {
  create(log: Omit<WebhookLog, "id" | "createdAt">): Promise<WebhookLog>;
  update(id: string, log: Partial<Omit<WebhookLog, "id" | "createdAt">>): Promise<WebhookLog>;
  findAll(): Promise<WebhookLog[]>;
}

// ==========================================
// Phase 8: 추가 모델 정의 (신고, 감사로그, 정책 버전)
// ==========================================

export interface UserReport {
  id: string;
  reportType: "calculation_error" | "result_sentence" | "privacy" | "payment" | "content_error";
  orderId: string | null;
  errorCode: string | null;
  versionInfo: string | null;
  content: string;
  status: "pending" | "resolved" | "ignored";
  createdAt: Date;
  resolvedAt: Date | null;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface PolicyVersion {
  id: string;
  title: string;
  version: string;
  content: string;
  active: boolean;
  createdAt: Date;
}

export interface UserReportRepository {
  findById(id: string): Promise<UserReport | null>;
  findAll(): Promise<UserReport[]>;
  create(report: Omit<UserReport, "id" | "createdAt" | "status" | "resolvedAt">): Promise<UserReport>;
  update(id: string, fields: Partial<Omit<UserReport, "id" | "createdAt">>): Promise<UserReport>;
}

export interface AuditLogRepository {
  create(log: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog>;
  findAll(): Promise<AuditLog[]>;
}

export interface PolicyVersionRepository {
  findById(id: string): Promise<PolicyVersion | null>;
  findAll(): Promise<PolicyVersion[]>;
  create(policy: Omit<PolicyVersion, "id" | "createdAt">): Promise<PolicyVersion>;
  update(id: string, fields: Partial<Omit<PolicyVersion, "id" | "createdAt">>): Promise<PolicyVersion>;
}

// 4. 추상화된 트랜잭션 및 DB 컨텍스트
export interface DbContext {
  users: UserRepository;
  sessions: SessionRepository;
  profiles: BirthProfileRepository;
  caches: ChartCacheRepository;
  interpretations: InterpretationResultRepository;
  sharedLinks: SharedLinkRepository;
  authors: AuthorRepository;
  contents: ContentRepository;
  adPlacements: AdPlacementRepository;
  adAuditLogs: AdAuditLogRepository;
  analyticsLogs: AnalyticsLogRepository;
  products: ProductRepository;
  priceVersions: PriceVersionRepository;
  coupons: CouponRepository;
  orders: OrderRepository;
  couponUses: CouponUseRepository;
  webhookLogs: WebhookLogRepository;
  // Phase 8 추가 레포지토리
  userReports: UserReportRepository;
  auditLogs: AuditLogRepository;
  policyVersions: PolicyVersionRepository;
}
