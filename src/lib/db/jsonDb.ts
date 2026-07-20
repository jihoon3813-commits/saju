/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import { BirthProfile } from "@/schemas/fortune";
import { ChartResult } from "@/lib/manse/types";
import {
  User,
  UserSession,
  UserRepository,
  SessionRepository,
  BirthProfileRepository,
  ChartCacheRepository,
  ChartCache,
  InterpretationResult,
  SharedLink,
  InterpretationResultRepository,
  SharedLinkRepository,
  Author,
  Content,
  AuthorRepository,
  ContentRepository,
  DbContext,
  AdPlacement,
  AdPlacementRepository,
  AdAuditLog,
  AdAuditLogRepository,
  AnalyticsLog,
  AnalyticsLogRepository,
  Product,
  ProductRepository,
  PriceVersion,
  PriceVersionRepository,
  Coupon,
  CouponRepository,
  Order,
  OrderRepository,
  CouponUse,
  CouponUseRepository,
  WebhookLog,
  WebhookLogRepository,
  UserReport,
  UserReportRepository,
  AuditLog,
  AuditLogRepository,
  PolicyVersion,
  PolicyVersionRepository
} from "./types";

const DB_FILE_PATH = path.join(process.cwd(), "local_db.json");

interface LocalSchema {
  users: any[];
  sessions: any[];
  profiles: any[];
  chart_caches: any[];
  interpretation_results: any[];
  shared_links: any[];
  authors: any[];
  contents: any[];
  ad_placements: any[];
  ad_audit_logs: any[];
  analytics_logs: any[];
  products: any[];
  price_versions: any[];
  coupons: any[];
  orders: any[];
  coupon_uses: any[];
  webhook_logs: any[];
  user_reports: any[];
  audit_logs: any[];
  policy_versions: any[];
  migration_history: string[];
}

