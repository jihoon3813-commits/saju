/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { loginUser, signupUser, logoutUser, deleteUserAccount, loginSocialMock } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * 이메일 로그인 액션
 */
export async function handleEmailLogin(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }

  try {
    await loginUser(email, password);
    revalidatePath("/my");
    revalidatePath("/fortune/input");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "로그인 중 에러가 발생했습니다." };
  }
}

/**
 * 이메일 회원가입 액션
 */
export async function handleEmailSignup(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("passwordConfirm") as string;

  if (!email || !password || !passwordConfirm) {
    return { success: false, error: "모든 필드를 입력해 주세요." };
  }

  if (password !== passwordConfirm) {
    return { success: false, error: "비밀번호가 일치하지 않습니다." };
  }

  if (password.length < 6) {
    return { success: false, error: "비밀번호는 최소 6자 이상이어야 합니다." };
  }

  try {
    await signupUser(email, password);
    revalidatePath("/my");
    revalidatePath("/fortune/input");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "가입 중 에러가 발생했습니다." };
  }
}

/**
 * 로그아웃 액션
 */
export async function handleLogout() {
  try {
    await logoutUser();
    revalidatePath("/");
    revalidatePath("/login");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "로그아웃 중 에러가 발생했습니다." };
  }
}

/**
 * 회원 탈퇴 액션
 */
export async function handleDeleteAccount() {
  try {
    await deleteUserAccount();
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "탈퇴 중 에러가 발생했습니다." };
  }
}

/**
 * 간편 소셜 로그인 시뮬레이션용 액션
 */
export async function handleSocialLoginMock(email: string, provider: "google" | "kakao" | "naver") {
  if (!email) {
    return { success: false, error: "이메일 정보가 누락되었습니다." };
  }

  try {
    await loginSocialMock(email, provider);
    revalidatePath("/my");
    revalidatePath("/fortune/input");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "소셜 로그인 연동 중 에러가 발생했습니다." };
  }
}

/**
 * 구글 OAuth 서버 설정 검사 액션
 */
export async function getGoogleAuthConfig() {
  return {
    isConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  };
}
