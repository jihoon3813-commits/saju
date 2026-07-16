import { randomUUID } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { BirthProfile } from "@/schemas/fortune";
import { 
  DbContext,
  UserRepository,
  SessionRepository,
  BirthProfileRepository,
  ChartCacheRepository,
  InterpretationResultRepository,
  SharedLinkRepository,
  AuthorRepository,
  ContentRepository,
  AdPlacementRepository,
  AdAuditLogRepository,
  AnalyticsLogRepository,
  ProductRepository,
  PriceVersionRepository,
  CouponRepository,
  OrderRepository,
  CouponUseRepository,
  WebhookLogRepository,
  UserReportRepository,
  AuditLogRepository,
  PolicyVersionRepository,
  User,
  UserSession,
  ChartCache,
  InterpretationResult,
  SharedLink,
  Author,
  Content,
  AdPlacement,
  AdAuditLog,
  AnalyticsLog,
  Product,
  PriceVersion,
  Coupon,
  Order,
  CouponUse,
  WebhookLog as DbWebhookLog,
  UserReport,
  AuditLog,
  PolicyVersion
} from "./types";
import { ChartResult } from "@/lib/manse/types";

// 1. Convex 클라이언트 인스턴스화
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "http://localhost:5173";
const client: any = new ConvexHttpClient(convexUrl);

// 2. 날짜 파싱 필드 캐시 집합
const DATE_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "deletedAt",
  "expiresAt",
  "paidAt",
  "cancelledAt",
  "refundedAt",
  "generatedAt",
  "resolvedAt",
  "publishedAt"
]);

// 3. 도메인 <-> Convex 데이터 포맷 직렬화 헬퍼
function toConvex(val: any): any {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (val instanceof Date) return val.getTime();
  if (Array.isArray(val)) return val.map(toConvex);
  if (typeof val === "object") {
    const copy: any = {};
    for (const k of Object.keys(val)) {
      copy[k] = toConvex(val[k]);
    }
    return copy;
  }
  return val;
}

function fromConvex<T>(val: any): T {
  if (val === undefined) return undefined as any;
  if (val === null) return null as any;
  if (Array.isArray(val)) return val.map(fromConvex) as any;
  if (typeof val === "object") {
    const { _id, _creationTime, ...rest } = val;
    const copy: any = {};
    for (const k of Object.keys(rest)) {
      if (DATE_FIELDS.has(k) && typeof rest[k] === "number") {
        copy[k] = new Date(rest[k]);
      } else {
        copy[k] = fromConvex(rest[k]);
      }
    }
    return copy;
  }
  return val;
}

function toConvexDoc(table: string, doc: any): any {
  const copy = { ...doc };
  if (table === "caches" && copy.chartResult && typeof copy.chartResult !== "string") {
    copy.chartResult = JSON.stringify(copy.chartResult);
  }
  if (table === "interpretations" && copy.reportData && typeof copy.reportData !== "string") {
    copy.reportData = JSON.stringify(copy.reportData);
  }
  if (table === "contents" && copy.contextVariables && typeof copy.contextVariables !== "string") {
    copy.contextVariables = JSON.stringify(copy.contextVariables);
  }
  return toConvex(copy);
}

function fromConvexDoc(table: string, doc: any): any {
  if (!doc) return null;
  const parsed = fromConvex<any>(doc);
  if (table === "caches" && typeof parsed.chartResult === "string") {
    try {
      parsed.chartResult = JSON.parse(parsed.chartResult);
    } catch (e) {}
  }
  if (table === "interpretations" && typeof parsed.reportData === "string") {
    try {
      parsed.reportData = JSON.parse(parsed.reportData);
    } catch (e) {}
  }
  if (table === "contents" && typeof parsed.contextVariables === "string") {
    try {
      parsed.contextVariables = JSON.parse(parsed.contextVariables);
    } catch (e) {}
  }
  return parsed;
}

// 4. 개별 레포지토리 구현

