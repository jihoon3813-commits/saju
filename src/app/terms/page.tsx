import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";

export const metadata: Metadata = getMetadata({
  title: "이용약관",
  description: "꿈과 운의 사전 서비스 표준 이용약관 및 면책범위 안내",
  canonicalPath: "/terms",
});

export default function TermsPage() {
  const breadcrumbs = [{ name: "이용약관", path: "/terms" }];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-3xl mx-auto space-y-6 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy font-serif">서비스 이용약관</h1>
        <p className="text-xs text-navy/55">최종 수정일: 2026년 7월 15일</p>

        <hr className="border-brand-border/60" />

        <div className="space-y-6 text-xs sm:text-sm text-navy/80 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy">제 1 조 (목적)</h2>
            <p>
              본 약관은 ‘꿈과 운의 사전’(이하 “회사” 또는 “서비스”)이 제공하는 사주 만세력 산출, AI 해설, 꿈해몽 사전 및 이와 관련된 정보 제공 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy">제 2 조 (의무 및 서비스의 성격)</h2>
            <p>
              회사가 제공하는 운세 결과, 사주 명식 및 AI 해설은 정통 동양 철학 이론을 근거로 도출되나, 회원의 삶에 대한 제언과 단순 참고용 레크리에이션 정보에 불과합니다. 
              의료, 투자, 법률 등 중대한 의사결정에 대한 대리적 책임은 전적으로 회원 본인에게 있으며, 회사는 운세 해석 결과에 따른 어떠한 직간접적 손해에 대해서도 민형사상 책임을 지지 않습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy">제 3 조 (프로필 보관 정책)</h2>
            <p>
              회원은 마이페이지 기능을 통해 본인 및 타인의 생년월일시 사주 정보를 등록 보관할 수 있습니다. 입력 정보는 암호화 통신으로 안전하게 전송되며, 회원이 직접 프로필을 삭제하거나 계정을 탈퇴할 경우 해당 정보는 기술적으로 복구 불가능한 형태로 즉시 완전 파기됩니다.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