// 1. 공통 파일 I/O 및 파싱 헬퍼
function readDb(): LocalSchema {
  if (!fs.existsSync(DB_FILE_PATH)) {
    const initial: LocalSchema = {
      users: [],
      sessions: [],
      profiles: [],
      chart_caches: [],
      interpretation_results: [],
      shared_links: [],
      authors: [],
      contents: [],
      ad_placements: [],
      ad_audit_logs: [],
      analytics_logs: [],
      products: [],
      price_versions: [],
      coupons: [],
      orders: [],
      coupon_uses: [],
      webhook_logs: [],
      user_reports: [],
      audit_logs: [],
      policy_versions: [],
      migration_history: []
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    
    // 기본 배열 검사 및 보정
    if (!parsed.chart_caches) parsed.chart_caches = [];
    if (!parsed.interpretation_results) parsed.interpretation_results = [];
    if (!parsed.shared_links) parsed.shared_links = [];
    if (!parsed.authors) parsed.authors = [];
    if (!parsed.contents) parsed.contents = [];
    if (!parsed.ad_placements) parsed.ad_placements = [];
    if (!parsed.ad_audit_logs) parsed.ad_audit_logs = [];
    if (!parsed.analytics_logs) parsed.analytics_logs = [];
    if (!parsed.products) parsed.products = [];
    if (!parsed.price_versions) parsed.price_versions = [];
    if (!parsed.coupons) parsed.coupons = [];
    if (!parsed.orders) parsed.orders = [];
    if (!parsed.coupon_uses) parsed.coupon_uses = [];
    if (!parsed.webhook_logs) parsed.webhook_logs = [];
    if (!parsed.user_reports) parsed.user_reports = [];
    if (!parsed.audit_logs) parsed.audit_logs = [];
    if (!parsed.policy_versions) parsed.policy_versions = [];
    
    // 날짜 문자열들을 Date 객체로 환원
    parsed.users = parsed.users.map((u: any) => ({
      ...u,
      role: u.role || "user",
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
      deletedAt: u.deletedAt ? new Date(u.deletedAt) : null
    }));

    parsed.sessions = parsed.sessions.map((s: any) => ({
      ...s,
      expiresAt: new Date(s.expiresAt),
      createdAt: new Date(s.createdAt)
    }));

    parsed.profiles = parsed.profiles.map((p: any) => ({
      ...p,
      createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
      deletedAt: p.deletedAt ? new Date(p.deletedAt) : null
    }));

    parsed.interpretation_results = parsed.interpretation_results.map((ir: any) => ({
      ...ir,
      generatedAt: new Date(ir.generatedAt)
    }));

    parsed.shared_links = parsed.shared_links.map((sl: any) => ({
      ...sl,
      expiresAt: new Date(sl.expiresAt),
      createdAt: new Date(sl.createdAt)
    }));

    parsed.authors = parsed.authors.map((a: any) => ({
      ...a,
      createdAt: new Date(a.createdAt)
    }));

    parsed.contents = parsed.contents.map((c: any) => ({
      ...c,
      publishedAt: c.publishedAt ? new Date(c.publishedAt) : null,
      updatedAt: new Date(c.updatedAt),
      createdAt: new Date(c.createdAt),
      deletedAt: c.deletedAt ? new Date(c.deletedAt) : null
    }));

    parsed.ad_placements = parsed.ad_placements.map((ap: any) => ({
      ...ap,
      createdAt: new Date(ap.createdAt),
      updatedAt: new Date(ap.updatedAt)
    }));

    parsed.ad_audit_logs = parsed.ad_audit_logs.map((al: any) => ({
      ...al,
      createdAt: new Date(al.createdAt)
    }));

    parsed.analytics_logs = parsed.analytics_logs.map((al: any) => ({
      ...al,
      createdAt: new Date(al.createdAt)
    }));

    parsed.products = parsed.products.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt)
    }));

    parsed.price_versions = parsed.price_versions.map((pv: any) => ({
      ...pv,
      createdAt: new Date(pv.createdAt)
    }));

    parsed.coupons = parsed.coupons.map((c: any) => ({
      ...c,
      expiresAt: new Date(c.expiresAt),
      createdAt: new Date(c.createdAt)
    }));

    parsed.orders = parsed.orders.map((o: any) => ({
      ...o,
      createdAt: new Date(o.createdAt),
      paidAt: o.paidAt ? new Date(o.paidAt) : null,
      cancelledAt: o.cancelledAt ? new Date(o.cancelledAt) : null,
      refundedAt: o.refundedAt ? new Date(o.refundedAt) : null,
      updatedAt: new Date(o.updatedAt)
    }));

    parsed.coupon_uses = parsed.coupon_uses.map((cu: any) => ({
      ...cu,
      createdAt: new Date(cu.createdAt)
    }));

    parsed.webhook_logs = parsed.webhook_logs.map((wl: any) => ({
      ...wl,
      createdAt: new Date(wl.createdAt)
    }));

    parsed.user_reports = parsed.user_reports.map((ur: any) => ({
      ...ur,
      createdAt: new Date(ur.createdAt),
      resolvedAt: ur.resolvedAt ? new Date(ur.resolvedAt) : null
    }));

    parsed.audit_logs = parsed.audit_logs.map((al: any) => ({
      ...al,
      createdAt: new Date(al.createdAt)
    }));

    parsed.policy_versions = parsed.policy_versions.map((pv: any) => ({
      ...pv,
      createdAt: new Date(pv.createdAt)
    }));

    return parsed;
  } catch (err) {
    console.error("Local JSON DB Parse Error:", err);
    return {
      users: [],
      sessions: [],
      profiles: [],
      chart_caches: [],
      interpretation_results: [],
      shared_links: [],
      authors: [],
      contents: [],
      ad_placements: [],
      ad_audit_logs: [],
      analytics_logs: [],
      products: [],
      price_versions: [],
      coupons: [],
      orders: [],
      coupon_uses: [],
      webhook_logs: [],
      user_reports: [],
      audit_logs: [],
      policy_versions: [],
      migration_history: []
    };
  }
}

function writeDb(data: LocalSchema) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Local JSON DB Write Error:", err);
  }
}

// UUID 생성기 모형
function generateUuid(): string {
  return crypto.randomUUID();
}

