"use client";

import React from "react";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { HelpCircle } from "lucide-react";
import { FAQS } from "@/data/mockData";
import { Accordion } from "@/components/ui/Accordion";

export default function FAQPage() {
  const breadcrumbs = [{ name: "자주 묻는 질문", path: "/faq" }];

  // Accordion 컴포넌트 규격에 맞춰 FAQ 데이터 맵핑
  const accordionItems = FAQS.map((faq) => ({
    id: faq.id,
    title: faq.question,
    content: <p>{faq.answer}</p>,
  }));

  return (
    <Container className="py-8 space-y-8">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center space-x-3 border-b border-brand-border pb-4.5">
          <div className="p-2.5 bg-cream text-gold rounded-xl border border-brand-border">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy font-serif">자주 묻는 질문</h1>
            <p className="text-xs sm:text-sm text-navy/60 mt-0.5">
              사주 계산 기준, AI 정확도, 마이페이지 프로필 관련 궁금한 사항을 모았습니다.
            </p>
          </div>
        </div>

        {/* 아코디언 */}
        <Accordion items={accordionItems} allowMultiple={false} />
      </div>
    </Container>
  );
}
