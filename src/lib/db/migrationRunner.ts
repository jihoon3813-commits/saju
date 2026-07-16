import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { getMigrationHistory, recordMigration } from "./jsonDb";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

// 1. PostgreSQL용 마이그레이션 가동
async function runPostgresMigrations(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL 환경 변수가 정의되지 않아 PostgreSQL 마이그레이션을 가동할 수 없습니다.");
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    // 마이그레이션 이력 테이블이 없으면 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS migration_history (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        run_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 기존 이력 패치
    const historyRes = await client.query("SELECT name FROM migration_history");
    const runMigrations = new Set(historyRes.rows.map((row) => row.name));

    // migrations/ 디렉토리 파일 수집
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.warn("Migrations directory does not exist:", MIGRATIONS_DIR);
      return;
    }

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith(".sql"))
      .sort(); // 순서대로 정렬

    for (const file of files) {
      if (!runMigrations.has(file)) {
        console.log(`Running PostgreSQL Migration: ${file}`);
        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
        
        await client.query("BEGIN");
        try {
          await client.query(sql);
          await client.query("INSERT INTO migration_history (name) VALUES ($1)", [file]);
          await client.query("COMMIT");
          console.log(`Successfully completed PostgreSQL Migration: ${file}`);
        } catch (err) {
          await client.query("ROLLBACK");
          throw err;
        }
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

// 2. JSON DB용 마이그레이션 모형 가동
async function runJsonMigrations(): Promise<void> {
  const runMigrations = new Set(getMigrationHistory());
  
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.warn("Migrations directory does not exist:", MIGRATIONS_DIR);
    return;
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (!runMigrations.has(file)) {
      console.log(`Simulating JSON Migration: ${file}`);
      // JSON DB에서는 DDL 자체를 수동 실행하지 않고, 마이그레이션 체크리스트에 등록하여 이력을 동화합니다.
      recordMigration(file);
      console.log(`Successfully simulated JSON Migration: ${file}`);
    }
  }
}

// 3. 통합 마이그레이션 실행기 엔트리
export async function runMigrations(): Promise<void> {
  const dbType = process.env.DATABASE_TYPE || "json";
  try {
    if (dbType === "postgres") {
      await runPostgresMigrations();
    } else {
      await runJsonMigrations();
    }
  } catch (err) {
    console.error("Database Migration Failure:", err);
    throw err;
  }
}