// 2. UserRepository 구현
class JsonUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const db = readDb();
    const user = db.users.find((u) => u.id === id && u.deletedAt === null);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = readDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.deletedAt === null);
    return user || null;
  }

  async findAll(): Promise<User[]> {
    const db = readDb();
    return db.users.filter((u) => u.deletedAt === null);
  }

  async create(user: Omit<User, "id" | "role" | "createdAt" | "updatedAt" | "deletedAt"> & { role?: "user" | "admin" }): Promise<User> {
    const db = readDb();
    
    // 이메일 중복 검사
    const exists = db.users.some((u) => u.email.toLowerCase() === user.email.toLowerCase() && u.deletedAt === null);
    if (exists) {
      throw new Error("이미 존재하는 이메일 주소입니다.");
    }

    const newUser: User = {
      id: generateUuid(),
      email: user.email,
      passwordHash: user.passwordHash,
      provider: user.provider,
      role: user.role || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    db.users.push(newUser);
    writeDb(db);
    return newUser;
  }

  async update(id: string, fields: Partial<Omit<User, "id">>): Promise<User> {
    const db = readDb();
    const index = db.users.findIndex((u) => u.id === id && u.deletedAt === null);
    if (index === -1) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    const updatedUser: User = {
      ...db.users[index],
      ...fields,
      updatedAt: new Date()
    };

    db.users[index] = updatedUser;
    writeDb(db);
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const db = readDb();
    const index = db.users.findIndex((u) => u.id === id && u.deletedAt === null);
    if (index !== -1) {
      db.users[index].deletedAt = new Date();
      db.users[index].updatedAt = new Date();
      
      // 해당 유저의 세션도 전부 강제 삭제
      db.sessions = db.sessions.filter((s) => s.userId !== id);
      
      writeDb(db);
    }
  }

  async hardDelete(id: string): Promise<void> {
    const db = readDb();
    db.users = db.users.filter((u) => u.id !== id);
    db.sessions = db.sessions.filter((s) => s.userId !== id);
    db.profiles = db.profiles.filter((p) => p.userId !== id);
    writeDb(db);
  }
}

// 3. SessionRepository 구현
class JsonSessionRepository implements SessionRepository {
  async create(userId: string, token: string, expiresAt: Date): Promise<UserSession> {
    const db = readDb();
    
    // 기존에 만료되었거나 동일 유저의 세션 제거 (기기 로그인 정리)
    db.sessions = db.sessions.filter((s) => s.userId !== userId && s.expiresAt.getTime() > Date.now());

    const newSession: UserSession = {
      id: generateUuid(),
      userId,
      token,
      expiresAt,
      createdAt: new Date()
    };

    db.sessions.push(newSession);
    writeDb(db);
    return newSession;
  }

  async findByToken(token: string): Promise<UserSession | null> {
    const db = readDb();
    const session = db.sessions.find((s) => s.token === token);
    if (!session) return null;

    // 만료 여부 확인
    if (session.expiresAt.getTime() < Date.now()) {
      await this.deleteByToken(token);
      return null;
    }

    return session;
  }

  async deleteByToken(token: string): Promise<void> {
    const db = readDb();
    db.sessions = db.sessions.filter((s) => s.token !== token);
    writeDb(db);
  }

  async deleteExpired(): Promise<number> {
    const db = readDb();
    const countBefore = db.sessions.length;
    db.sessions = db.sessions.filter((s) => s.expiresAt.getTime() > Date.now());
    const deletedCount = countBefore - db.sessions.length;
    if (deletedCount > 0) {
      writeDb(db);
    }
    return deletedCount;
  }
}

// 4. BirthProfileRepository 구현
class JsonBirthProfileRepository implements BirthProfileRepository {
  async findById(id: string): Promise<BirthProfile | null> {
    const db = readDb();
    const profile = db.profiles.find((p) => p.id === id && p.deletedAt === null);
    return profile || null;
  }

  async findByUserId(userId: string): Promise<BirthProfile[]> {
    const db = readDb();
    return db.profiles.filter((p) => p.userId === userId && p.deletedAt === null);
  }

  async findByAnonymousSessionId(sessionId: string): Promise<BirthProfile[]> {
    const db = readDb();
    return db.profiles.filter((p) => p.anonymousSessionId === sessionId && p.deletedAt === null);
  }

