-- Phase 7: 프리미엄 상품, 가격 버전, 주문 결제, 쿠폰 관련 스키마 정의

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  product_type VARCHAR(50) NOT NULL, -- 'saju_report' | 'mini_report' | 'compatibility' | 'planner'
  price INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'KRW',
  active BOOLEAN DEFAULT TRUE,
  sample_report_id VARCHAR(255),
  required_input_schema TEXT, -- JSON Schema string
  report_template_version VARCHAR(50) DEFAULT '1.0.0',
  refund_policy_version VARCHAR(50) DEFAULT '1.0.0',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_versions (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'KRW',
  version VARCHAR(50) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  discount_type VARCHAR(50) NOT NULL, -- 'amount' | 'percent'
  discount_value INTEGER NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  product_restrictions TEXT, -- JSON Array: ["prod_1", "prod_2"]
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  product_id VARCHAR(255) REFERENCES products(id) ON DELETE SET NULL,
  price_version_id VARCHAR(255) REFERENCES price_versions(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'KRW',
  status VARCHAR(50) NOT NULL, -- 'pending' | 'authorized' | 'paid' | 'report_generating' | 'completed' | 'failed' | 'cancelled' | 'refund_requested' | 'refunded'
  payment_provider VARCHAR(50) NOT NULL, -- 'tosspayments' | 'portone' | 'mock' | 'none'
  provider_order_id VARCHAR(255),
  idempotency_key VARCHAR(255) UNIQUE,
  chart_id VARCHAR(255), -- references birth_profiles or similar
  interpretation_id VARCHAR(255) REFERENCES interpretation_results(id) ON DELETE SET NULL,
  policy_version VARCHAR(50) NOT NULL,
  coupon_id VARCHAR(255) REFERENCES coupons(id) ON DELETE SET NULL,
  refund_reason TEXT,
  refunded_amount INTEGER,
  refunded_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_uses (
  id VARCHAR(255) PRIMARY KEY,
  coupon_id VARCHAR(255) REFERENCES coupons(id) ON DELETE CASCADE,
  order_id VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_coupon_order UNIQUE(coupon_id, order_id)
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id VARCHAR(255) PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  payload TEXT NOT NULL,
  signature VARCHAR(255),
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
