import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { Calendar } from "lucide-react";
import SajuInteractiveForm from "@/components/fortune/SajuInteractiveForm";

export const metadata: Metadata = getMetadata({
  title: "정통 사주 만세력",
  description: "한국천문연구원 천문 데이터 기반 절기 계산식 만세력과 나의 평생 대운 분석",
  canonicalPath: "/saju",
});

export default function SajuPage() {
  const breadcrumbs = [{ name: "정통 사주", path: "/saju" }];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center space-y-2 py-6">
          <span className="p-2.5 bg-navy/10 text-navy rounded-full inline-block mb-2">
            <Calendar className="w-6 h-6" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy">정통 만세력 사주</h1>
          <p className="text-sm text-navy/70 max-w-md mx-auto leading-relaxed">
            태어난 생년월일시를 절기 기준으로 환산하여 평생의 운세를 좌우하는 여덟 글자를 도출합니다.
          </p>
        </div>

        {/* 실시간 연산 및 연동 지원 입력/피드백 영역 */}
        <SajuInteractiveForm />
      </div>
    </Container>
  );
}
