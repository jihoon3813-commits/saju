import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { Cpu, HelpCircle } from "lucide-react";

export const metadata: Metadata = getMetadata({
  title: "만세력 계산 방법",
  description: "한국천문연구원 황경 고시 기준 24절기 산출식 및 균시차(진태양시) 보정 대운수 산정 공식 안내",
  canonicalPath: "/methodology",
});

export default function MethodologyPage() {
  const breadcrumbs = [
    { name: "소개", path: "/about" },
    { name: "만세력 계산법", path: "/methodology" },
  ];

  return (
    <Container className="py-8 space-y-8">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-3xl mx-auto space-y-8 py-4">
        {/* 타이틀 */}
        <div className="space-y-3">
          <span className="text-xxs font-bold text-gold uppercase tracking-widest block">MATHEMATICAL LOGIC</span>
          <h1 className="text-3xl font-serif font-bold text-navy leading-tight">
            만세력 및 대운 계산 원리
          </h1>
          <p className="text-sm text-navy/70 leading-relaxed">
            꿈과 운의 사전은 전통 자평명리학의 엄격한 천체 물리학적 관찰 공식에 기반하여 사주팔자를 계산합니다. AI가 사주팔자 데이터를 멋대로 상상하지 않으며, 아래와 같은 투명한 규칙에 따라 데이터를 먼저 확정한 후 해설을 도출합니다.
          </p>
        </div>

        <hr className="border-brand-border/60" />

        {/* 세부 기법 */}
        <div className="space-y-6 text-sm text-navy/85 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-navy flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-gold" />
              <span>1. 24절기 기준 월건(月建)의 분기</span>
            </h2>
            <p>
              사주에서 한 달의 기준은 달력의 1일이 아닌, 태양의 황경(黃經) 위치에 따른 <strong>24절기 입절(入節) 시각</strong>입니다. 
              예를 들어, 입춘(立春) 시각을 지나야 전년도에서 새로운 한 해(년주)와 달(월주)의 기운으로 넘어갑니다. 저희 계산 엔진은 천문 연구 기관의 절기 고시 데이터를 시간 초 단위까지 환산하여 절기 기준 오차가 없습니다.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-navy flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-gold" />
              <span>2. 진태양시(眞太陽時) 균시차 보정</span>
            </h2>
            <p>
              동경 135도 표준시(한국 표준시)는 인위적인 행정 시간선입니다. 실제 태양이 머리 위에 뜨는 남중(南中) 시각인 <strong>진태양시</strong> 기준의 균시차 보정을 적용합니다. 
              이를 통해 서울 기준 약 32분의 시간 오차를 정교하게 상쇄하여, 자시(子時) 경계에 태어난 사람들의 시주(時柱)가 바뀌는 뒤틀림 현상을 최소화합니다.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-navy flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-gold" />
              <span>3. 대운수(大運數) 및 대운 교체 시기 산출</span>
            </h2>
            <p>
              인생의 큰 기운 전환기인 10년 대운의 산정 공식은 태어난 날부터 다음 절기(또는 이전 절기)까지의 시·분·초 차이를 계산하여 3일당 1년으로 환산합니다. 
              소수점 아래 시각 차이까지 반영하여 첫 번째 대운 진입 나이(예: 8대운, 3대운 등)와 인생의 대운 교운기(交運期) 시점을 소수점 둘째 자리 수준으로 상세 산출합니다.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
