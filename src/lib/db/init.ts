import { runMigrations } from "./migrationRunner";
import { seedDatabase } from "./seeder";

let isInitialized = false;

/**
 * 데이터베이스 초기화 함수 (마이그레이션 및 시딩 수행)
 * 서버 API 진입점이나 서버 액션의 도입부에서 단 한번 보장 실행됩니다.
 */
export async function initializeDatabase() {
  if (isInitialized) return;
  try {
    console.log("-----------------------------------------");
    console.log("Initializing database (Running DDL migrations)...");
    await runMigrations();
    console.log("Database DDL migration finished. Running seeder...");
    await seedDatabase();
    isInitialized = true;
    console.log("Database initialization finished successfully.");
    console.log("-----------------------------------------");
  } catch (err) {
    console.error("Critical: Database initialization failed:", err);
    // 개발 환경에서는 즉시 어설션 에러를 터트려 디버깅을 유도합니다.
    throw err;
  }
}
