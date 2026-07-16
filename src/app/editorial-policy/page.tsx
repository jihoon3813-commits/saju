import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export const metadata: Metadata = getMetadata({
  title: "콘텐츠 편집 원칙",
  description: "꿈과 운의 사전 공포 유발 마케팅 배제 및 AI 윤리 가이드라인 가치 준수 선언",
  canonicalPath: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  const breadcrumbs = [
    { name: "소개", path: "/about" },
    { name: "편집 원칙", path: "/editorial-policy" },
  ];

  return (
    <Container className="py-8 space-y-8">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-3xl mx-auto space-y-8 py-4">
        {/* 타이틀 */}
        <div className="space-y-3">
          <span className="text-xxs font-bold text-red-500 uppercase tracking-widest block">TRUST & ETHICS</span>
          <h1 className="text-3xl font-serif font-bold text-navy leading-tight">
            콘텐츠 제작 및 편집 원칙
          </h1>
          <p className="text-sm text-navy/70 leading-relaxed">
            저희 서비스는 사용자가 사주와 타로를 건전한 심리적 이정표이자 오락으로 즐길 수 있도록 돕습니다. 이를 위해 아래의 엄격한 가이드라인을 지켜 정보를 정제합니다.
          </p>
        </div>

        <hr className="border-brand-border/60" />

        {/* 세부 항목 */}
        <div className="space-y-6 text-sm text-navy/85 leading-relaxed">
          <div className="space-y-2.5">
            <h2 className="text-lg font-bold text-navy flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-gold" />
              <span>1. 공포/불안 유발 마케팅 배제</span>
            </h2>
            <p>
              사주에 살(殺)이 끼었다거나 오행이 치우쳤다는 점을 지나치게 강조하여 사용자의 불안감을 극대화하고, 액운을 막아야 한다며 부적, 개운 물품, 혹은 고액의 유료 상담을 강요하는 식의 무속 마케팅을 철저히 배제합니다.
            </p>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-lg font-bold text-navy flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-gold" />
              <span>2. 절대적 길흉 예언 금지 (면책 방침)</span>
            </h2>
            <p>
              삶은 개인의 의지와 환경의 변화가 조화를 이루어 결정됩니다. 사주로 사람의 사망 시기, 질병 여부, 특정 주식의 대박 여부, 로또 당첨 등을 확정적으로 예견하는 문장을 생성하지 않습니다. 
              운세백과와 AI 리포트는 어디까지나 현재 흘러가는 에너지의 경향성을 읽어 대처할 수 있게 돕는 조언지입니다.
            </p>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-lg font-bold text-navy flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-gold" />
              <span>3. AI 해석의 RAG 팩트 기반 제한</span>
            </h2>
            <p>
              인공지능(LLM)이 명리학 데이터를 임의로 상상하여 발생시킬 수 있는 오답(할루시네이션)을 방지하기 위해, 만세력 계산 모듈이 도출한 규칙 기반 팩트 데이터(천간, 지지, 십신, 오행 분포 수치)만을 주입(RAG)하여 설명 문장을 다듬도록 제약합니다.
            </p>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-lg font-bold text-navy flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-gold" />
              <span>4. 건전한 광고 배치 규정</span>
            </h2>
            <p>
              본 플랫폼의 유지를 위한 애드센스 등 광고는 입력 필드, 사주 산출 버튼, 타로 드로우 영역 바로 옆이나 결제 유도선에 겹치지 않게 조절하여, 사용자의 의도치 않은 광고 클릭(오클릭) 불편을 차단합니다.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