class ConvexUserRepository implements UserRepository {
  async findById(id: string) {
    const res = await client.query("crud:getById", { table: "users", id });
    return fromConvexDoc("users", res);
  }
  async findByEmail(email: string) {
    const res = await client.query("crud:getByField", { table: "users", field: "email", value: email });
    return fromConvexDoc("users", res);
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "users" });
    return res.map((r: any) => fromConvexDoc("users", r));
  }
  async create(user: any) {
    const id = randomUUID();
    const document = toConvexDoc("users", {
      id,
      ...user,
      role: user.role || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    });
    const res = await client.mutation("crud:create", { table: "users", document });
    return fromConvexDoc("users", res);
  }
  async update(id: string, user: any) {
    const fields = toConvexDoc("users", { ...user, updatedAt: new Date() });
    const res = await client.mutation("crud:update", { table: "users", id, fields });
    return fromConvexDoc("users", res);
  }
  async delete(id: string) {
    await client.mutation("crud:update", { table: "users", id, fields: { deletedAt: Date.now() } });
  }
  async hardDelete(id: string) {
    await client.mutation("crud:remove", { table: "users", id });
  }
}

class ConvexSessionRepository implements SessionRepository {
  async create(userId: string, token: string, expiresAt: Date) {
    const id = randomUUID();
    const document = toConvexDoc("sessions", { id, userId, token, expiresAt, createdAt: new Date() });
    const res = await client.mutation("crud:create", { table: "sessions", document });
    return fromConvexDoc("sessions", res);
  }
  async findByToken(token: string) {
    const res = await client.query("crud:getByField", { table: "sessions", field: "token", value: token });
    return fromConvexDoc("sessions", res);
  }
  async deleteByToken(token: string) {
    const session = await this.findByToken(token);
    if (session) {
      await client.mutation("crud:remove", { table: "sessions", id: session.id });
    }
  }
  async deleteExpired() {
    const list = await client.query("crud:findAll", { table: "sessions" });
    const now = Date.now();
    let count = 0;
    for (const s of list) {
      if (s.expiresAt < now) {
        await client.mutation("crud:remove", { table: "sessions", id: s.id });
        count++;
      }
    }
    return count;
  }
}

class ConvexBirthProfileRepository implements BirthProfileRepository {
  async findById(id: string) {
    const res = await client.query("crud:getById", { table: "profiles", id });
    const p = fromConvexDoc("profiles", res);
    return p && p.deletedAt === null ? p : null;
  }
  async findByUserId(userId: string) {
    const res = await client.query("crud:getByField", { table: "profiles", field: "userId", value: userId });
    return res.map((r: any) => fromConvexDoc("profiles", r)).filter((p: any) => p.deletedAt === null);
  }
  async findByAnonymousSessionId(sessionId: string) {
    const res = await client.query("crud:getByField", { table: "profiles", field: "anonymousSessionId", value: sessionId });
    return res.map((r: any) => fromConvexDoc("profiles", r)).filter((p: any) => p.deletedAt === null);
  }
  async create(profile: any) {
    const id = randomUUID();
    const document = toConvexDoc("profiles", {
      id,
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    });
    const res = await client.mutation("crud:create", { table: "profiles", document });
    return fromConvexDoc("profiles", res);
  }
  async update(id: string, profile: any) {
    const fields = toConvexDoc("profiles", { ...profile, updatedAt: new Date() });
    const res = await client.mutation("crud:update", { table: "profiles", id, fields });
    return fromConvexDoc("profiles", res);
  }
  async delete(id: string) {
    await client.mutation("crud:update", { table: "profiles", id, fields: { deletedAt: Date.now() } });
  }
  async hardDelete(id: string) {
    await client.mutation("crud:remove", { table: "profiles", id });
  }
  async linkAnonymousToUser(anonymousSessionId: string, userId: string) {
    return await client.mutation("crud:linkAnonymousToUser", { anonymousSessionId, userId });
  }
}

class ConvexChartCacheRepository implements ChartCacheRepository {
  async find(inputHash: string, engineVersion: string) {
    const res = await client.query("crud:getByFields", {
      table: "caches",
      criteria: [
        { field: "inputHash", value: inputHash },
        { field: "engineVersion", value: engineVersion }
      ]
    });
    const item = res[0] ? fromConvexDoc("caches", res[0]) : null;
    return item ? item.chartResult : null;
  }
  async create(inputHash: string, engineVersion: string, chartResult: ChartResult) {
    const id = randomUUID();
    const document = toConvexDoc("caches", { id, inputHash, engineVersion, chartResult, createdAt: new Date() });
    await client.mutation("crud:create", { table: "caches", document });
  }
}

