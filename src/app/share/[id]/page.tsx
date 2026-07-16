import React from "react";
import { Metadata } from "next";
import { getSharedLinkAction } from "@/app/actions/interpretation";
import { InterpretationResultClient } from "@/components/interpretation/InterpretationResultClient";
import { Lock } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string }>;
}

// 검색엔진 노출을 방지하기 위한 noindex 로봇 지침
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function SharedResultPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { key } = await searchParams;

  if (!key) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white border border-rose-100 p-8 rounded-3xl text-center shadow-sm space-y-4">
          <Lock className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-800">접근 불가능한 링크</h1>
          <p className="text-sm text-slate-500">보안 키가 누락되었거나 복사 경로가 온전하지 않습니다.</p>
        </div>
      </div>
    );
  }

  const res = await getSharedLinkAction(id, key);
  if (!res.success || !res.interpretation) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white border border-rose-100 p-8 rounded-3xl text-center shadow-sm space-y-4">
          <Lock className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-800">만료된 공유 카드</h1>
          <p className="text-sm text-slate-500">
            {res.error || "해당 공유 링크는 보안 만료 정책(7일 보관)에 의해 영구 삭제되었거나 존재하지 않습니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">공유된 운세 분석</h1>
        <p className="text-sm text-slate-500 mt-2">친구 또는 소중한 지인이 안전하게 생성하여 공유한 개인 성향 요약 카드입니다.</p>
      </div>
      <InterpretationResultClient 
        profileId="" 
        serviceType={res.interpretation.serviceType} 
        isSharedView={true} 
        prefetchedData={res.interpretation.reportData} 
      />
    </div>
  );
}
