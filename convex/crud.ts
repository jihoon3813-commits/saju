import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 1. 고속 인덱스 자동 매퍼 헬퍼
function queryWithIndex(db: any, table: string, field: string, value: any) {
  if (field === "id") {
    return db.query(table).withIndex("by_custom_id", (q: any) => q.eq("id", value));
  }
  if (table === "users" && field === "email") {
    return db.query(table).withIndex("by_email", (q: any) => q.eq("email", value));
  }
  if (table === "sessions" && field === "token") {
    return db.query(table).withIndex("by_token", (q: any) => q.eq("token", value));
  }
  if (table === "profiles" && field === "userId") {
    return db.query(table).withIndex("by_userId", (q: any) => q.eq("userId", value));
  }
  if (table === "profiles" && field === "anonymousSessionId") {
    return db.query(table).withIndex("by_anonymousSessionId", (q: any) => q.eq("anonymousSessionId", value));
  }
  if (table === "contents" && field === "slug") {
    return db.query(table).withIndex("by_slug", (q: any) => q.eq("slug", value));
  }
  if (table === "contents" && field === "type") {
    return db.query(table).withIndex("by_type", (q: any) => q.eq("type", value));
  }
  if (table === "adPlacements" && field === "slotKey") {
    return db.query(table).withIndex("by_slotKey", (q: any) => q.eq("slotKey", value));
  }
  if (table === "adAuditLogs" && field === "placementId") {
    return db.query(table).withIndex("by_placementId", (q: any) => q.eq("placementId", value));
  }
  if (table === "analyticsLogs" && field === "eventName") {
    return db.query(table).withIndex("by_eventName", (q: any) => q.eq("eventName", value));
  }
  if (table === "analyticsLogs" && field === "sessionId") {
    return db.query(table).withIndex("by_sessionId", (q: any) => q.eq("sessionId", value));
  }
  if (table === "products" && field === "slug") {
    return db.query(table).withIndex("by_slug", (q: any) => q.eq("slug", value));
  }
  if (table === "priceVersions" && field === "productId") {
    return db.query(table).withIndex("by_productId", (q: any) => q.eq("productId", value));
  }
  if (table === "coupons" && field === "code") {
    return db.query(table).withIndex("by_code", (q: any) => q.eq("code", value));
  }
  if (table === "orders" && field === "idempotencyKey") {
    return db.query(table).withIndex("by_idempotencyKey", (q: any) => q.eq("idempotencyKey", value));
  }
  if (table === "orders" && field === "userId") {
    return db.query(table).withIndex("by_userId", (q: any) => q.eq("userId", value));
  }
  if (table === "couponUses" && field === "couponId") {
    return db.query(table).withIndex("by_couponId", (q: any) => q.eq("couponId", value));
  }
  if (table === "couponUses" && field === "orderId") {
    return db.query(table).withIndex("by_orderId", (q: any) => q.eq("orderId", value));
  }

  // 매핑되는 인덱스가 없는 동적/미세 쿼리의 경우 filter 스캔으로 폴백
  return db.query(table).filter((q: any) => q.eq(q.field(field), value));
}

// 2. 단일 ID 기준 조회 (Query)
export const getById = query({
  args: { table: v.string(), id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query(args.table as any)
      .withIndex("by_custom_id", (q: any) => q.eq("id", args.id))
      .unique();
  },
});

// 3. 단일 필드 기준 단일 레코드 조회 (Query)
export const getByField = query({
  args: { table: v.string(), field: v.string(), value: v.any() },
  handler: async (ctx, args) => {
    return await queryWithIndex(ctx.db, args.table, args.field, args.value).unique();
  },
});

// 4. 복합 필드 기준 조회 (Query)
export const getByFields = query({
  args: { 
    table: v.string(), 
    criteria: v.array(v.object({ field: v.string(), value: v.any() })) 
  },
  handler: async (ctx, args) => {
    if (args.criteria.length === 0) return [];
    
    // 첫 번째 조건에 대해 인덱스 쿼리 시작
    const first = args.criteria[0];
    
    // 만세력 캐시 복합 인덱스 특화 처리
    if (args.table === "caches" && args.criteria.length === 2) {
      const inputHash = args.criteria.find(c => c.field === "inputHash")?.value;
      const engineVersion = args.criteria.find(c => c.field === "engineVersion")?.value;
      if (inputHash && engineVersion) {
        return await ctx.db
          .query("caches")
          .withIndex("by_custom_id", (q) => q) // fallback
          .filter((q) => q.and(
            q.eq(q.field("inputHash"), inputHash),
            q.eq(q.field("engineVersion"), engineVersion)
          ))
          .collect();
      }
    }

    // 일반 복합 필드 필터링
    let queryBuilder = queryWithIndex(ctx.db, args.table, first.field, first.value);
    
    // 나머지 필드들 필터 적용
    if (args.criteria.length > 1) {
      const remaining = args.criteria.slice(1);
      queryBuilder = queryBuilder.filter((q: any) => 
        q.and(...remaining.map((c) => q.eq(q.field(c.field), c.value)))
      );
    }
    
    return await queryBuilder.collect();
  },
});

// 5. 전체 목록 조회 (Query)
export const findAll = query({
  args: { table: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query(args.table as any).collect();
  },
});

// 6. 도큐먼트 삽입 (Mutation)
export const create = mutation({
  args: { table: v.string(), document: v.any() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert(args.table as any, args.document);
    return await ctx.db.get(id);
  },
});

// 7. 도큐먼트 업데이트 (Mutation)
export const update = mutation({
  args: { table: v.string(), id: v.string(), fields: v.any() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query(args.table as any)
      .withIndex("by_custom_id", (q: any) => q.eq("id", args.id))
      .unique();
      
    if (!existing) {
      throw new Error(`Document not found in ${args.table} with id ${args.id}`);
    }
    
    await ctx.db.patch(existing._id, args.fields);
    return await ctx.db.get(existing._id);
  },
});

// 8. 도큐먼트 삭제 (Mutation)
export const remove = mutation({
  args: { table: v.string(), id: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query(args.table as any)
      .withIndex("by_custom_id", (q: any) => q.eq("id", args.id))
      .unique();
      
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// 9. 쿠폰 소진 증가 원자적 처리 (Mutation)
export const incrementCouponUses = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .unique();
      
    if (!coupon) return false;
    if (coupon.usedCount >= coupon.maxUses) return false;
    
    await ctx.db.patch(coupon._id, { usedCount: coupon.usedCount + 1 });
    return true;
  },
});

// 10. 비회원 임시 세션 프로필을 회원에게 일괄 병합 (Mutation)
export const linkAnonymousToUser = mutation({
  args: { anonymousSessionId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const list = await ctx.db
      .query("profiles")
      .withIndex("by_anonymousSessionId", (q: any) => q.eq("anonymousSessionId", args.anonymousSessionId))
      .collect();
      
    let count = 0;
    for (const p of list) {
      if (!p.userId) {
        await ctx.db.patch(p._id, { userId: args.userId });
        count++;
      }
    }
    return count;
  },
});

// 11. 테이블 전체 데이터 삭제 (Mutation)
export const clearTable = mutation({
  args: { table: v.string() },
  handler: async (ctx, args) => {
    const list = await ctx.db.query(args.table as any).collect();
    for (const doc of list) {
      await ctx.db.delete(doc._id);
    }
  },
});
