-- DDL Migration: 0003_interpretations.sql
-- Create interpretation_results table
CREATE TABLE IF NOT EXISTS interpretation_results (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL,
  profile_id2 UUID,
  service_type VARCHAR(50) NOT NULL,
  chart_hash VARCHAR(64) NOT NULL,
  report_data JSONB NOT NULL,
  fallback BOOLEAN NOT NULL DEFAULT FALSE,
  engine_version VARCHAR(20) NOT NULL,
  rule_version VARCHAR(20) NOT NULL,
  prompt_version VARCHAR(20) NOT NULL,
  model_name VARCHAR(50) NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES birth_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_profile2 FOREIGN KEY (profile_id2) REFERENCES birth_profiles(id) ON DELETE SET NULL
);

-- Create index for search speed optimization
CREATE INDEX IF NOT EXISTS idx_interpretations_lookup ON interpretation_results(profile_id, service_type, chart_hash);

-- Create shared_links table
CREATE TABLE IF NOT EXISTS shared_links (
  id UUID PRIMARY KEY,
  interpretation_result_id UUID NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_session_id VARCHAR(255),
  key VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_interpretation FOREIGN KEY (interpretation_result_id) REFERENCES interpretation_results(id) ON DELETE CASCADE
);
