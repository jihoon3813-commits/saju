/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import { Pool } from "pg";
import { BirthProfile } from "@/schemas/fortune";
import { ChartResult } from "@/lib/manse/types";
import {
  User,
  UserSession,
  UserRepository,
  SessionRepository,
  BirthProfileRepository,
  ChartCacheRepository,
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

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL 환경 변수가 정의되지 않았습니다.");
    }
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
  }
  return pool;
}

// 1. Helper: Snake Case 데이터베이스 행을 Camel Case 객체로 매핑
function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    provider: row.provider,
    role: row.role || "user",
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null
  };
}

function mapSession(row: any): UserSession {
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    expiresAt: new Date(row.expires_at),
    createdAt: new Date(row.created_at)
  };
}

function mapProfile(row: any): BirthProfile {
  return {
    id: row.id,
    userId: row.user_id || null,
    anonymousSessionId: row.anonymous_session_id || null,
    alias: row.alias,
    relationship: row.relationship,
    calendarType: row.calendar_type,
    lunarLeapMonth: row.lunar_leap_month,
    birthDate: typeof row.birth_date === "string" ? row.birth_date : row.birth_date.toISOString().split("T")[0],
    birthTime: row.birth_time ? row.birth_time.substring(0, 5) : null,
    unknownBirthTime: row.unknown_birth_time,
    birthCountry: row.birth_country,
    birthCity: row.birth_city,
    timezone: row.timezone,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    genderRuleOption: row.gender_rule_option,
    calculationPreference: typeof row.calculation_preference === "string" 
      ? JSON.parse(row.calculation_preference) 
      : row.calculation_preference,
    saveConsent: row.save_consent,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null
  };
}

// 2. PostgresUserRepository 구현
class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL", [id]);
    return res.rows.length ? mapUser(res.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL", [email]);
    return res.rows.length ? mapUser(res.rows[0]) : null;
  }

  async findAll(): Promise<User[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM users WHERE deleted_at IS NULL");
    return res.rows.map(mapUser);
  }

  async create(user: Omit<User, "id" | "role" | "createdAt" | "updatedAt" | "deletedAt"> & { role?: "user" | "admin" }): Promise<User> {
    const p = getPool();
    const roleValue = user.role || "user";
    const res = await p.query(
      `INSERT INTO users (email, password_hash, provider, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [user.email, user.passwordHash, user.provider, roleValue]
    );
    return mapUser(res.rows[0]);
  }

  async update(id: string, fields: Partial<Omit<User, "id">>): Promise<User> {
    const p = getPool();
    const setClause: string[] = [];
    const values: any[] = [];
    let valIdx = 1;

    if (fields.email !== undefined) {
      setClause.push(`email = $${valIdx++}`);
      values.push(fields.email);
    }
    if (fields.passwordHash !== undefined) {
      setClause.push(`password_hash = $${valIdx++}`);
      values.push(fields.passwordHash);
    }
    if (fields.provider !== undefined) {
      setClause.push(`provider = $${valIdx++}`);
      values.push(fields.provider);
    }
    if (fields.role !== undefined) {
      setClause.push(`role = $${valIdx++}`);
      values.push(fields.role);
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id); // 마지막에 id 바인딩

    const query = `UPDATE users SET ${setClause.join(", ")} WHERE id = $${valIdx} AND deleted_at IS NULL RETURNING *`;
    const res = await p.query(query, values);
    if (!res.rows.length) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }
    return mapUser(res.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const p = getPool();
    await p.query("UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);
    await p.query("DELETE FROM user_sessions WHERE user_id = $1", [id]);
  }

  async hardDelete(id: string): Promise<void> {
    const p = getPool();
    await p.query("DELETE FROM user_sessions WHERE user_id = $1", [id]);
    await p.query("DELETE FROM birth_profiles WHERE user_id = $1", [id]);
    await p.query("DELETE FROM users WHERE id = $1", [id]);
  }
}

// 3. PostgresSessionRepository 구현
class PostgresSessionRepository implements SessionRepository {
  async create(userId: string, token: string, expiresAt: Date): Promise<UserSession> {
    const p = getPool();
    // 기존 유효 유저 세션 삭제
    await p.query("DELETE FROM user_sessions WHERE user_id = $1 OR expires_at < CURRENT_TIMESTAMP", [userId]);
    const res = await p.query(
      `INSERT INTO user_sessions (user_id, token, expires_at) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, token, expiresAt]
    );
    return mapSession(res.rows[0]);
  }

  async findByToken(token: string): Promise<UserSession | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM user_sessions WHERE token = $1", [token]);
    if (!res.rows.length) return null;
    const session = mapSession(res.rows[0]);

    if (session.expiresAt.getTime() < Date.now()) {
      await this.deleteByToken(token);
      return null;
    }
    return session;
  }

  async deleteByToken(token: string): Promise<void> {
    const p = getPool();
    await p.query("DELETE FROM user_sessions WHERE token = $1", [token]);
  }

  async deleteExpired(): Promise<number> {
    const p = getPool();
    const res = await p.query("DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP");
    return res.rowCount || 0;
  }
}