  async create(profile: Omit<BirthProfile, "id" | "createdAt" | "updatedAt" | "deletedAt">): Promise<BirthProfile> {
    const db = readDb();
    const newProfile: BirthProfile = {
      ...profile,
      id: generateUuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    db.profiles.push(newProfile);
    writeDb(db);
    return newProfile;
  }

  async update(id: string, fields: Partial<Omit<BirthProfile, "id">>): Promise<BirthProfile> {
    const db = readDb();
    const index = db.profiles.findIndex((p) => p.id === id && p.deletedAt === null);
    if (index === -1) {
      throw new Error("운세 프로필을 찾을 수 없습니다.");
    }

    const updatedProfile: BirthProfile = {
      ...db.profiles[index],
      ...fields,
      updatedAt: new Date()
    };

    db.profiles[index] = updatedProfile;
    writeDb(db);
    return updatedProfile;
  }

  async delete(id: string): Promise<void> {
    const db = readDb();
    const index = db.profiles.findIndex((p) => p.id === id && p.deletedAt === null);
    if (index !== -1) {
      db.profiles[index].deletedAt = new Date();
      db.profiles[index].updatedAt = new Date();
      writeDb(db);
    }
  }

  async hardDelete(id: string): Promise<void> {
    const db = readDb();
    db.profiles = db.profiles.filter((p) => p.id !== id);
    writeDb(db);
  }

  async linkAnonymousToUser(anonymousSessionId: string, userId: string): Promise<number> {
    const db = readDb();
    let count = 0;
    db.profiles = db.profiles.map((p) => {
      if (p.anonymousSessionId === anonymousSessionId && p.deletedAt === null) {
        count++;
        return {
          ...p,
          userId,
          anonymousSessionId: null, // 계정에 병합
          updatedAt: new Date()
        };
      }
      return p;
    });

    if (count > 0) {
      writeDb(db);
    }
    return count;
  }
}

// 5. ChartCacheRepository 구현
class JsonChartCacheRepository implements ChartCacheRepository {
  async find(inputHash: string, engineVersion: string): Promise<ChartResult | null> {
    const db = readDb();
    const cache = (db.chart_caches || []).find(
      (c) => c.inputHash === inputHash && c.engineVersion === engineVersion
    );
    return cache ? cache.chartResult : null;
  }

  async create(inputHash: string, engineVersion: string, chartResult: ChartResult): Promise<void> {
    const db = readDb();
    if (!db.chart_caches) {
      db.chart_caches = [];
    }
    db.chart_caches = db.chart_caches.filter(
      (c) => !(c.inputHash === inputHash && c.engineVersion === engineVersion)
    );
    const newCache: ChartCache = {
      id: generateUuid(),
      inputHash,
      engineVersion,
      chartResult,
      createdAt: new Date()
    };
    db.chart_caches.push(newCache);
    writeDb(db);
  }
}

// 5. InterpretationResultRepository 구현
class JsonInterpretationResultRepository implements InterpretationResultRepository {
  async findById(id: string): Promise<InterpretationResult | null> {
    const db = readDb();
    const result = (db.interpretation_results || []).find((r) => r.id === id);
    return result || null;
  }

  async findByQuery(
    profileId: string,
    serviceType: string,
    chartHash: string,
    engineVersion: string,
    ruleVersion: string,
    promptVersion: string
  ): Promise<InterpretationResult | null> {
    const db = readDb();
    const result = (db.interpretation_results || []).find(
      (r) =>
        r.profileId === profileId &&
        r.serviceType === serviceType &&
        r.chartHash === chartHash &&
        r.engineVersion === engineVersion &&
        r.ruleVersion === ruleVersion &&
        r.promptVersion === promptVersion
    );
    return result || null;
  }

  async create(
    result: Omit<InterpretationResult, "id" | "generatedAt">
  ): Promise<InterpretationResult> {
    const db = readDb();
    if (!db.interpretation_results) {
      db.interpretation_results = [];
    }
    const newResult: InterpretationResult = {
      id: generateUuid(),
      ...result,
      generatedAt: new Date()
    };
    db.interpretation_results.push(newResult);
    writeDb(db);
    return newResult;
  }

  async findAll(): Promise<InterpretationResult[]> {
    const db = readDb();
    return db.interpretation_results || [];
  }
}

// 6. SharedLinkRepository 구현
class JsonSharedLinkRepository implements SharedLinkRepository {
  async findById(id: string): Promise<SharedLink | null> {
    const db = readDb();
    const result = (db.shared_links || []).find((l) => l.id === id);
    return result || null;
  }

  async create(link: Omit<SharedLink, "id" | "createdAt">): Promise<SharedLink> {
    const db = readDb();
    if (!db.shared_links) {
      db.shared_links = [];
    }
    const newLink: SharedLink = {
      id: generateUuid(),
      ...link,
      createdAt: new Date()
    };
    db.shared_links.push(newLink);
    writeDb(db);
    return newLink;
  }

  async delete(id: string): Promise<void> {
    const db = readDb();
    if (!db.shared_links) return;
    db.shared_links = db.shared_links.filter((l) => l.id !== id);
    writeDb(db);
  }
}

// 8. AuthorRepository 구현
class JsonAuthorRepository implements AuthorRepository {
  async findById(id: string): Promise<Author | null> {
    const db = readDb();
    const author = (db.authors || []).find((a) => a.id === id);
    return author || null;
  }

  async findAll(): Promise<Author[]> {
    const db = readDb();
    return db.authors || [];
  }

