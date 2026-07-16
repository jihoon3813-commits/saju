import { DbContext } from "./types";
import { jsonDb } from "./jsonDb";
import { postgresDb } from "./postgresDb";

// DATABASE_TYPE 환경변수가 'postgres'이면 postgresDb를 사용하고, 그렇지 않으면 jsonDb(로컬 JSON 파일 저장소)를 기본값으로 사용합니다.
const dbType = process.env.DATABASE_TYPE || "json";

export const db: DbContext = dbType === "postgres" ? postgresDb : jsonDb;

export * from "./types";
