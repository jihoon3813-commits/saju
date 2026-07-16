-- 1. 사용자 오류 및 권한 요청 신고 테이블 정의
CREATE TABLE IF NOT EXISTS user_reports (
  id VARCHAR(36) PRIMARY KEY,
  report_type VARCHAR(50) NOT NULL, -- 'calculation_error', 'result_sentence', 'privacy', 'payment', 'content_error'
  order_id VARCHAR(36) REFERENCES orders(id) ON DELETE SET NULL,
  error_code VARCHAR(50),
  version_info VARCHAR(100), -- 'engine=1.0.0, prompt=1.1.0' 등 버전 정보
  content TEXT NOT NULL, -- PII 가이드를 준수하여 상세 민감정보가 마스킹된 의견 문장
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'resolved', 'ignored'
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- 2. 관리자 권한 조작 행동 감사 로그 테이블 정의
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  admin_id VARCHAR(36) NOT NULL,
  admin_email VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL, -- 'refund_order', 'toggle_product', 'create_coupon', 'mfa_verified' 등
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. 사이트 동의 및 이용 약관 정책 버전 관리 테이블 정의
CREATE TABLE IF NOT EXISTS policy_versions (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(100) NOT NULL, -- '서비스 이용약관', '개인정보 처리방침', '쿠키 동의 정책'
  version VARCHAR(20) NOT NULL, -- '1.0.0', '1.1.0' 등
  content TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