  async create(author: Omit<Author, "id" | "createdAt">): Promise<Author> {
    const db = readDb();
    if (!db.authors) {
      db.authors = [];
    }
    const newAuthor: Author = {
      id: generateUuid(),
      ...author,
      createdAt: new Date()
    };
    db.authors.push(newAuthor);
    writeDb(db);
    return newAuthor;
  }
}

// 9. ContentRepository 구현
class JsonContentRepository implements ContentRepository {
  async findById(id: string): Promise<Content | null> {
    const db = readDb();
    const content = (db.contents || []).find((c) => c.id === id && c.deletedAt === null);
    return content || null;
  }

  async findBySlug(slug: string): Promise<Content | null> {
    const db = readDb();
    const content = (db.contents || []).find((c) => c.slug.toLowerCase() === slug.toLowerCase() && c.deletedAt === null);
    return content || null;
  }

  async findByType(type: string, status?: string): Promise<Content[]> {
    const db = readDb();
    return (db.contents || []).filter(
      (c) => c.type === type && (status ? c.status === status : true) && c.deletedAt === null
    );
  }

  async findByQuery(filter: {
    type?: string;
    category?: string;
    status?: string;
    searchTerm?: string;
  }): Promise<Content[]> {
    const db = readDb();
    let list = db.contents || [];

    if (filter.type) {
      list = list.filter((c) => c.type === filter.type);
    }
    if (filter.category) {
      list = list.filter((c) => c.category === filter.category);
    }
    if (filter.status) {
      list = list.filter((c) => c.status === filter.status);
    }
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.excerpt.toLowerCase().includes(term) ||
          c.body.toLowerCase().includes(term) ||
          (c.primarySymbol && c.primarySymbol.toLowerCase().includes(term))
      );
    }

    return list.filter((c) => c.deletedAt === null);
  }

  async create(
    content: Omit<Content, "id" | "revision" | "createdAt" | "updatedAt" | "deletedAt">
  ): Promise<Content> {
    const db = readDb();
    if (!db.contents) {
      db.contents = [];
    }

    // Slug 중복 확인
    const exists = db.contents.some((c) => c.slug.toLowerCase() === content.slug.toLowerCase() && c.deletedAt === null);
    if (exists) {
      throw new Error(`이미 존재하는 슬러그(slug)입니다: ${content.slug}`);
    }

    const newContent: Content = {
      id: generateUuid(),
      ...content,
      revision: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: content.publishedAt ? new Date(content.publishedAt) : null,
      deletedAt: null
    };

    db.contents.push(newContent);
    writeDb(db);
    return newContent;
  }

  async update(id: string, fields: Partial<Omit<Content, "id">>): Promise<Content> {
    const db = readDb();
    if (!db.contents) db.contents = [];
    const index = db.contents.findIndex((c) => c.id === id && c.deletedAt === null);
    if (index === -1) {
      throw new Error("콘텐츠를 찾을 수 없습니다.");
    }

    // Slug 변경 시 중복 검사
    if (fields.slug) {
      const exists = db.contents.some(
        (c) => c.id !== id && c.slug.toLowerCase() === fields.slug!.toLowerCase() && c.deletedAt === null
      );
      if (exists) {
        throw new Error(`이미 존재하는 슬러그(slug)입니다: ${fields.slug}`);
      }
    }

    const current = db.contents[index];
    const newRevision = (current.revision || 1) + 1;

    const updatedContent: Content = {
      ...current,
      ...fields,
      revision: newRevision,
      updatedAt: new Date(),
      publishedAt: fields.publishedAt ? new Date(fields.publishedAt) : current.publishedAt
    };

    db.contents[index] = updatedContent;
    writeDb(db);
    return updatedContent;
  }

  async delete(id: string): Promise<void> {
    const db = readDb();
    if (!db.contents) return;
    const index = db.contents.findIndex((c) => c.id === id && c.deletedAt === null);
    if (index !== -1) {
      db.contents[index].deletedAt = new Date();
      db.contents[index].updatedAt = new Date();
      writeDb(db);
    }
  }

  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const db = readDb();
    return (db.contents || []).some(
      (c) => c.slug.toLowerCase() === slug.toLowerCase() && c.id !== excludeId && c.deletedAt === null
    );
  }
}

class JsonAdPlacementRepository implements AdPlacementRepository {
  async findById(id: string): Promise<AdPlacement | null> {
    const db = readDb();
    return db.ad_placements.find((ap) => ap.id === id) || null;
  }

  async findBySlotKey(slotKey: string): Promise<AdPlacement | null> {
    const db = readDb();
    return db.ad_placements.find((ap) => ap.slotKey === slotKey) || null;
  }