class ConvexInterpretationResultRepository implements InterpretationResultRepository {
  async findById(id: string) {
    const res = await client.query("crud:getById", { table: "interpretations", id });
    return fromConvexDoc("interpretations", res);
  }
  async findByQuery(
    profileId: string,
    serviceType: string,
    chartHash: string,
    engineVersion: string,
    ruleVersion: string,
    promptVersion: string
  ) {
    const res = await client.query("crud:getByFields", {
      table: "interpretations",
      criteria: [
        { field: "profileId", value: profileId },
        { field: "serviceType", value: serviceType },
        { field: "chartHash", value: chartHash },
        { field: "engineVersion", value: engineVersion },
        { field: "ruleVersion", value: ruleVersion },
        { field: "promptVersion", value: promptVersion }
      ]
    });
    return res[0] ? fromConvexDoc("interpretations", res[0]) : null;
  }
  async create(result: any) {
    const id = randomUUID();
    const document = toConvexDoc("interpretations", { id, ...result, generatedAt: new Date() });
    const res = await client.mutation("crud:create", { table: "interpretations", document });
    return fromConvexDoc("interpretations", res);
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "interpretations" });
    return res.map((r: any) => fromConvexDoc("interpretations", r));
  }
}

class ConvexSharedLinkRepository implements SharedLinkRepository {
  async findById(id: string) {
    const res = await client.query("crud:getById", { table: "sharedLinks", id });
    return fromConvexDoc("sharedLinks", res);
  }
  async create(link: any) {
    const id = randomUUID();
    const document = toConvexDoc("sharedLinks", { id, ...link, createdAt: new Date() });
    const res = await client.mutation("crud:create", { table: "sharedLinks", document });
    return fromConvexDoc("sharedLinks", res);
  }
  async delete(id: string) {
    await client.mutation("crud:remove", { table: "sharedLinks", id });
  }
}

class ConvexAuthorRepository implements AuthorRepository {
  async findById(id: string) {
    const res = await client.query("crud:getById", { table: "authors", id });
    return fromConvexDoc("authors", res);
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "authors" });
    return res.map((r: any) => fromConvexDoc("authors", r));
  }
  async create(author: any) {
    const id = randomUUID();
    const document = toConvexDoc("authors", { id, ...author, createdAt: new Date() });
    const res = await client.mutation("crud:create", { table: "authors", document });
    return fromConvexDoc("authors", res);
  }
}

class ConvexContentRepository implements ContentRepository {
  async findById(id: string) {
    const res = await client.query("crud:getById", { table: "contents", id });
    const c = fromConvexDoc("contents", res);
    return c && c.deletedAt === null ? c : null;
  }
  async findBySlug(slug: string) {
    const res = await client.query("crud:getByField", { table: "contents", field: "slug", value: slug });
    const c = fromConvexDoc("contents", res);
    return c && c.deletedAt === null ? c : null;
  }
  async findByType(type: string, status?: string) {
    let res;
    if (status) {
      res = await client.query("crud:getByFields", {
        table: "contents",
        criteria: [
          { field: "type", value: type },
          { field: "status", value: status }
        ]
      });
    } else {
      res = await client.query("crud:getByField", { table: "contents", field: "type", value: type });
    }
    return res.map((r: any) => fromConvexDoc("contents", r)).filter((c: any) => c.deletedAt === null);
  }
  async findByQuery(filter: { type?: string; category?: string; status?: string; searchTerm?: string }) {
    const res = await client.query("crud:findAll", { table: "contents" });
    let list: Content[] = res.map((r: any) => fromConvexDoc("contents", r)).filter((c: any) => c.deletedAt === null);
    if (filter.type) list = list.filter((c: Content) => c.type === filter.type);
    if (filter.category) list = list.filter((c: Content) => c.category === filter.category);
    if (filter.status) list = list.filter((c: Content) => c.status === filter.status);
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      list = list.filter((c: Content) => c.title.toLowerCase().includes(term) || c.body.toLowerCase().includes(term));
    }
    return list;
  }
  async create(content: any) {
    const id = randomUUID();
    const document = toConvexDoc("contents", {
      id,
      ...content,
      revision: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    });
    const res = await client.mutation("crud:create", { table: "contents", document });
    return fromConvexDoc("contents", res);
  }
  async update(id: string, content: any) {
    const existing = await this.findById(id);
    const newRevision = existing ? (existing.revision || 1) + 1 : 1;
    const fields = toConvexDoc("contents", { ...content, revision: newRevision, updatedAt: new Date() });
    const res = await client.mutation("crud:update", { table: "contents", id, fields });
    return fromConvexDoc("contents", res);
  }
  async delete(id: string) {
    await client.mutation("crud:update", { table: "contents", id, fields: { deletedAt: Date.now() } });
  }
  async checkSlugExists(slug: string, excludeId?: string) {
    const existing = await this.findBySlug(slug);
    if (!existing) return false;
    if (excludeId && existing.id === excludeId) return false;
    return true;
  }
}

