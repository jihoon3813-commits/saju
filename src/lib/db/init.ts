import { runMigrations } from "./migrationRunner";
import { seedDatabase } from "./seeder";
import { db } from "./index";

let isInitialized = false;

/**
 * 데이터베이스 초기화 함수 (마이그레이션 및 시딩 수행)
 * 서버 API 진입점이나 서버 액션의 도입부에서 단 한번 보장 실행됩니다.
 */
export async function initializeDatabase() {
  if (isInitialized) return;

  // Next.js 빌드 시 11개 멀티 워커 프로세스들이 병렬로 실행되며 파일을 동시 덮어쓰는 경쟁 상태(Race Condition)를 방지합니다.
  // 이미 로컬 DB에 admin 시드 계정이 존재한다면 초기화 단계를 안전하게 건너뜁니다.
  try {
    const adminExists = await db.users.findByEmail("admin@example.com");
    if (adminExists) {
      isInitialized = true;
      return;
    }
  } catch (err) {
    // 최초 구동 시 구조나 테이블이 없어 조회가 안 되는 경우에만 아래의 초기화 과정을 밟도록 유도합니다.
    console.log("Local database check skipped or structure not ready, performing initialization...");
  }

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
