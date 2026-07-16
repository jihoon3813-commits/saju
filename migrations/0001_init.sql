-- 1. 회원 정보 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. 세션 토큰 테이블
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token);

-- 3. 운세 프로필 테이블
CREATE TABLE IF NOT EXISTS birth_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  anonymous_session_id VARCHAR(255),
  alias VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  calendar_type VARCHAR(10) NOT NULL,
  lunar_leap_month BOOLEAN,
  birth_date DATE NOT NULL,
  birth_time TIME,
  unknown_birth_time BOOLEAN DEFAULT FALSE,
  birth_country VARCHAR(100) NOT NULL,
  birth_city VARCHAR(100) NOT NULL,
  timezone VARCHAR(100) NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  gender_rule_option VARCHAR(20) NOT NULL,
  calculation_preference JSONB NOT NULL,
  save_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_profiles_user ON birth_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_anonymous ON birth_profiles(anonymous_session_id);