  async findAll(): Promise<AdPlacement[]> {
    const db = readDb();
    return db.ad_placements || [];
  }

  async create(placement: Omit<AdPlacement, "id" | "createdAt" | "updatedAt">): Promise<AdPlacement> {
    const db = readDb();
    const newPlacement: AdPlacement = {
      ...placement,
      id: generateUuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.ad_placements.push(newPlacement);
    writeDb(db);
    return newPlacement;
  }

  async update(id: string, placement: Partial<Omit<AdPlacement, "id" | "createdAt" | "updatedAt">>): Promise<AdPlacement> {
    const db = readDb();
    const index = db.ad_placements.findIndex((ap) => ap.id === id);
    if (index === -1) {
      throw new Error("광고 배치를 찾을 수 없습니다.");
    }
    const updated: AdPlacement = {
      ...db.ad_placements[index],
      ...placement,
      updatedAt: new Date()
    };
    db.ad_placements[index] = updated;
    writeDb(db);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = readDb();
    db.ad_placements = db.ad_placements.filter((ap) => ap.id !== id);
    writeDb(db);
  }
}

class JsonAdAuditLogRepository implements AdAuditLogRepository {
  async create(log: Omit<AdAuditLog, "id" | "createdAt">): Promise<AdAuditLog> {
    const db = readDb();
    const newLog: AdAuditLog = {
      ...log,
      id: generateUuid(),
      createdAt: new Date()
    };
    db.ad_audit_logs.push(newLog);
    writeDb(db);
    return newLog;
  }

  async findByPlacementId(placementId: string): Promise<AdAuditLog[]> {
    const db = readDb();
    return db.ad_audit_logs.filter((al) => al.placementId === placementId);
  }

  async findAll(): Promise<AdAuditLog[]> {
    const db = readDb();
    return db.ad_audit_logs || [];
  }
}

class JsonAnalyticsLogRepository implements AnalyticsLogRepository {
  async create(log: Omit<AnalyticsLog, "id" | "createdAt">): Promise<AnalyticsLog> {
    const db = readDb();
    const newLog: AnalyticsLog = {
      ...log,
      id: generateUuid(),
      createdAt: new Date()
    };
    db.analytics_logs.push(newLog);
    writeDb(db);
    return newLog;
  }

  async findAll(): Promise<AnalyticsLog[]> {
    const db = readDb();
    return db.analytics_logs || [];
  }

  async findByEventName(eventName: string): Promise<AnalyticsLog[]> {
    const db = readDb();
    return (db.analytics_logs || []).filter((al) => al.eventName === eventName);
  }

  async findBySessionId(sessionId: string): Promise<AnalyticsLog[]> {
    const db = readDb();
    return (db.analytics_logs || []).filter((al) => al.sessionId === sessionId);
  }

