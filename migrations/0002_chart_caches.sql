CREATE TABLE IF NOT EXISTS chart_caches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_hash VARCHAR(64) UNIQUE NOT NULL, -- 정규화 파라미터의 SHA-256 해시
  engine_version VARCHAR(50) NOT NULL,    -- 만세력 연산 엔진 버전 ('1.0.0' 등)
  chart_result JSONB NOT NULL,            -- 직렬화된 ChartResult DTO
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chart_caches_hash ON chart_caches(input_hash);
