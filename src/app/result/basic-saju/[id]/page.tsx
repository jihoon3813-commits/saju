import React from "react";
import { InterpretationResultClient } from "@/components/interpretation/InterpretationResultClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BasicSajuResultPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">정통 만세력 기본사주</h1>
        <p className="text-sm text-slate-500 mt-2">전통 사주학 규칙 대조 및 경도 시차 보정을 마친 나만의 핵심 성향 보고서</p>
      </div>
      <InterpretationResultClient profileId={id} serviceType="basic-saju" />
    </div>
  );
}
