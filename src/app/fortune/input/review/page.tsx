import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import FortuneInputReview from "@/components/fortune/FortuneInputReview";

export const metadata: Metadata = getMetadata({
  title: "입력 정보 최종 검토 | 꿈과 운의 사전",
  description: "사주 계산 요청 전 기입한 세부 명조 데이터를 총괄 요약 확인하고 개인정보 제공 동의를 수행합니다.",
  canonicalPath: "/fortune/input/review",
});

export default function FortuneInputReviewPage() {
  const breadcrumbs = [
    { name: "운세 입력", path: "/fortune/input" },
    { name: "최종 확인 및 동의", path: "/fortune/input/review" }
  ];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-3xl mx-auto text-center space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy font-serif">최종 검토 및 동의</h1>
        <p className="text-xs text-navy/70 max-w-md mx-auto leading-relaxed">
          분석 요청 전 기입하신 정보가 사주 명조 계산과 타임존 보정에 맞는지 한 번 더 체크해 주세요.
        </p>
      </div>

      <FortuneInputReview />
    </Container>
  );
}