// 4. PostgresBirthProfileRepository 구현
class PostgresBirthProfileRepository implements BirthProfileRepository {
  async findById(id: string): Promise<BirthProfile | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM birth_profiles WHERE id = $1 AND deleted_at IS NULL", [id]);
    return res.rows.length ? mapProfile(res.rows[0]) : null;
  }

  async findByUserId(userId: string): Promise<BirthProfile[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM birth_profiles WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC", [userId]);
    return res.rows.map(mapProfile);
  }

  async findByAnonymousSessionId(sessionId: string): Promise<BirthProfile[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM birth_profiles WHERE anonymous_session_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC", [sessionId]);
    return res.rows.map(mapProfile);
  }

  async create(profile: Omit<BirthProfile, "id" | "createdAt" | "updatedAt" | "deletedAt">): Promise<BirthProfile> {
    const p = getPool();
    const res = await p.query(
      `INSERT INTO birth_profiles (
        user_id, anonymous_session_id, alias, relationship, calendar_type, lunar_leap_month,
        birth_date, birth_time, unknown_birth_time, birth_country, birth_city, timezone,
        latitude, longitude, gender_rule_option, calculation_preference, save_consent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
      RETURNING *`,
      [
        profile.userId,
        profile.anonymousSessionId,
        profile.alias,
        profile.relationship,
        profile.calendarType,
        profile.lunarLeapMonth,
        profile.birthDate,
        profile.birthTime,
        profile.unknownBirthTime,
        profile.birthCountry,
        profile.birthCity,
        profile.timezone,
        profile.latitude,
        profile.longitude,
        profile.genderRuleOption,
        JSON.stringify(profile.calculationPreference),
        profile.saveConsent
      ]
    );
    return mapProfile(res.rows[0]);
  }

  async update(id: string, fields: Partial<Omit<BirthProfile, "id">>): Promise<BirthProfile> {
    const p = getPool();
    const setClause: string[] = [];
    const values: any[] = [];
    let valIdx = 1;

    const mapping: Record<string, string> = {
      userId: "user_id",
      anonymousSessionId: "anonymous_session_id",
      alias: "alias",
      relationship: "relationship",
      calendarType: "calendar_type",
      lunarLeapMonth: "lunar_leap_month",
      birthDate: "birth_date",
      birthTime: "birth_time",
      unknownBirthTime: "unknown_birth_time",
      birthCountry: "birth_country",
      birthCity: "birth_city",
      timezone: "timezone",
      latitude: "latitude",
      longitude: "longitude",
      genderRuleOption: "gender_rule_option",
      calculationPreference: "calculation_preference",
      saveConsent: "save_consent"
    };

    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined && mapping[key]) {
        setClause.push(`${mapping[key]} = $${valIdx++}`);
        if (key === "calculationPreference") {
          values.push(JSON.stringify(val));
        } else {
          values.push(val);
        }
      }
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id); // 마지막에 id 바인딩

    const query = `UPDATE birth_profiles SET ${setClause.join(", ")} WHERE id = $${valIdx} AND deleted_at IS NULL RETURNING *`;
    const res = await p.query(query, values);
    if (!res.rows.length) {
      throw new Error("운세 프로필을 찾을 수 없습니다.");
    }
    return mapProfile(res.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const p = getPool();
    await p.query("UPDATE birth_profiles SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);
  }

  async hardDelete(id: string): Promise<void> {
    const p = getPool();
    await p.query("DELETE FROM birth_profiles WHERE id = $1", [id]);
  }

  async linkAnonymousToUser(anonymousSessionId: string, userId: string): Promise<number> {
    const p = getPool();
    const res = await p.query(
      `UPDATE birth_profiles 
       SET user_id = $1, anonymous_session_id = NULL, updated_at = CURRENT_TIMESTAMP 
       WHERE anonymous_session_id = $2 AND deleted_at IS NULL`,
      [userId, anonymousSessionId]
    );
    return res.rowCount || 0;
  }
}

// 5. PostgresChartCacheRepository 구현
class PostgresChartCacheRepository implements ChartCacheRepository {
  async find(inputHash: string, engineVersion: string): Promise<ChartResult | null> {
    const p = getPool();
    const res = await p.query(
      "SELECT chart_result FROM chart_caches WHERE input_hash = $1 AND engine_version = $2",
      [inputHash, engineVersion]
    );
    if (!res.rows.length) return null;
    return res.rows[0].chart_result as ChartResult;
  }

  async create(inputHash: string, engineVersion: string, chartResult: ChartResult): Promise<void> {
    const p = getPool();
    // upsert 캐시
    await p.query(
      `INSERT INTO chart_caches (input_hash, engine_version, chart_result)
       VALUES ($1, $2, $3)
       ON CONFLICT (input_hash) DO UPDATE 
       SET chart_result = EXCLUDED.chart_result, created_at = CURRENT_TIMESTAMP`,
      [inputHash, engineVersion, JSON.stringify(chartResult)]
    );
  }
}

