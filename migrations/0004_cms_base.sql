-- DDL Migration: 0004_cms_base.sql
-- 1. users 테이블에 role 컬럼 추가 (PostgreSQL 호환성 확보)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- 2. 콘텐츠 작성자(에디터/전문가) 테이블 생성
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL DEFAULT '에디터',
  bio TEXT,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 콘텐츠 테이블 생성
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- article | dream | glossary | guide | policy
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  cluster VARCHAR(100),
  category VARCHAR(100),
  tags VARCHAR(100)[],
  search_intent VARCHAR(255),
  primary_keyword VARCHAR(255),
  related_service_ids VARCHAR(255)[],
  related_content_ids VARCHAR(255)[],
  author_id UUID REFERENCES authors(id) ON DELETE RESTRICT,
  reviewer_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft | review | scheduled | published | archived
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  canonical_url VARCHAR(255),
  meta_title VARCHAR(255),
  meta_description VARCHAR(255),
  og_image VARCHAR(255),
  schema_type VARCHAR(100),
  noindex BOOLEAN DEFAULT FALSE,
  revision INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- DreamEntry 추가 필드 (type=dream일 때 활용)
  primary_symbol VARCHAR(255),
  action VARCHAR(255),
  emotion VARCHAR(255),
  setting VARCHAR(255),
  positive_interpretation TEXT,
  caution_interpretation TEXT,
  context_variables JSONB
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_contents_slug ON contents(slug);
CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(type);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
