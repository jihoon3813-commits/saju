import React from "react";
import { InterpretationResultClient } from "@/components/interpretation/InterpretationResultClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TodayFortunePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">오늘의 맞춤 운세</h1>
        <p className="text-sm text-slate-500 mt-2">나의 일간 성정 기류와 오늘 하루 흐름을 대조한 오늘의 액션 리포트</p>
      </div>
      <InterpretationResultClient profileId={id} serviceType="today" />
    </div>
  );
}
