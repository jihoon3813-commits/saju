import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { Globe, Award, Sparkles, BookOpen } from "lucide-react";

export const metadata: Metadata = getMetadata({
  title: "꿈과 운의 사전 소개",
  description: "절기 기반 천문 규칙 만세력 엔진과 최신 AI 해설 기술로 구현한 명학 매거진 플랫폼 가치 소개",
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
            ‘꿈과 운의 사전’은 수천 년 역사의 명리학 공식에 첨단 AI 기술을 입혀, 사용자가 자신의 성향을 객관적으로 파악하고 더 풍요로운 선택을 할 수 있도록 안내하는 현대적 동양 철학 정보 플랫폼입니다.
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
                <h3 className="font-bold text-sm text-navy">생성형 AI 기술의 도덕적 활용</h3>
                <p className="text-xs text-navy/75 leading-relaxed mt-1">
                  도출된 사주 및 타로 데이터를 바탕으로 AI가 공감력 있고 읽기 쉬운 해설로 조율해 드립니다. 두려움을 유발하여 개운(開運) 물품 구매를 유도하는 자의적 해석을 배제합니다.
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
