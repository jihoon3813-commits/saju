import { cookies } from "next/headers";
import { db } from "./db";
import { initializeDatabase } from "./db/init";
import { verifyPassword, hashPassword } from "@/utils/hash";
import { User } from "./db/types";

const SESSION_COOKIE_NAME = "session_token";
const ANONYMOUS_COOKIE_NAME = "anonymous_session_id";
const SESSION_EXPIRY_DAYS = 7;
const ANONYMOUS_EXPIRY_DAYS = 30;

// UUID 생성용 헬퍼
function generateRandomToken(): string {
  return crypto.randomUUID();
}

/**
 * 1. 현재 로그인되어 있는 유저 정보를 쿠키를 통해 조회합니다 (서버 컴포넌트/서버 액션용).
 */
export async function getCurrentUser(): Promise<User | null> {
  await initializeDatabase();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const session = await db.sessions.findByToken(token);
    if (!session) return null;

    return await db.users.findById(session.userId);
  } catch (err) {
    console.error("Error getting current user:", err);
    return null;
  }
}

/**
 * 2. 비회원 식별자를 쿠키에서 읽거나 신규로 발급합니다.
 */
export async function getOrCreateAnonymousSession(): Promise<string> {
  const cookieStore = await cookies();
  let anonymousId = cookieStore.get(ANONYMOUS_COOKIE_NAME)?.value;

  if (!anonymousId) {
    anonymousId = generateRandomToken();
    const expires = new Date();
    expires.setDate(expires.getDate() + ANONYMOUS_EXPIRY_DAYS);
    
    try {
      cookieStore.set(ANONYMOUS_COOKIE_NAME, anonymousId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires,
        path: "/"
      });
    } catch (e) {
      // 서버 컴포넌트 렌더링 시점에 호출될 경우 쿠키 저장이 불가하므로 경고 로그만 찍고
      // 발급된 ID를 임시 반환하여 렌더링 중단을 방지합니다.
      // 이후 데이터 생성/수정/삭제 등의 Server Action이 일어나면 정상적으로 쿠키 쓰기가 작동합니다.
      console.warn("Cookies cannot be modified during Server Component rendering. Utilizing temporary ID:", anonymousId);
    }
  }

  return anonymousId;
}

/**
 * 3. 이메일/비밀번호 로그인을 처리하고 세션 쿠키를 굽습니다.
 */
export async function loginUser(email: string, password: string): Promise<User> {
  await initializeDatabase();
  const user = await db.users.findByEmail(email);
  if (!user || !user.passwordHash) {
    throw new Error("가입되지 않은 이메일이거나 비밀번호가 일치하지 않습니다.");
  }

  const isPasswordValid = verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("가입되지 않은 이메일이거나 비밀번호가 일치하지 않습니다.");
  }

  const token = generateRandomToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);

  // 세션 등록
  await db.sessions.create(user.id, token, expires);

  // 쿠키 설정
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/"
  });

  // 비회원 상태에서 축적한 임시 프로필이 있다면 로그인한 계정으로 마이그레이션 및 연동
  const anonymousId = cookieStore.get(ANONYMOUS_COOKIE_NAME)?.value;
  if (anonymousId) {
    await db.profiles.linkAnonymousToUser(anonymousId, user.id);
  }

  return user;
}

/**
 * 4. 이메일 기반 가입을 처리하고 즉시 로그인 처리합니다.
 */
export async function signupUser(email: string, password: string): Promise<User> {
  await initializeDatabase();
  
  // 이메일 정합성 검사
  const exists = await db.users.findByEmail(email);
  if (exists) {
    throw new Error("이미 사용 중인 이메일 주소입니다.");
  }

  // 가입
  const newUser = await db.users.create({
    email,
    passwordHash: hashPassword(password),
    provider: "email"
  });

  // 로그인 처리
  await loginUser(email, password);

  return newUser;
}

/**
 * 5. 소셜 로그인 연동 모형을 위한 강제 세션 빌더 (시뮬레이터용)
 */
export async function loginSocialMock(email: string, provider: "google" | "kakao" | "naver"): Promise<User> {
  await initializeDatabase();
  let user = await db.users.findByEmail(email);

  if (!user) {
    // 최초 소셜 로그인 시 계정 자동 생성
    user = await db.users.create({
      email,
      passwordHash: null, // 패스워드 없음
      provider
    });
  }

  const token = generateRandomToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);

  await db.sessions.create(user.id, token, expires);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/"
  });

  const anonymousId = cookieStore.get(ANONYMOUS_COOKIE_NAME)?.value;
  if (anonymousId) {
    await db.profiles.linkAnonymousToUser(anonymousId, user.id);
  }

  return user;
}

/**
 * 6. 로그아웃을 처리하고 세션 쿠키를 만료(제거)시킵니다.
 */
export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (token) {
    await db.sessions.deleteByToken(token);
  }

  // 쿠키 파기
  cookieStore.set(SESSION_COOKIE_NAME, "", { maxAge: -1, path: "/" });
}

/**
 * 7. 회원 탈퇴 (Soft Delete 수행 후 보관 내역 정리)
 */
export async function deleteUserAccount(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("권한이 없습니다. 로그인 상태를 확인해 주세요.");
  }

  // Soft Delete 및 관련 프로필 Soft Delete
  await db.users.delete(user.id);
  
  // 모든 프로필 일괄 Soft Delete
  const profiles = await db.profiles.findByUserId(user.id);
  for (const p of profiles) {
    if (p.id) {
      await db.profiles.delete(p.id);
    }
  }

  // 로그아웃 처리
  await logoutUser();
}

import { redirect } from "next/navigation";

/**
 * 8. 로그인 보호가 필요한 페이지(서버 컴포넌트용)용 라우트 가드 헬퍼
 * 비인증 유저를 /login 페이지로 강제 리다이렉트 시키고, 인증 완료 시 사용자 객체를 리턴합니다.
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

