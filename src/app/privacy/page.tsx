import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";

export const metadata: Metadata = getMetadata({
  title: "개인정보처리방침",
  description: "꿈과 운의 사전 회원 사주 생년월일시 정보 암호화 수집 및 파기 절차 규정",
  canonicalPath: "/privacy",
});

export default function PrivacyPage() {
  const breadcrumbs = [{ name: "개인정보처리방침", path: "/privacy" }];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-3xl mx-auto space-y-6 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy font-serif">개인정보처리방침</h1>
        <p className="text-xs text-navy/55">시행 일자: 2026년 7월 15일</p>

        <hr className="border-brand-border/60" />

        <div className="space-y-6 text-xs sm:text-sm text-navy/80 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy">1. 개인정보 수집 항목 및 목적</h2>
            <p>
              서비스는 비가입 상태에서의 1회성 운세 산출 또는 회원 보관용 목적으로 아래와 같은 필수 항목을 수집합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li><strong>사주 계산 정보:</strong> 성별, 생년월일시 (음/양력 구분)</li>
              <li><strong>소셜 로그인 정보:</strong> 고유 식별 이메일 주소, 프로필 닉네임</li>
            </ul>
            <p>수집된 생년월일시는 오직 정통 명리학에 근거한 운세 지표 산출과 AI 해설 제공을 위한 목적으로만 처리됩니다.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy">2. 개인정보의 보유 및 파기 정책</h2>
            <p>
              회원 프로필로 등록된 정보는 계정 탈퇴나 등록 철회 시 즉시 DB에서 물리적으로 복구 불가하게 삭제 처리됩니다. 비가입 상태로 운세를 산출한 1회성 입력 데이터는 브라우저 세션이 종료되는 대로 파기됩니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy">3. 개인정보의 안전성 조치</h2>
            <p>
              전송 중 탈취 방지를 위해 통신 구간은 SSL/TLS 암호화(HTTPS) 통신 규격을 준수하며, 보관되는 생년월일시 및 비밀번호 등은 유출 시 위험이 큰 항목이므로 암호화 인덱스로 엄밀히 통제됩니다.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
