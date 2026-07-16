import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { Mail, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = getMetadata({
  title: "1:1 문의하기",
  description: "꿈과 운의 사전 이용 관련 불편사항 및 제휴 문의 접수",
  canonicalPath: "/contact",
});

export default function ContactPage() {
  const breadcrumbs = [{ name: "문의하기", path: "/contact" }];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-2xl mx-auto space-y-8 py-4">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <span className="p-2.5 bg-cream text-gold rounded-full border border-brand-border inline-block mb-1">
            <Mail className="w-6 h-6" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy font-serif">1:1 문의하기</h1>
          <p className="text-xs sm:text-sm text-navy/70 leading-relaxed max-w-sm mx-auto">
            서비스 이용 에러 제보, 만세력 오류 문의, 사업 제휴 제안이 있으신 경우 작성해주시면 신속히 메일로 응답해 드립니다.
          </p>
        </div>

        {/* 폼 카드 */}
        <div className="bg-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <form className="space-y-4.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="이름" placeholder="홍길동" required />
              <Input label="회신받을 이메일" type="email" placeholder="hong@example.com" required />
            </div>

            <div className="space-y-1.5 w-full">
              <label className="text-sm font-semibold text-navy/80">문의 카테고리</label>
              <select className="w-full px-4 py-2.5 bg-surface border border-brand-border rounded-lg text-navy text-sm focus:outline-none focus:ring-2 focus:ring-gold/40">
                <option value="error">서비스 버그 및 기술 오류 제보</option>
                <option value="data">만세력 사주 풀이 상세 결과 피드백</option>
                <option value="partnership">사업 파트너십 및 제휴 제안</option>
                <option value="other">기타 이용 일반 문의</option>
              </select>
            </div>

            <Input label="제목" placeholder="문의사항 제목을 입력하세요." required />

            <div className="space-y-1.5 w-full">
              <label className="text-sm font-semibold text-navy/80">문의 내용</label>
              <textarea
                rows={5}
                placeholder="상세한 문의 내용을 남겨주세요."
                required
                className="w-full px-4 py-3 bg-surface border border-brand-border rounded-lg text-navy text-sm placeholder-navy/35 transition-all focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>

            <Button variant="primary" fullWidth className="font-bold min-h-[44px] mt-6">
              문의사항 제출하기
            </Button>
          </form>
        </div>
      </div>
    </Container>
  );
}
