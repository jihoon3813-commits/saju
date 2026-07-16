"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { handleDeleteAccount } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Trash2, AlertTriangle, ShieldCheck, Mail, Calendar } from "lucide-react";

interface AccountSettingsProps {
  userEmail: string;
  userProvider: string;
}

export default function AccountSettings({ userEmail, userProvider }: AccountSettingsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<boolean>(false);
  const [consentDelete, setConsentDelete] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const handleAccountDeletion = async () => {
    if (!consentDelete) {
      alert("탈퇴 조항 동의에 체크해 주세요.");
      return;
    }
    setDeleting(true);
    try {
      const res = await handleDeleteAccount();
      if (res.success) {
        alert("회원 탈퇴 및 개인정보 파기가 무사히 처리되었습니다. 그동안 이용해 주셔서 감사합니다.");
        router.push("/");
        router.refresh();
      } else {
        alert(res.error || "탈퇴 처리 중 오류가 발생했습니다.");
      }
    } catch {
      alert("서버 연결 실패");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. 계정 정보 요약 카드 */}
      <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-navy border-b border-brand-border/60 pb-3 flex items-center space-x-1.5">
          <Mail className="w-5 h-5 text-gold" />
          <span>기본 연결 정보</span>
        </h2>
        <div className="space-y-2.5 text-xs text-navy/80">
          <div>연동 계정 이메일: <strong className="text-navy">{userEmail}</strong></div>
          <div className="capitalize">인증 프로바이더: <strong className="text-navy">{userProvider}</strong></div>
          <div>회원 레벨: <strong className="text-navy text-gold">일반 회원 (Standard)</strong></div>
        </div>
      </div>

      {/* 2. 회원 탈퇴 위험 구간 */}
      <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-red-800 border-b border-red-200 pb-3 flex items-center space-x-1.5">
          <Trash2 className="w-5 h-5 text-red-600" />
          <span>회원 탈퇴 및 전체 데이터 파기</span>
        </h2>

        <div className="bg-white border border-red-200 p-4 rounded-xl flex items-start space-x-2 text-xxs text-red-800 leading-relaxed">
          <AlertTriangle className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>⚠️ 경고: 회원 탈퇴 시 발생하는 데이터 소멸 범위</strong>
            <ul className="list-disc list-inside space-y-0.5 text-red-700">
              <li>회원님의 계정 세션 및 계정 연결정보 영구 폐기</li>
              <li>보관함에 등록된 모든 사주 프로필(본인 및 가족/지인) 물리적 삭제 및 회생 불가</li>
              <li>기존에 보존되어 있던 타로 및 일일 종합 분석 내역 일괄 파기</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <label className="flex items-start space-x-2.5 text-xxs font-semibold text-navy/75 cursor-pointer leading-normal min-h-[44px]">
            <input 
              type="checkbox" 
              checked={consentDelete}
              onChange={(e) => setConsentDelete(e.target.checked)}
              className="w-4.5 h-4.5 accent-red-600 border-brand-border rounded mt-0.5 shrink-0"
            />
            <span>위의 유실 고지를 숙지하였으며, 보관함 내 모든 사주 프로필의 즉시 파기 및 회원 탈퇴에 동의합니다.</span>
          </label>

          {!showConfirm ? (
            <Button 
              type="button" 
              variant="secondary"
              disabled={!consentDelete}
              onClick={() => setShowConfirm(true)}
              className="text-red-500 hover:bg-red-100/60 border-red-200 w-full min-h-[44px] text-xs font-bold"
            >
              회원 탈퇴 진행하기
            </Button>
          ) : (
            <div className="space-y-2 p-3 bg-red-100/20 border border-red-200 rounded-xl text-center">
              <p className="text-xxs text-red-800 font-bold">정말 최종 탈퇴를 확정하시겠습니까?</p>
              <div className="flex space-x-2 justify-center pt-1.5">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setShowConfirm(false)}
                  disabled={deleting}
                >
                  취소
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 border-red-600 text-white font-bold"
                  onClick={handleAccountDeletion}
                  disabled={deleting}
                >
                  {deleting ? "탈퇴 처리 중..." : "확인, 최종 탈퇴"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-navy/40 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-sage" />
          <span>보안 인증 데이터베이스 1:1 세션 해지 보증</span>
        </p>
      </div>

    </div>
  );
}