  async clearAll(): Promise<void> {
    const db = readDb();
    db.analytics_logs = [];
    writeDb(db);
  }
}

class JsonProductRepository implements ProductRepository {
  async findById(id: string): Promise<Product | null> {
    const db = readDb();
    return db.products.find((p) => p.id === id) || null;
  }
  async findBySlug(slug: string): Promise<Product | null> {
    const db = readDb();
    return db.products.find((p) => p.slug === slug) || null;
  }
  async findAll(): Promise<Product[]> {
    const db = readDb();
    return db.products || [];
  }
  async create(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const db = readDb();
    const newProduct: Product = {
      ...product,
      id: generateUuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.products.push(newProduct);
    writeDb(db);
    return newProduct;
  }
  async update(id: string, product: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>): Promise<Product> {
    const db = readDb();
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Product not found");
    const updated = {
      ...db.products[idx],
      ...product,
      updatedAt: new Date()
    };
    db.products[idx] = updated;
    writeDb(db);
    return updated;
  }
}

class JsonPriceVersionRepository implements PriceVersionRepository {
  async findById(id: string): Promise<PriceVersion | null> {
    const db = readDb();
    return db.price_versions.find((pv) => pv.id === id) || null;
  }
  async findByProductId(productId: string): Promise<PriceVersion[]> {
    const db = readDb();
    return db.price_versions.filter((pv) => pv.productId === productId);
  }
  async findLatestByProductId(productId: string): Promise<PriceVersion | null> {
    const db = readDb();
    const list = db.price_versions.filter((pv) => pv.productId === productId);
    if (list.length === 0) return null;
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }
  async create(priceVersion: Omit<PriceVersion, "id" | "createdAt">): Promise<PriceVersion> {
    const db = readDb();
    const newPv: PriceVersion = {
      ...priceVersion,
      id: generateUuid(),
      createdAt: new Date()
    };
    db.price_versions.push(newPv);
    writeDb(db);
    return newPv;
  }
}

class JsonCouponRepository implements CouponRepository {
  async findById(id: string): Promise<Coupon | null> {
    const db = readDb();
    return db.coupons.find((c) => c.id === id) || null;
  }
  async findByCode(code: string): Promise<Coupon | null> {
    const db = readDb();
    return db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase()) || null;
  }
  async findAll(): Promise<Coupon[]> {
    const db = readDb();
    return db.coupons || [];
  }
  async create(coupon: Omit<Coupon, "id" | "createdAt">): Promise<Coupon> {
    const db = readDb();
    const newCoupon: Coupon = {
      ...coupon,
      id: generateUuid(),
      createdAt: new Date()
    };
    db.coupons.push(newCoupon);
    writeDb(db);
    return newCoupon;
  }
  async update(id: string, coupon: Partial<Omit<Coupon, "id" | "createdAt">>): Promise<Coupon> {
    const db = readDb();
    const idx = db.coupons.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Coupon not found");
    const updated = {
      ...db.coupons[idx],
      ...coupon
    };
    db.coupons[idx] = updated;
    writeDb(db);
    return updated;
  }
  async incrementUsedCount(id: string): Promise<boolean> {
    const db = readDb();
    const idx = db.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const coupon = db.coupons[idx];
    if (coupon.usedCount >= coupon.maxUses || !coupon.active || coupon.expiresAt.getTime() < Date.now()) {
      return false;
    }
    coupon.usedCount += 1;
    db.coupons[idx] = coupon;
    writeDb(db);
    return true;
  }
}

class JsonOrderRepository implements OrderRepository {
  async findById(id: string): Promise<Order | null> {
    const db = readDb();
    return db.orders.find((o) => o.id === id) || null;
  }
  async findByIdempotencyKey(key: string): Promise<Order | null> {
    const db = readDb();
    return db.orders.find((o) => o.idempotencyKey === key) || null;
  }
  async findByUserId(userId: string): Promise<Order[]> {
    const db = readDb();
    return db.orders.filter((o) => o.userId === userId);
  }
  async findAll(): Promise<Order[]> {
    const db = readDb();
    return db.orders || [];
  }
  async create(order: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order> {
    const db = readDb();
    const newOrder: Order = {
      ...order,
      id: generateUuid(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.orders.push(newOrder);
    writeDb(db);
    return newOrder;
  }
  async update(id: string, order: Partial<Omit<Order, "id" | "createdAt" | "updatedAt">>): Promise<Order> {
    const db = readDb();
    const idx = db.orders.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error("Order not found");
    const updated = {
      ...db.orders[idx],
      ...order,
      updatedAt: new Date()
    };
    db.orders[idx] = updated;
    writeDb(db);
    return updated;
  }
}

class JsonCouponUseRepository implements CouponUseRepository {
  async create(use: Omit<CouponUse, "id" | "createdAt">): Promise<CouponUse> {
    const db = readDb();
    const newUse: CouponUse = {
      ...use,
      id: generateUuid(),
      createdAt: new Date()
    };
    db.coupon_uses.push(newUse);
    writeDb(db);
    return newUse;
  }
  async findByCouponId(couponId: string): Promise<CouponUse[]> {
    const db = readDb();
    return db.coupon_uses.filter((cu) => cu.couponId === couponId);
  }
  async findByOrderId(orderId: string): Promise<CouponUse | null> {
    const db = readDb();
    return db.coupon_uses.find((cu) => cu.orderId === orderId) || null;
  }
}

class JsonWebhookLogRepository implements WebhookLogRepository {
  async create(log: Omit<WebhookLog, "id" | "createdAt">): Promise<WebhookLog> {
    const db = readDb();
    const newLog: WebhookLog = {
      ...log,
      id: generateUuid(),
      createdAt: new Date()
    };
    db.webhook_logs.push(newLog);
    writeDb(db);
    return newLog;
  }
  async update(id: string, log: Partial<Omit<WebhookLog, "id" | "createdAt">>): Promise<WebhookLog> {
    const db = readDb();
    const idx = db.webhook_logs.findIndex((wl) => wl.id === id);
    if (idx === -1) throw new Error("Webhook log not found");
    const updated = {
      ...db.webhook_logs[idx],
      ...log
    };
    db.webhook_logs[idx] = updated;
    writeDb(db);
    return updated;
  }
  async findAll(): Promise<WebhookLog[]> {
    const db = readDb();
    return db.webhook_logs || [];
  }
}

class JsonUserReportRepository implements UserReportRepository {
  async findById(id: string): Promise<UserReport | null> {
    const db = readDb();
    return db.user_reports.find((ur) => ur.id === id) || null;
  }
  async findAll(): Promise<UserReport[]> {
    const db = readDb();
    return db.user_reports || [];
  }
  async create(report: Omit<UserReport, "id" | "createdAt" | "status" | "resolvedAt">): Promise<UserReport> {
    const db = readDb();
    const newReport: UserReport = {
      ...report,
      id: generateUuid(),
      status: "pending",
      createdAt: new Date(),
      resolvedAt: null
    };
    db.user_reports.push(newReport);
    writeDb(db);
    return newReport;
  }
  async update(id: string, fields: Partial<Omit<UserReport, "id" | "createdAt">>): Promise<UserReport> {
    const db = readDb();
    const idx = db.user_reports.findIndex((ur) => ur.id === id);
    if (idx === -1) throw new Error("User report not found");
    const updated: UserReport = {
      ...db.user_reports[idx],
      ...fields
    };
    db.user_reports[idx] = updated;
    writeDb(db);
    return updated;
  }
}

class JsonAuditLogRepository implements AuditLogRepository {
  async create(log: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> {
    const db = readDb();
    const newLog: AuditLog = {
      ...log,
      id: generateUuid(),
      createdAt: new Date()
    };
    db.audit_logs.push(newLog);
    writeDb(db);
    return newLog;
  }
  async findAll(): Promise<AuditLog[]> {
    const db = readDb();
    return db.audit_logs || [];
  }
}

class JsonPolicyVersionRepository implements PolicyVersionRepository {
  async findById(id: string): Promise<PolicyVersion | null> {
    const db = readDb();
    return db.policy_versions.find((pv) => pv.id === id) || null;
  }
  async findAll(): Promise<PolicyVersion[]> {
    const db = readDb();
    return db.policy_versions || [];
  }
  async create(policy: Omit<PolicyVersion, "id" | "createdAt">): Promise<PolicyVersion> {
    const db = readDb();
    const newPolicy: PolicyVersion = {
      ...policy,
      id: generateUuid(),
      createdAt: new Date()
    };
    db.policy_versions.push(newPolicy);
    writeDb(db);
    return newPolicy;
  }
  async update(id: string, fields: Partial<Omit<PolicyVersion, "id" | "createdAt">>): Promise<PolicyVersion> {
    const db = readDb();
    const idx = db.policy_versions.findIndex((pv) => pv.id === id);
    if (idx === -1) throw new Error("Policy version not found");
    const updated: PolicyVersion = {
      ...db.policy_versions[idx],
      ...fields
    };
    db.policy_versions[idx] = updated;
    writeDb(db);
    return updated;
  }
}

// 7. JSON DB 컨텍스트 노출
export const jsonDb: DbContext = {
  users: new JsonUserRepository(),
  sessions: new JsonSessionRepository(),
  profiles: new JsonBirthProfileRepository(),
  caches: new JsonChartCacheRepository(),
  interpretations: new JsonInterpretationResultRepository(),
  sharedLinks: new JsonSharedLinkRepository(),
  authors: new JsonAuthorRepository(),
  contents: new JsonContentRepository(),
  adPlacements: new JsonAdPlacementRepository(),
  adAuditLogs: new JsonAdAuditLogRepository(),
  analyticsLogs: new JsonAnalyticsLogRepository(),
  products: new JsonProductRepository(),
  priceVersions: new JsonPriceVersionRepository(),
  coupons: new JsonCouponRepository(),
  orders: new JsonOrderRepository(),
  couponUses: new JsonCouponUseRepository(),
  webhookLogs: new JsonWebhookLogRepository(),
  userReports: new JsonUserReportRepository(),
  auditLogs: new JsonAuditLogRepository(),
  policyVersions: new JsonPolicyVersionRepository()
};

// 마이그레이션 이력 등록용 헬퍼 (Migration Runner가 사용)
export function getMigrationHistory(): string[] {
  const db = readDb();
  return db.migration_history || [];
}

export function recordMigration(name: string) {
  const db = readDb();
  if (!db.migration_history) {
    db.migration_history = [];
  }
  db.migration_history.push(name);
  writeDb(db);
}
