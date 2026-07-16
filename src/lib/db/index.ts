import { DbContext } from "./types";
import { jsonDb } from "./jsonDb";
import { postgresDb } from "./postgresDb";
import { convexDb } from "./convexDb";

// DATABASE_TYPE 환경변수에 따라 적합한 DB 어댑터를 선택해 노출합니다. (json, postgres, convex)
const dbType = process.env.DATABASE_TYPE || "json";

export const db: DbContext = 
  dbType === "convex" 
    ? convexDb 
    : dbType === "postgres" 
    ? postgresDb 
    : jsonDb;

export * from "./types";