// 7. PostgresInterpretationResultRepository 구현
class PostgresInterpretationResultRepository implements InterpretationResultRepository {
  async findById(id: string): Promise<InterpretationResult | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM interpretation_results WHERE id = $1", [id]);
    if (!res.rows.length) return null;
    return this.mapRow(res.rows[0]);
  }

  async findByQuery(
    profileId: string,
    serviceType: string,
    chartHash: string,
    engineVersion: string,
    ruleVersion: string,
    promptVersion: string
  ): Promise<InterpretationResult | null> {
    const p = getPool();
    const res = await p.query(
      `SELECT * FROM interpretation_results 
       WHERE profile_id = $1 
         AND service_type = $2 
         AND chart_hash = $3 
         AND engine_version = $4 
         AND rule_version = $5 
         AND prompt_version = $6`,
      [profileId, serviceType, chartHash, engineVersion, ruleVersion, promptVersion]
    );
    if (!res.rows.length) return null;
    return this.mapRow(res.rows[0]);
  }

  async create(
    result: Omit<InterpretationResult, "id" | "generatedAt">
  ): Promise<InterpretationResult> {
    const p = getPool();
    const id = crypto.randomUUID();
    const res = await p.query(
      `INSERT INTO interpretation_results (
        id, profile_id, profile_id2, service_type, chart_hash, report_data, 
        fallback, engine_version, rule_version, prompt_version, model_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        id,
        result.profileId,
        result.profileId2,
        result.serviceType,
        result.chartHash,
        JSON.stringify(result.reportData),
        result.fallback,
        result.engineVersion,
        result.ruleVersion,
        result.promptVersion,
        result.modelName
      ]
    );
    return this.mapRow(res.rows[0]);
  }

  async findAll(): Promise<InterpretationResult[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM interpretation_results ORDER BY generated_at DESC");
    return res.rows.map((r) => this.mapRow(r));
  }

  private mapRow(row: any): InterpretationResult {
    return {
      id: row.id,
      profileId: row.profile_id,
      profileId2: row.profile_id2,
      serviceType: row.service_type,
      chartHash: row.chart_hash,
      reportData: row.report_data,
      fallback: row.fallback,
      engineVersion: row.engine_version,
      ruleVersion: row.rule_version,
      promptVersion: row.prompt_version,
      modelName: row.model_name,
      generatedAt: new Date(row.generated_at)
    };
  }
}

// 8. PostgresSharedLinkRepository 구현
class PostgresSharedLinkRepository implements SharedLinkRepository {
  async findById(id: string): Promise<SharedLink | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM shared_links WHERE id = $1", [id]);
    if (!res.rows.length) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      interpretationResultId: row.interpretation_result_id,
      expiresAt: new Date(row.expires_at),
      createdSessionId: row.created_session_id,
      key: row.key,
      createdAt: new Date(row.created_at)
    };
  }

  async create(link: Omit<SharedLink, "id" | "createdAt">): Promise<SharedLink> {
    const p = getPool();
    const id = crypto.randomUUID();
    const res = await p.query(
      `INSERT INTO shared_links (id, interpretation_result_id, expires_at, created_session_id, key)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, link.interpretationResultId, link.expiresAt, link.createdSessionId, link.key]
    );
    const row = res.rows[0];
    return {
      id: row.id,
      interpretationResultId: row.interpretation_result_id,
      expiresAt: new Date(row.expires_at),
      createdSessionId: row.created_session_id,
      key: row.key,
      createdAt: new Date(row.created_at)
    };
  }

  async delete(id: string): Promise<void> {
    const p = getPool();
    await p.query("DELETE FROM shared_links WHERE id = $1", [id]);
  }
}

function mapAuthor(row: any): Author {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    createdAt: new Date(row.created_at)
  };
}

function mapContent(row: any): Content {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    cluster: row.cluster,
    category: row.category,
    tags: row.tags || [],
    searchIntent: row.search_intent,
    primaryKeyword: row.primary_keyword,
    relatedServiceIds: row.related_service_ids || [],
    relatedContentIds: row.related_content_ids || [],
    authorId: row.author_id,
    reviewerId: row.reviewer_id,
    status: row.status,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    updatedAt: new Date(row.updated_at),
    canonicalUrl: row.canonical_url,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    ogImage: row.og_image,
    schemaType: row.schema_type,
    noindex: row.noindex,
    revision: row.revision,
    createdAt: new Date(row.created_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    
    // Dream entries
    primarySymbol: row.primary_symbol,
    action: row.action,
    emotion: row.emotion,
    setting: row.setting,
    positiveInterpretation: row.positive_interpretation,
    cautionInterpretation: row.caution_interpretation,
    contextVariables: typeof row.context_variables === "string" 
      ? JSON.parse(row.context_variables) 
      : row.context_variables
  };
}