class ConvexAdPlacementRepository implements AdPlacementRepository {
  async findById(id: string) {
    const res = await client.query("crud:getById", { table: "adPlacements", id });
    return fromConvexDoc("adPlacements", res);
  }
  async findBySlotKey(slotKey: string) {
    const res = await client.query("crud:getByField", { table: "adPlacements", field: "slotKey", value: slotKey });
    return fromConvexDoc("adPlacements", res);
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "adPlacements" });
    return res.map((r: any) => fromConvexDoc("adPlacements", r));
  }
  async create(placement: any) {
    const id = randomUUID();
    const document = toConvexDoc("adPlacements", { id, ...placement, createdAt: new Date(), updatedAt: new Date() });
    const res = await client.mutation("crud:create", { table: "adPlacements", document });
    return fromConvexDoc("adPlacements", res);
  }
  async update(id: string, placement: any) {
    const fields = toConvexDoc("adPlacements", { ...placement, updatedAt: new Date() });
    const res = await client.mutation("crud:update", { table: "adPlacements", id, fields });
    return fromConvexDoc("adPlacements", res);
  }
  async delete(id: string) {
    await client.mutation("crud:remove", { table: "adPlacements", id });
  }
}

class ConvexAdAuditLogRepository implements AdAuditLogRepository {
  async create(log: any) {
    const id = randomUUID();
    const document = toConvexDoc("adAuditLogs", { id, ...log, createdAt: new Date() });
    const res = await client.mutation("crud:create", { table: "adAuditLogs", document });
    return fromConvexDoc("adAuditLogs", res);
  }
  async findByPlacementId(placementId: string) {
    const res = await client.query("crud:getByField", { table: "adAuditLogs", field: "placementId", value: placementId });
    return res.map((r: any) => fromConvexDoc("adAuditLogs", r));
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "adAuditLogs" });
    return res.map((r: any) => fromConvexDoc("adAuditLogs", r));
  }
}

class ConvexAnalyticsLogRepository implements AnalyticsLogRepository {
  async create(log: any) {
    const id = randomUUID();
    const document = toConvexDoc("analyticsLogs", { id, ...log, createdAt: new Date() });
    const res = await client.mutation("crud:create", { table: "analyticsLogs", document });
    return fromConvexDoc("analyticsLogs", res);
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "analyticsLogs" });
    return res.map((r: any) => fromConvexDoc("analyticsLogs", r));
  }
  async findByEventName(eventName: string) {
    const res = await client.query("crud:getByField", { table: "analyticsLogs", field: "eventName", value: eventName });
    return res.map((r: any) => fromConvexDoc("analyticsLogs", r));
  }
  async findBySessionId(sessionId: string) {
    const res = await client.query("crud:getByField", { table: "analyticsLogs", field: "sessionId", value: sessionId });
    return res.map((r: any) => fromConvexDoc("analyticsLogs", r));
  }
}

class ConvexProductRepository implements ProductRepository {
  async findById(id: string) {
    const res = await client.query("crud:getById", { table: "products", id });
    return fromConvexDoc("products", res);
  }
  async findBySlug(slug: string) {
    const res = await client.query("crud:getByField", { table: "products", field: "slug", value: slug });
    return fromConvexDoc("products", res);
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "products" });
    return res.map((r: any) => fromConvexDoc("products", r));
  }
  async create(product: any) {
    const id = randomUUID();
    const document = toConvexDoc("products", { id, ...product, createdAt: new Date(), updatedAt: new Date() });
    const res = await client.mutation("crud:create", { table: "products", document });
    return fromConvexDoc("products", res);
  }
  async update(id: string, product: any) {
    const fields = toConvexDoc("products", { ...product, updatedAt: new Date() });
    const res = await client.mutation("crud:update", { table: "products", id, fields });
    return fromConvexDoc("products", res);
  }
}

