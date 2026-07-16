import React from "react";
import { InterpretationResultClient } from "@/components/interpretation/InterpretationResultClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ targetId?: string }>;
}

export default async function CompatibilityFortunePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { targetId } = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">정통 만세력 궁합</h1>
        <p className="text-sm text-slate-500 mt-2">두 사람의 일주 조화와 오행 상생 흐름을 바탕으로 분석한 대화 및 공감대 가이드</p>
      </div>
      {targetId ? (
        <InterpretationResultClient profileId={id} profileId2={targetId} serviceType="compatibility" />
      ) : (
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-slate-100 rounded-3xl mt-12 shadow-sm">
          <p className="text-slate-500 text-sm">상대방의 사주 프로필이 정상적으로 매핑되지 않았습니다. 인풋 위저드로 다시 진입하여 매칭해주시기 바랍니다.</p>
        </div>
      )}
    </div>
  );
}