class PostgresAuthorRepository implements AuthorRepository {
  async findById(id: string): Promise<Author | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM authors WHERE id = $1", [id]);
    return res.rows.length ? mapAuthor(res.rows[0]) : null;
  }

  async findAll(): Promise<Author[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM authors ORDER BY name ASC");
    return res.rows.map((row) => mapAuthor(row));
  }

  async create(author: Omit<Author, "id" | "createdAt">): Promise<Author> {
    const p = getPool();
    const id = crypto.randomUUID();
    const res = await p.query(
      `INSERT INTO authors (id, name, role, bio, avatar_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, author.name, author.role, author.bio, author.avatarUrl]
    );
    return mapAuthor(res.rows[0]);
  }
}

class PostgresContentRepository implements ContentRepository {
  async findById(id: string): Promise<Content | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM contents WHERE id = $1 AND deleted_at IS NULL", [id]);
    return res.rows.length ? mapContent(res.rows[0]) : null;
  }

  async findBySlug(slug: string): Promise<Content | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM contents WHERE LOWER(slug) = LOWER($1) AND deleted_at IS NULL", [slug]);
    return res.rows.length ? mapContent(res.rows[0]) : null;
  }

  async findByType(type: string, status?: string): Promise<Content[]> {
    const p = getPool();
    let res;
    if (status) {
      res = await p.query("SELECT * FROM contents WHERE type = $1 AND status = $2 AND deleted_at IS NULL ORDER BY created_at DESC", [type, status]);
    } else {
      res = await p.query("SELECT * FROM contents WHERE type = $1 AND deleted_at IS NULL ORDER BY created_at DESC", [type]);
    }
    return res.rows.map((row) => mapContent(row));
  }

  async findByQuery(filter: {
    type?: string;
    category?: string;
    status?: string;
    searchTerm?: string;
  }): Promise<Content[]> {
    const p = getPool();
    const clauses: string[] = ["deleted_at IS NULL"];
    const values: any[] = [];
    let valIdx = 1;

    if (filter.type) {
      clauses.push(`type = $${valIdx++}`);
      values.push(filter.type);
    }
    if (filter.category) {
      clauses.push(`category = $${valIdx++}`);
      values.push(filter.category);
    }
    if (filter.status) {
      clauses.push(`status = $${valIdx++}`);
      values.push(filter.status);
    }
    if (filter.searchTerm) {
      clauses.push(`(
        LOWER(title) LIKE LOWER($${valIdx}) OR 
        LOWER(excerpt) LIKE LOWER($${valIdx}) OR 
        LOWER(body) LIKE LOWER($${valIdx}) OR
        LOWER(primary_symbol) LIKE LOWER($${valIdx})
      )`);
      values.push(`%${filter.searchTerm}%`);
      valIdx++;
    }

    const query = `SELECT * FROM contents WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC`;
    const res = await p.query(query, values);
    return res.rows.map((row) => mapContent(row));
  }

  async create(
    content: Omit<Content, "id" | "revision" | "createdAt" | "updatedAt" | "deletedAt">
  ): Promise<Content> {
    const p = getPool();
    const id = crypto.randomUUID();
    
    // Slug 중복 확인
    const exists = await this.checkSlugExists(content.slug);
    if (exists) {
      throw new Error(`이미 존재하는 슬러그(slug)입니다: ${content.slug}`);
    }

    const res = await p.query(
      `INSERT INTO contents (
        id, type, title, slug, excerpt, body, cluster, category, tags,
        search_intent, primary_keyword, related_service_ids, related_content_ids,
        author_id, reviewer_id, status, published_at, canonical_url, meta_title,
        meta_description, og_image, schema_type, noindex, revision,
        primary_symbol, action, emotion, setting, positive_interpretation,
        caution_interpretation, context_variables
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24,
        $25, $26, $27, $28, $29,
        $30, $31
      ) RETURNING *`,
      [
        id, content.type, content.title, content.slug, content.excerpt, content.body, content.cluster, content.category, content.tags,
        content.searchIntent, content.primaryKeyword, content.relatedServiceIds, content.relatedContentIds,
        content.authorId, content.reviewerId, content.status, content.publishedAt, content.canonicalUrl, content.metaTitle,
        content.metaDescription, content.ogImage, content.schemaType, content.noindex, 1,
        content.primarySymbol, content.action, content.emotion, content.setting, content.positiveInterpretation,
        content.cautionInterpretation, content.contextVariables ? JSON.stringify(content.contextVariables) : null
      ]
    );
    return mapContent(res.rows[0]);
  }

  async update(id: string, fields: Partial<Omit<Content, "id">>): Promise<Content> {
    const p = getPool();
    const setClause: string[] = [];
    const values: any[] = [];
    let valIdx = 1;

    // Slug 중복 검수
    if (fields.slug) {
      const exists = await this.checkSlugExists(fields.slug, id);
      if (exists) {
        throw new Error(`이미 존재하는 슬러그(slug)입니다: ${fields.slug}`);
      }
    }

    const simpleFields: { [key: string]: string } = {
      type: "type",
      title: "title",
      slug: "slug",
      excerpt: "excerpt",
      body: "body",
      cluster: "cluster",
      category: "category",
      searchIntent: "search_intent",
      primaryKeyword: "primary_keyword",
      authorId: "author_id",
      reviewerId: "reviewer_id",
      status: "status",
      canonicalUrl: "canonical_url",
      metaTitle: "meta_title",
      metaDescription: "meta_description",
      ogImage: "og_image",
      schemaType: "schema_type",
      noindex: "noindex",
      primarySymbol: "primary_symbol",
      action: "action",
      emotion: "emotion",
      setting: "setting",
      positiveInterpretation: "positive_interpretation",
      cautionInterpretation: "caution_interpretation"
    };

    for (const [key, col] of Object.entries(simpleFields)) {
      if (fields[key as keyof Omit<Content, "id">] !== undefined) {
        setClause.push(`${col} = $${valIdx++}`);
        values.push(fields[key as keyof Omit<Content, "id">]);
      }
    }

    if (fields.tags !== undefined) {
      setClause.push(`tags = $${valIdx++}`);
      values.push(fields.tags);
    }
    if (fields.relatedServiceIds !== undefined) {
      setClause.push(`related_service_ids = $${valIdx++}`);
      values.push(fields.relatedServiceIds);
    }
    if (fields.relatedContentIds !== undefined) {
      setClause.push(`related_content_ids = $${valIdx++}`);
      values.push(fields.relatedContentIds);
    }
    if (fields.publishedAt !== undefined) {
      setClause.push(`published_at = $${valIdx++}`);
      values.push(fields.publishedAt);
    }
    if (fields.contextVariables !== undefined) {
      setClause.push(`context_variables = $${valIdx++}`);
      values.push(fields.contextVariables ? JSON.stringify(fields.contextVariables) : null);
    }

    setClause.push(`revision = revision + 1`);
    setClause.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(id);
    const query = `UPDATE contents SET ${setClause.join(", ")} WHERE id = $${valIdx} AND deleted_at IS NULL RETURNING *`;
    const res = await p.query(query, values);
    if (!res.rows.length) {
      throw new Error("콘텐츠를 찾을 수 없습니다.");
    }
    return mapContent(res.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const p = getPool();
    await p.query("UPDATE contents SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);
  }

  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const p = getPool();
    let res;
    if (excludeId) {
      res = await p.query("SELECT id FROM contents WHERE LOWER(slug) = LOWER($1) AND id <> $2 AND deleted_at IS NULL", [slug, excludeId]);
    } else {
      res = await p.query("SELECT id FROM contents WHERE LOWER(slug) = LOWER($1) AND deleted_at IS NULL", [slug]);
    }
    return res.rows.length > 0;
  }
}

function mapAdPlacement(row: any): AdPlacement {
  return {
    id: row.id,
    slotKey: row.slot_key,
    pageType: row.page_type,
    position: row.position,
    deviceTarget: row.device_target,
    enabled: row.enabled,
    minContentLength: row.min_content_length,
    adFormat: row.ad_format,
    reserveHeight: row.reserve_height,
    consentRequired: row.consent_required,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

function mapAdAuditLog(row: any): AdAuditLog {
  return {
    id: row.id,
    placementId: row.placement_id,
    slotKey: row.slot_key,
    action: row.action,
    changedBy: row.changed_by,
    changes: row.changes,
    createdAt: new Date(row.created_at)
  };
}

class PostgresAdPlacementRepository implements AdPlacementRepository {
  async findById(id: string): Promise<AdPlacement | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM ad_placements WHERE id = $1", [id]);
    return res.rows.length ? mapAdPlacement(res.rows[0]) : null;
  }

  async findBySlotKey(slotKey: string): Promise<AdPlacement | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM ad_placements WHERE slot_key = $1", [slotKey]);
    return res.rows.length ? mapAdPlacement(res.rows[0]) : null;
  }

  async findAll(): Promise<AdPlacement[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM ad_placements ORDER BY created_at ASC");
    return res.rows.map(mapAdPlacement);
  }

  async create(placement: Omit<AdPlacement, "id" | "createdAt" | "updatedAt">): Promise<AdPlacement> {
    const p = getPool();
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO ad_placements (
        id, slot_key, page_type, position, device_target, enabled, min_content_length, ad_format, reserve_height, consent_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
    `;
    const values = [
      id,
      placement.slotKey,
      placement.pageType,
      placement.position,
      placement.deviceTarget,
      placement.enabled,
      placement.minContentLength,
      placement.adFormat,
      placement.reserveHeight,
      placement.consentRequired
    ];
    const res = await p.query(query, values);
    return mapAdPlacement(res.rows[0]);
  }

  async update(id: string, placement: Partial<Omit<AdPlacement, "id" | "createdAt" | "updatedAt">>): Promise<AdPlacement> {
    const p = getPool();
    const setClause: string[] = [];
    const values: any[] = [];
    let valIdx = 1;

    const fields: Record<string, string> = {
      slotKey: "slot_key",
      pageType: "page_type",
      position: "position",
      deviceTarget: "device_target",
      enabled: "enabled",
      minContentLength: "min_content_length",
      adFormat: "ad_format",
      reserveHeight: "reserve_height",
      consentRequired: "consent_required"
    };

    for (const [key, col] of Object.entries(fields)) {
      if (placement[key as keyof Omit<AdPlacement, "id" | "createdAt" | "updatedAt">] !== undefined) {
        setClause.push(`${col} = $${valIdx++}`);
        values.push(placement[key as keyof Omit<AdPlacement, "id" | "createdAt" | "updatedAt">]);
      }
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE ad_placements SET ${setClause.join(", ")} WHERE id = $${valIdx} RETURNING *`;
    const res = await p.query(query, values);
    if (!res.rows.length) {
      throw new Error("광고 배치를 찾을 수 없습니다.");
    }
    return mapAdPlacement(res.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const p = getPool();
    await p.query("DELETE FROM ad_placements WHERE id = $1", [id]);
  }
}

class PostgresAdAuditLogRepository implements AdAuditLogRepository {
  async create(log: Omit<AdAuditLog, "id" | "createdAt">): Promise<AdAuditLog> {
    const p = getPool();
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO ad_audit_logs (id, placement_id, slot_key, action, changed_by, changes)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const values = [id, log.placementId, log.slotKey, log.action, log.changedBy, log.changes];
    const res = await p.query(query, values);
    return mapAdAuditLog(res.rows[0]);
  }

  async findByPlacementId(placementId: string): Promise<AdAuditLog[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM ad_audit_logs WHERE placement_id = $1 ORDER BY created_at DESC", [placementId]);
    return res.rows.map(mapAdAuditLog);
  }

  async findAll(): Promise<AdAuditLog[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM ad_audit_logs ORDER BY created_at DESC");
    return res.rows.map(mapAdAuditLog);
  }
}

function mapAnalyticsLog(row: any): AnalyticsLog {
  return {
    id: row.id,
    eventName: row.event_name,
    pageType: row.page_type,
    sessionId: row.session_id,
    properties: row.properties,
    createdAt: new Date(row.created_at)
  };
}

class PostgresAnalyticsLogRepository implements AnalyticsLogRepository {
  async create(log: Omit<AnalyticsLog, "id" | "createdAt">): Promise<AnalyticsLog> {
    const p = getPool();
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO analytics_logs (id, event_name, page_type, session_id, properties)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const values = [id, log.eventName, log.pageType, log.sessionId, log.properties];
    const res = await p.query(query, values);
    return mapAnalyticsLog(res.rows[0]);
  }

  async findAll(): Promise<AnalyticsLog[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM analytics_logs ORDER BY created_at DESC");
    return res.rows.map(mapAnalyticsLog);
  }

  async findByEventName(eventName: string): Promise<AnalyticsLog[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM analytics_logs WHERE event_name = $1 ORDER BY created_at DESC", [eventName]);
    return res.rows.map(mapAnalyticsLog);
  }

  async findBySessionId(sessionId: string): Promise<AnalyticsLog[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM analytics_logs WHERE session_id = $1 ORDER BY created_at DESC", [sessionId]);
    return res.rows.map(mapAnalyticsLog);
  }

  async clearAll(): Promise<void> {
    const p = getPool();
    await p.query("DELETE FROM analytics_logs");
  }
}

// 로우 매핑 헬퍼 정의
function mapProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    productType: row.product_type,
    price: row.price,
    currency: row.currency,
    active: row.active,
    sampleReportId: row.sample_report_id,
    requiredInputSchema: row.required_input_schema,
    reportTemplateVersion: row.report_template_version,
    refundPolicyVersion: row.refund_policy_version,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

function mapPriceVersion(row: any): PriceVersion {
  return {
    id: row.id,
    productId: row.product_id,
    price: row.price,
    currency: row.currency,
    version: row.version,
    active: row.active,
    createdAt: new Date(row.created_at)
  };
}

function mapCoupon(row: any): Coupon {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    active: row.active,
    productRestrictions: row.product_restrictions ? JSON.parse(row.product_restrictions) : null,
    expiresAt: new Date(row.expires_at),
    createdAt: new Date(row.created_at)
  };
}

function mapOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    priceVersionId: row.price_version_id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    paymentProvider: row.payment_provider,
    providerOrderId: row.provider_order_id,
    idempotencyKey: row.idempotency_key,
    chartId: row.chart_id,
    interpretationId: row.interpretation_id,
    policyVersion: row.policy_version,
    couponId: row.coupon_id,
    refundReason: row.refund_reason,
    refundedAmount: row.refunded_amount,
    refundedAt: row.refunded_at ? new Date(row.refunded_at) : null,
    createdAt: new Date(row.created_at),
    paidAt: row.paid_at ? new Date(row.paid_at) : null,
    cancelledAt: row.cancelled_at ? new Date(row.cancelled_at) : null,
    updatedAt: new Date(row.updated_at)
  };
}

function mapCouponUse(row: any): CouponUse {
  return {
    id: row.id,
    couponId: row.coupon_id,
    orderId: row.order_id,
    userId: row.user_id,
    createdAt: new Date(row.created_at)
  };
}

function mapWebhookLog(row: any): WebhookLog {
  return {
    id: row.id,
    provider: row.provider,
    payload: row.payload,
    signature: row.signature,
    processed: row.processed,
    errorMessage: row.error_message,
    createdAt: new Date(row.created_at)
  };
}

// 각 레포지토리 클래스 실체 구현
class PostgresProductRepository implements ProductRepository {
  async findById(id: string): Promise<Product | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM products WHERE id = $1", [id]);
    return res.rows[0] ? mapProduct(res.rows[0]) : null;
  }
  async findBySlug(slug: string): Promise<Product | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM products WHERE slug = $1", [slug]);
    return res.rows[0] ? mapProduct(res.rows[0]) : null;
  }
  async findAll(): Promise<Product[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM products ORDER BY created_at DESC");
    return res.rows.map(mapProduct);
  }
  async create(prod: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const p = getPool();
    const id = crypto.randomUUID();
    const res = await p.query(
      `INSERT INTO products (id, slug, title, description, product_type, price, currency, active, sample_report_id, required_input_schema, report_template_version, refund_policy_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [id, prod.slug, prod.title, prod.description, prod.productType, prod.price, prod.currency, prod.active, prod.sampleReportId, prod.requiredInputSchema, prod.reportTemplateVersion, prod.refundPolicyVersion]
    );
    return mapProduct(res.rows[0]);
  }
  async update(id: string, prod: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>): Promise<Product> {
    const p = getPool();
    const setClause: string[] = [];
    const values: any[] = [id];
    let count = 2;
    for (const [k, v] of Object.entries(prod)) {
      const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      setClause.push(`${col} = $${count}`);
      values.push(v);
      count++;
    }
    const res = await p.query(
      `UPDATE products SET ${setClause.join(", ")}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return mapProduct(res.rows[0]);
  }
}

class PostgresPriceVersionRepository implements PriceVersionRepository {
  async findById(id: string): Promise<PriceVersion | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM price_versions WHERE id = $1", [id]);
    return res.rows[0] ? mapPriceVersion(res.rows[0]) : null;
  }
  async findByProductId(productId: string): Promise<PriceVersion[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM price_versions WHERE product_id = $1 ORDER BY created_at DESC", [productId]);
    return res.rows.map(mapPriceVersion);
  }
  async findLatestByProductId(productId: string): Promise<PriceVersion | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM price_versions WHERE product_id = $1 ORDER BY created_at DESC LIMIT 1", [productId]);
    return res.rows[0] ? mapPriceVersion(res.rows[0]) : null;
  }
  async create(pv: Omit<PriceVersion, "id" | "createdAt">): Promise<PriceVersion> {
    const p = getPool();
    const id = crypto.randomUUID();
    const res = await p.query(
      `INSERT INTO price_versions (id, product_id, price, currency, version, active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, pv.productId, pv.price, pv.currency, pv.version, pv.active]
    );
    return mapPriceVersion(res.rows[0]);
  }
}

class PostgresCouponRepository implements CouponRepository {
  async findById(id: string): Promise<Coupon | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM coupons WHERE id = $1", [id]);
    return res.rows[0] ? mapCoupon(res.rows[0]) : null;
  }
  async findByCode(code: string): Promise<Coupon | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM coupons WHERE UPPER(code) = UPPER($1)", [code]);
    return res.rows[0] ? mapCoupon(res.rows[0]) : null;
  }
  async findAll(): Promise<Coupon[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM coupons ORDER BY created_at DESC");
    return res.rows.map(mapCoupon);
  }
  async create(c: Omit<Coupon, "id" | "createdAt">): Promise<Coupon> {
    const p = getPool();
    const id = crypto.randomUUID();
    const restrictions = c.productRestrictions ? JSON.stringify(c.productRestrictions) : null;
    const res = await p.query(
      `INSERT INTO coupons (id, code, discount_type, discount_value, max_uses, used_count, active, product_restrictions, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id, c.code, c.discountType, c.discountValue, c.maxUses, c.usedCount, c.active, restrictions, c.expiresAt]
    );
    return mapCoupon(res.rows[0]);
  }
  async update(id: string, c: Partial<Omit<Coupon, "id" | "createdAt">>): Promise<Coupon> {
    const p = getPool();
    const setClause: string[] = [];
    const values: any[] = [id];
    let count = 2;
    for (const [k, v] of Object.entries(c)) {
      const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      setClause.push(`${col} = $${count}`);
      if (k === "productRestrictions") {
        values.push(v ? JSON.stringify(v) : null);
      } else {
        values.push(v);
      }
      count++;
    }
    const res = await p.query(
      `UPDATE coupons SET ${setClause.join(", ")} WHERE id = $1 RETURNING *`,
      values
    );
    return mapCoupon(res.rows[0]);
  }
  async incrementUsedCount(id: string): Promise<boolean> {
    const p = getPool();
    const res = await p.query(
      `UPDATE coupons 
       SET used_count = used_count + 1 
       WHERE id = $1 AND used_count < max_uses AND active = TRUE AND expires_at > NOW()
       RETURNING *`,
      [id]
    );
    return res.rows.length > 0;
  }
}

class PostgresOrderRepository implements OrderRepository {
  async findById(id: string): Promise<Order | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM orders WHERE id = $1", [id]);
    return res.rows[0] ? mapOrder(res.rows[0]) : null;
  }
  async findByIdempotencyKey(key: string): Promise<Order | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM orders WHERE idempotency_key = $1", [key]);
    return res.rows[0] ? mapOrder(res.rows[0]) : null;
  }
  async findByUserId(userId: string): Promise<Order[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
    return res.rows.map(mapOrder);
  }
  async findAll(): Promise<Order[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM orders ORDER BY created_at DESC");
    return res.rows.map(mapOrder);
  }
  async create(o: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order> {
    const p = getPool();
    const id = crypto.randomUUID();
    const res = await p.query(
      `INSERT INTO orders (id, user_id, product_id, price_version_id, amount, currency, status, payment_provider, provider_order_id, idempotency_key, chart_id, interpretation_id, policy_version, coupon_id, refund_reason, refunded_amount, refunded_at, paid_at, cancelled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
      [id, o.userId, o.productId, o.priceVersionId, o.amount, o.currency, o.status, o.paymentProvider, o.providerOrderId, o.idempotencyKey, o.chartId, o.interpretationId, o.policyVersion, o.couponId, o.refundReason, o.refundedAmount, o.refundedAt, o.paidAt, o.cancelledAt]
    );
    return mapOrder(res.rows[0]);
  }
  async update(id: string, o: Partial<Omit<Order, "id" | "createdAt" | "updatedAt">>): Promise<Order> {
    const p = getPool();
    const setClause: string[] = [];
    const values: any[] = [id];
    let count = 2;
    for (const [k, v] of Object.entries(o)) {
      const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      setClause.push(`${col} = $${count}`);
      values.push(v);
      count++;
    }
    const res = await p.query(
      `UPDATE orders SET ${setClause.join(", ")}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return mapOrder(res.rows[0]);
  }
}

class PostgresCouponUseRepository implements CouponUseRepository {
  async create(cu: Omit<CouponUse, "id" | "createdAt">): Promise<CouponUse> {
    const p = getPool();
    const id = crypto.randomUUID();
    const res = await p.query(
      `INSERT INTO coupon_uses (id, coupon_id, order_id, user_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, cu.couponId, cu.orderId, cu.userId]
    );
    return mapCouponUse(res.rows[0]);
  }
  async findByCouponId(couponId: string): Promise<CouponUse[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM coupon_uses WHERE coupon_id = $1 ORDER BY created_at DESC", [couponId]);
    return res.rows.map(mapCouponUse);
  }
  async findByOrderId(orderId: string): Promise<CouponUse | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM coupon_uses WHERE order_id = $1", [orderId]);
    return res.rows[0] ? mapCouponUse(res.rows[0]) : null;
  }
}