class ConvexPriceVersionRepository implements PriceVersionRepository {
  async findById(id: string): Promise<PriceVersion | null> {
    const res = await client.query("crud:getById", { table: "priceVersions", id });
    return fromConvexDoc("priceVersions", res);
  }
  async findByProductId(productId: string): Promise<PriceVersion[]> {
    const res = await client.query("crud:getByField", { table: "priceVersions", field: "productId", value: productId });
    return res.map((r: any) => fromConvexDoc("priceVersions", r));
  }
  async findLatestByProductId(productId: string): Promise<PriceVersion | null> {
    const list = await this.findByProductId(productId);
    if (list.length === 0) return null;
    return list.sort((a: PriceVersion, b: PriceVersion) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }
  async create(priceVersion: any): Promise<PriceVersion> {
    const id = randomUUID();
    const document = toConvexDoc("priceVersions", { id, ...priceVersion, createdAt: new Date() });
    const res = await client.mutation("crud:create", { table: "priceVersions", document });
    return fromConvexDoc("priceVersions", res);
  }
}

class ConvexCouponRepository implements CouponRepository {
  async findById(id: string) {
    const res = await client.query("crud:getById", { table: "coupons", id });
    return fromConvexDoc("coupons", res);
  }
  async findByCode(code: string) {
    const res = await client.query("crud:getByField", { table: "coupons", field: "code", value: code.toUpperCase() });
    return fromConvexDoc("coupons", res);
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "coupons" });
    return res.map((r: any) => fromConvexDoc("coupons", r));
  }
  async create(coupon: any) {
    const id = randomUUID();
    const document = toConvexDoc("coupons", { id, ...coupon, code: coupon.code.toUpperCase(), createdAt: new Date() });
    const res = await client.mutation("crud:create", { table: "coupons", document });
    return fromConvexDoc("coupons", res);
  }
  async update(id: string, coupon: any) {
    const fields = toConvexDoc("coupons", coupon);
    const res = await client.mutation("crud:update", { table: "coupons", id, fields });
    return fromConvexDoc("coupons", res);
  }
  async incrementUsedCount(id: string) {
    return await client.mutation("crud:incrementCouponUses", { id });
  }
}

class ConvexOrderRepository implements OrderRepository {
  async findById(id: string) {
    const res = await client.query("crud:getById", { table: "orders", id });
    return fromConvexDoc("orders", res);
  }
  async findByIdempotencyKey(key: string) {
    const res = await client.query("crud:getByField", { table: "orders", field: "idempotencyKey", value: key });
    return fromConvexDoc("orders", res);
  }
  async findByUserId(userId: string) {
    const res = await client.query("crud:getByField", { table: "orders", field: "userId", value: userId });
    return res.map((r: any) => fromConvexDoc("orders", r));
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "orders" });
    return res.map((r: any) => fromConvexDoc("orders", r));
  }
  async create(order: any) {
    const id = randomUUID();
    const document = toConvexDoc("orders", { id, ...order, createdAt: new Date(), updatedAt: new Date() });
    const res = await client.mutation("crud:create", { table: "orders", document });
    return fromConvexDoc("orders", res);
  }
  async update(id: string, order: any) {
    const fields = toConvexDoc("orders", { ...order, updatedAt: new Date() });
    const res = await client.mutation("crud:update", { table: "orders", id, fields });
    return fromConvexDoc("orders", res);
  }
}

class ConvexCouponUseRepository implements CouponUseRepository {
  async create(use: any) {
    const id = randomUUID();
    const document = toConvexDoc("couponUses", { id, ...use, createdAt: new Date() });
    const res = await client.mutation("crud:create", { table: "couponUses", document });
    return fromConvexDoc("couponUses", res);
  }
  async findByCouponId(couponId: string) {
    const res = await client.query("crud:getByField", { table: "couponUses", field: "couponId", value: couponId });
    return res.map((r: any) => fromConvexDoc("couponUses", r));
  }
  async findByOrderId(orderId: string) {
    const res = await client.query("crud:getByField", { table: "couponUses", field: "orderId", value: orderId });
    return res[0] ? fromConvexDoc("couponUses", res[0]) : null;
  }
}

