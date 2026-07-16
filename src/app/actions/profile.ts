/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/lib/db";
import { getCurrentUser, getOrCreateAnonymousSession } from "@/lib/auth";
import { BirthProfileSchema, BirthProfile } from "@/schemas/fortune";
import { revalidatePath } from "next/cache";

/**
 * 1. 신규 운세 프로필 생성 액션
 */
export async function handleCreateProfile(data: Omit<BirthProfile, "id" | "userId" | "anonymousSessionId">) {
  try {
    const user = await getCurrentUser();
    const anonymousSessionId = await getOrCreateAnonymousSession();

    // 입력 검증 (Zod)
    const validated = BirthProfileSchema.omit({ id: true, userId: true, anonymousSessionId: true }).parse(data);

    // 회원/비회원에 따른 식별자 주입
    const profileData = {
      ...validated,
      userId: user ? user.id : null,
      anonymousSessionId: user ? null : anonymousSessionId
    };

    const newProfile = await db.profiles.create(profileData);
    
    revalidatePath("/my/profiles");
    revalidatePath("/fortune/input");
    return { success: true, profile: newProfile };
  } catch (err: any) {
    console.error("Profile creation error:", err);
    return { success: false, error: err.message || "프로필 생성 중 오류가 발생했습니다." };
  }
}

/**
 * 2. 운세 프로필 수정 액션 (소유권 검증 포함)
 */
export async function handleUpdateProfile(id: string, data: Partial<Omit<BirthProfile, "id" | "userId" | "anonymousSessionId">>) {
  try {
    const user = await getCurrentUser();
    const anonymousSessionId = await getOrCreateAnonymousSession();

    // 1단계: 기존 프로필 조회 및 존재 여부 검사
    const existing = await db.profiles.findById(id);
    if (!existing) {
      return { success: false, error: "존재하지 않는 프로필입니다." };
    }

    // 2단계: 철저한 소유권 검사
    if (user) {
      // 회원인 경우: 프로필의 소유주 ID가 로그인 유저 ID와 일치해야 함
      if (existing.userId !== user.id) {
        return { success: false, error: "해당 프로필을 수정할 권한이 없습니다." };
      }
    } else {
      // 비회원인 경우: 임시 세션 토큰이 일치해야 함
      if (existing.anonymousSessionId !== anonymousSessionId) {
        return { success: false, error: "해당 프로필을 수정할 권한이 없습니다. 세션이 만료되었을 수 있습니다." };
      }
    }

    // 3단계: Zod 부분 검증
    const validated = BirthProfileSchema.partial().parse(data);

    // 4단계: 업데이트 실행
    const updated = await db.profiles.update(id, validated);

    revalidatePath("/my/profiles");
    revalidatePath(`/my/profiles/${id}/edit`);
    revalidatePath("/fortune/input");
    return { success: true, profile: updated };
  } catch (err: any) {
    console.error("Profile update error:", err);
    return { success: false, error: err.message || "프로필 수정 중 오류가 발생했습니다." };
  }
}

/**
 * 3. 운세 프로필 삭제 액션 (소유권 검증 및 Soft Delete 적용)
 */
export async function handleDeleteProfile(id: string) {
  try {
    const user = await getCurrentUser();
    const anonymousSessionId = await getOrCreateAnonymousSession();

    // 1단계: 기존 프로필 조회
    const existing = await db.profiles.findById(id);
    if (!existing) {
      return { success: false, error: "존재하지 않는 프로필입니다." };
    }

    // 2단계: 소유권 확인
    if (user) {
      if (existing.userId !== user.id) {
        return { success: false, error: "해당 프로필을 삭제할 권한이 없습니다." };
      }
    } else {
      if (existing.anonymousSessionId !== anonymousSessionId) {
        return { success: false, error: "해당 프로필을 삭제할 권한이 없습니다." };
      }
    }

    // 3단계: Soft Delete 수행
    await db.profiles.delete(id);

    revalidatePath("/my/profiles");
    revalidatePath("/fortune/input");
    return { success: true };
  } catch (err: any) {
    console.error("Profile deletion error:", err);
    return { success: false, error: err.message || "프로필 삭제 중 오류가 발생했습니다." };
  }
}

/**
 * 4. 회원가입 시 비회원 프로필 병합 트리거용 보조 액션 (마이그레이션용)
 */
export async function handleLinkAnonymousProfiles() {
  try {
    const user = await getCurrentUser();
    const anonymousSessionId = await getOrCreateAnonymousSession();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const linkedCount = await db.profiles.linkAnonymousToUser(anonymousSessionId, user.id);
    
    if (linkedCount > 0) {
      revalidatePath("/my/profiles");
      revalidatePath("/fortune/input");
    }

    return { success: true, count: linkedCount };
  } catch (err: any) {
    console.error("Linking anonymous profiles error:", err);
    return { success: false, error: err.message || "임시 프로필 병합 중 오류가 발생했습니다." };
  }
}

export async function handleGetProfilesAction() {
  try {
    const user = await getCurrentUser();
    const anonymousSessionId = await getOrCreateAnonymousSession();
    if (user) {
      const list = await db.profiles.findByUserId(user.id);
      return { success: true, list: list.filter((p) => !p.deletedAt) };
    } else {
      const list = await db.profiles.findByAnonymousSessionId(anonymousSessionId);
      return { success: true, list: list.filter((p) => !p.deletedAt) };
    }
  } catch (err: any) {
    console.error("Get profiles action error:", err);
    return { success: false, error: err.message || "프로필 목록 조회에 실패했습니다.", list: [] };
  }
}