class PostgresWebhookLogRepository implements WebhookLogRepository {
  async create(wl: Omit<WebhookLog, "id" | "createdAt">): Promise<WebhookLog> {
    const p = getPool();
    const id = crypto.randomUUID();
    const res = await p.query(
      `INSERT INTO webhook_logs (id, provider, payload, signature, processed, error_message)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, wl.provider, wl.payload, wl.signature, wl.processed, wl.errorMessage]
    );
    return mapWebhookLog(res.rows[0]);
  }
  async update(id: string, wl: Partial<Omit<WebhookLog, "id" | "createdAt">>): Promise<WebhookLog> {
    const p = getPool();
    const setClause: string[] = [];
    const values: any[] = [id];
    let count = 2;
    for (const [k, v] of Object.entries(wl)) {
      const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      setClause.push(`${col} = $${count}`);
      values.push(v);
      count++;
    }
    const res = await p.query(
      `UPDATE webhook_logs SET ${setClause.join(", ")} WHERE id = $1 RETURNING *`,
      values
    );
    return mapWebhookLog(res.rows[0]);
  }
  async findAll(): Promise<WebhookLog[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM webhook_logs ORDER BY created_at DESC");
    return res.rows.map(mapWebhookLog);
  }
}

// ==========================================
// Phase 8: 매핑 헬퍼 및 Postgres 레포지토리 구현체 추가
// ==========================================

function mapUserReport(row: any): UserReport {
  return {
    id: row.id,
    reportType: row.report_type,
    orderId: row.order_id,
    errorCode: row.error_code,
    versionInfo: row.version_info,
    content: row.content,
    status: row.status,
    createdAt: new Date(row.created_at),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at) : null
  };
}

function mapAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    adminId: row.admin_id,
    adminEmail: row.admin_email,
    action: row.action,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: new Date(row.created_at)
  };
}

function mapPolicyVersion(row: any): PolicyVersion {
  return {
    id: row.id,
    title: row.title,
    version: row.version,
    content: row.content,
    active: row.active,
    createdAt: new Date(row.created_at)
  };
}

class PostgresUserReportRepository implements UserReportRepository {
  async findById(id: string): Promise<UserReport | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM user_reports WHERE id = $1", [id]);
    return res.rows[0] ? mapUserReport(res.rows[0]) : null;
  }
  async findAll(): Promise<UserReport[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM user_reports ORDER BY created_at DESC");
    return res.rows.map(mapUserReport);
  }
  async create(report: Omit<UserReport, "id" | "createdAt" | "status" | "resolvedAt">): Promise<UserReport> {
    const p = getPool();
    const id = crypto.randomUUID();
    const res = await p.query(
      `INSERT INTO user_reports (id, report_type, order_id, error_code, version_info, content)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, report.reportType, report.orderId, report.errorCode, report.versionInfo, report.content]
    );
    return mapUserReport(res.rows[0]);
  }
  async update(id: string, fields: Partial<Omit<UserReport, "id" | "createdAt">>): Promise<UserReport> {
    const p = getPool();
    const setClause: string[] = [];
    const values: any[] = [id];
    let count = 2;
    for (const [k, v] of Object.entries(fields)) {
      const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      setClause.push(`${col} = $${count}`);
      values.push(v);
      count++;
    }
    const res = await p.query(
      `UPDATE user_reports SET ${setClause.join(", ")} WHERE id = $1 RETURNING *`,
      values
    );
    return mapUserReport(res.rows[0]);
  }
}