class ConvexWebhookLogRepository implements WebhookLogRepository {
  async create(log: any) {
    const id = randomUUID();
    const document = toConvexDoc("webhookLogs", { id, ...log, createdAt: new Date() });
    const res = await client.mutation("crud:create", { table: "webhookLogs", document });
    return fromConvexDoc("webhookLogs", res);
  }
  async update(id: string, log: any) {
    const fields = toConvexDoc("webhookLogs", log);
    const res = await client.mutation("crud:update", { table: "webhookLogs", id, fields });
    return fromConvexDoc("webhookLogs", res);
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "webhookLogs" });
    return res.map((r: any) => fromConvexDoc("webhookLogs", r));
  }
}

class ConvexUserReportRepository implements UserReportRepository {
  async findById(id: string) {
    const res = await client.query("crud:getById", { table: "userReports", id });
    return fromConvexDoc("userReports", res);
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "userReports" });
    return res.map((r: any) => fromConvexDoc("userReports", r));
  }
  async create(report: any) {
    const id = randomUUID();
    const document = toConvexDoc("userReports", { id, ...report, status: "pending", createdAt: new Date(), resolvedAt: null });
    const res = await client.mutation("crud:create", { table: "userReports", document });
    return fromConvexDoc("userReports", res);
  }
  async update(id: string, fields: any) {
    const convexFields = toConvexDoc("userReports", fields);
    const res = await client.mutation("crud:update", { table: "userReports", id, fields: convexFields });
    return fromConvexDoc("userReports", res);
  }
}

class ConvexAuditLogRepository implements AuditLogRepository {
  async create(log: any) {
    const id = randomUUID();
    const document = toConvexDoc("auditLogs", { id, ...log, createdAt: new Date() });
    const res = await client.mutation("crud:create", { table: "auditLogs", document });
    return fromConvexDoc("auditLogs", res);
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "auditLogs" });
    return res.map((r: any) => fromConvexDoc("auditLogs", r));
  }
}

class ConvexPolicyVersionRepository implements PolicyVersionRepository {
  async findById(id: string) {
    const res = await client.query("crud:getById", { table: "policyVersions", id });
    return fromConvexDoc("policyVersions", res);
  }
  async findAll() {
    const res = await client.query("crud:findAll", { table: "policyVersions" });
    return res.map((r: any) => fromConvexDoc("policyVersions", r));
  }
  async create(policy: any) {
    const id = randomUUID();
    const document = toConvexDoc("policyVersions", { id, ...policy, createdAt: new Date() });
    const res = await client.mutation("crud:create", { table: "policyVersions", document });
    return fromConvexDoc("policyVersions", res);
  }
  async update(id: string, fields: any) {
    const convexFields = toConvexDoc("policyVersions", fields);
    const res = await client.mutation("crud:update", { table: "policyVersions", id, fields: convexFields });
    return fromConvexDoc("policyVersions", res);
  }
}

// 5. 통합 DbContext 객체 인스턴스화
export const convexDb: DbContext = {
  users: new ConvexUserRepository(),
  sessions: new ConvexSessionRepository(),
  profiles: new ConvexBirthProfileRepository(),
  caches: new ConvexChartCacheRepository(),
  interpretations: new ConvexInterpretationResultRepository(),
  sharedLinks: new ConvexSharedLinkRepository(),
  authors: new ConvexAuthorRepository(),
  contents: new ConvexContentRepository(),
  adPlacements: new ConvexAdPlacementRepository(),
  adAuditLogs: new ConvexAdAuditLogRepository(),
  analyticsLogs: new ConvexAnalyticsLogRepository(),
  products: new ConvexProductRepository(),
  priceVersions: new ConvexPriceVersionRepository(),
  coupons: new ConvexCouponRepository(),
  orders: new ConvexOrderRepository(),
  couponUses: new ConvexCouponUseRepository(),
  webhookLogs: new ConvexWebhookLogRepository(),
  userReports: new ConvexUserReportRepository(),
  auditLogs: new ConvexAuditLogRepository(),
  policyVersions: new ConvexPolicyVersionRepository()
};
