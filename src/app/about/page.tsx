import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { Globe, Award, Sparkles, BookOpen } from "lucide-react";

export const metadata: Metadata = getMetadata({
  title: "꿈과 운의 사전 소개",
  description: "정통 명리학 공식에 입각한 정밀 만세력 계산 모듈과 심층 사주 해설을 제공하는 동양 철학 매거진 플랫폼 소개",
  canonicalPath: "/about",
});

export default function AboutPage() {
  const breadcrumbs = [{ name: "소개", path: "/about" }];

  return (
    <Container className="py-8 space-y-8">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-3xl mx-auto space-y-8 py-4">
        {/* 타이틀 */}
        <div className="space-y-3">
          <span className="text-xxs font-bold text-gold uppercase tracking-widest block">ABOUT US</span>
          <h1 className="text-3xl font-serif font-bold text-navy leading-tight">
            오늘의 흐름부터 평생의 방향까지,
            <br />
            진정한 나를 마주하는 이정표
          </h1>
          <p className="text-sm text-navy/70 leading-relaxed">
            ‘꿈과 운의 사전’은 수천 년 역사의 자평명리학 공식에 현대적 해설 프레임워크를 적용하여, 사용자가 자신의 성향을 객관적으로 파악하고 인생의 방향을 찾도록 돕는 사주 전문 정보 플랫폼입니다.
          </p>
        </div>

        <hr className="border-brand-border/60" />

        {/* 3대 정체성 소개 */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-navy font-serif">우리가 지향하는 세 가지 가치</h2>
          
          <div className="space-y-4">
            <div className="bg-surface border border-brand-border rounded-xl p-5 shadow-xs flex items-start space-x-3.5">
              <span className="p-2.5 bg-cream text-gold rounded-lg shrink-0 mt-0.5">
                <Globe className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-navy">철저한 만세력 공식의 계산</h3>
                <p className="text-xs text-navy/75 leading-relaxed mt-1">
                  점술가의 임의적 기복 마케팅이 아닌, 한국천문연구원 등의 태양 황경 기준 공식을 충실히 반영하여 오차 없는 만세력 사주팔자를 도출합니다.
                </p>
              </div>
            </div>

            <div className="bg-surface border border-brand-border rounded-xl p-5 shadow-xs flex items-start space-x-3.5">
              <span className="p-2.5 bg-cream text-gold rounded-lg shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-navy">명리학 대가의 분석 규칙에 근거한 해설</h3>
                <p className="text-xs text-navy/75 leading-relaxed mt-1">
                  도출된 사주 및 타로 데이터를 명리학 전문가들의 입증된 분석 패턴과 결합하여 깊이 있고 이해하기 쉬운 상세 간명지로 조율해 드립니다. 자의적인 공포 유발 해석이나 개운(開運) 물품 구매 유도를 철저히 배제합니다.
                </p>
              </div>
            </div>

            <div className="bg-surface border border-brand-border rounded-xl p-5 shadow-xs flex items-start space-x-3.5">
              <span className="p-2.5 bg-cream text-gold rounded-lg shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-navy">지속 가능한 동양 지혜 보관소</h3>
                <p className="text-xs text-navy/75 leading-relaxed mt-1">
                  꿈해몽, 사주 기초 이론, 타로 카드 의미 등 파편화되어 떠도는 지식들을 전문가 검증을 통해 깔끔히 문서화(백과)하여 언제든 쉽게 찾아볼 수 있게 합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
