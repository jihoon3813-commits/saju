"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BirthProfile } from "@/schemas/fortune";
import { handleDeleteProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, MapPin, Trash2, Edit2, AlertTriangle } from "lucide-react";

interface ProfileCardProps {
  profile: BirthProfile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const onDelete = async () => {
    if (!profile.id) return;
    setDeleting(true);
    try {
      const res = await handleDeleteProfile(profile.id);
      if (res.success) {
        setShowConfirm(false);
      } else {
        alert(res.error || "삭제 중 오류가 발생했습니다.");
      }
    } catch {
      alert("서버 연결 실패");
    } finally {
      setDeleting(false);
    }
  };

  const getRelationshipLabel = (rel: string) => {
    switch (rel) {
      case "self": return "본인";
      case "family": return "가족";
      case "lover": return "연인/배우자";
      case "friend": return "친구";
      case "partner": return "동업자";
      default: return "기타";
    }
  };

  return (
    <div className="bg-surface border border-brand-border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden transition-all hover:border-gold/60">
      
      {/* 칩 헤더 */}
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-1 bg-cream text-navy/80 text-[10px] rounded-lg font-bold capitalize">
          {getRelationshipLabel(profile.relationship)}
        </span>
        
        <span className="text-[10px] text-navy/40 font-mono">
          ID: {profile.id?.substring(0, 8)}...
        </span>
      </div>

      {/* 바디 상세 */}
      <div className="space-y-2">
        <h3 className="text-base font-bold text-navy">{profile.alias}</h3>
        
        <div className="space-y-1 text-xxs text-navy/65 leading-normal">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>
              {profile.birthDate} • {profile.calendarType === "solar" ? "양력" : "음력"} 
              {profile.calendarType === "lunar" && ` (${profile.lunarLeapMonth ? "윤달" : "평달"})`}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>{profile.unknownBirthTime ? "출생 시간 모름" : profile.birthTime}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="truncate">{profile.birthCountry} {profile.birthCity} ({profile.timezone})</span>
          </div>
        </div>
      </div>

      {/* 하단 단추 */}
      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-brand-border/40">
        <Link href={`/my/profiles/${profile.id}/edit`}>
          <Button variant="secondary" size="sm" className="flex items-center space-x-1">
            <Edit2 className="w-3 h-3" />
            <span>수정</span>
          </Button>
        </Link>

        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => setShowConfirm(true)}
          className="text-red-500 hover:bg-red-50 flex items-center space-x-1"
        >
          <Trash2 className="w-3 h-3" />
          <span>삭제</span>
        </Button>
      </div>

      {/* 개별 확인 컨펌 모달 (카드 오버레이) */}
      {showConfirm && (
        <div className="absolute inset-0 bg-surface/95 backdrop-blur-xxs flex flex-col justify-center items-center p-4 text-center z-10 animate-fadeIn">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-1" />
          <h4 className="text-xs font-bold text-navy">정말 삭제하시겠습니까?</h4>
          <p className="text-[10px] text-navy/60 leading-normal mt-0.5 max-w-[180px]">
            삭제 후에는 복구가 불가하며 궁합 연동에서 빠집니다.
          </p>
          <div className="flex space-x-2 mt-3 w-full max-w-[180px]">
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              disabled={deleting} 
              onClick={() => setShowConfirm(false)}
            >
              취소
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              className="flex-1 bg-red-500 hover:bg-red-600 border-red-500 text-white"
              disabled={deleting} 
              onClick={onDelete}
            >
              {deleting ? "삭제 중.." : "확인"}
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