class PostgresAuditLogRepository implements AuditLogRepository {
  async create(log: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> {
    const p = getPool();
    const id = crypto.randomUUID();
    const res = await p.query(
      `INSERT INTO audit_logs (id, admin_id, admin_email, action, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, log.adminId, log.adminEmail, log.action, log.ipAddress, log.userAgent]
    );
    return mapAuditLog(res.rows[0]);
  }
  async findAll(): Promise<AuditLog[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM audit_logs ORDER BY created_at DESC");
    return res.rows.map(mapAuditLog);
  }
}

class PostgresPolicyVersionRepository implements PolicyVersionRepository {
  async findById(id: string): Promise<PolicyVersion | null> {
    const p = getPool();
    const res = await p.query("SELECT * FROM policy_versions WHERE id = $1", [id]);
    return res.rows[0] ? mapPolicyVersion(res.rows[0]) : null;
  }
  async findAll(): Promise<PolicyVersion[]> {
    const p = getPool();
    const res = await p.query("SELECT * FROM policy_versions ORDER BY created_at DESC");
    return res.rows.map(mapPolicyVersion);
  }
  async create(policy: Omit<PolicyVersion, "id" | "createdAt">): Promise<PolicyVersion> {
    const p = getPool();
    const id = crypto.randomUUID();
    const res = await p.query(
      `INSERT INTO policy_versions (id, title, version, content, active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, policy.title, policy.version, policy.content, policy.active]
    );
    return mapPolicyVersion(res.rows[0]);
  }
  async update(id: string, fields: Partial<Omit<PolicyVersion, "id" | "createdAt">>): Promise<PolicyVersion> {
    const p = getPool();
    const setClause: string[] = [];
    const values: any[] = [id];
    let count = 2;
    for (const [k, v] of Object.entries(fields)) {
      const col = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      setClause.push(`${col} = $${count}`);
      values.push(v);
      count++;
    }
    const res = await p.query(
      `UPDATE policy_versions SET ${setClause.join(", ")} WHERE id = $1 RETURNING *`,
      values
    );
    return mapPolicyVersion(res.rows[0]);
  }
}

// 6. Postgres DB 컨텍스트 노출
export const postgresDb: DbContext = {
  users: new PostgresUserRepository(),
  sessions: new PostgresSessionRepository(),
  profiles: new PostgresBirthProfileRepository(),
  caches: new PostgresChartCacheRepository(),
  interpretations: new PostgresInterpretationResultRepository(),
  sharedLinks: new PostgresSharedLinkRepository(),
  authors: new PostgresAuthorRepository(),
  contents: new PostgresContentRepository(),
  adPlacements: new PostgresAdPlacementRepository(),
  adAuditLogs: new PostgresAdAuditLogRepository(),
  analyticsLogs: new PostgresAnalyticsLogRepository(),
  products: new PostgresProductRepository(),
  priceVersions: new PostgresPriceVersionRepository(),
  coupons: new PostgresCouponRepository(),
  orders: new PostgresOrderRepository(),
  couponUses: new PostgresCouponUseRepository(),
  webhookLogs: new PostgresWebhookLogRepository(),
  userReports: new PostgresUserReportRepository(),
  auditLogs: new PostgresAuditLogRepository(),
  policyVersions: new PostgresPolicyVersionRepository()
};
