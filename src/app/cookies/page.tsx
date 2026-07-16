import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";

export const metadata: Metadata = getMetadata({
  title: "광고 및 쿠키 안내",
  description: "꿈과 운의 사전 타사 맞춤형 광고 쿠키 사용 여부 정책 및 차단 방법 가이드",
  canonicalPath: "/cookies",
});

export default function CookiesPage() {
  const breadcrumbs = [{ name: "광고 및 쿠키 안내", path: "/cookies" }];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="max-w-3xl mx-auto space-y-6 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy font-serif">광고 및 쿠키 운영 방침</h1>
        <p className="text-xs text-navy/55">게시일: 2026년 7월 15일</p>

        <hr className="border-brand-border/60" />

        <div className="space-y-6 text-xs sm:text-sm text-navy/80 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy">1. 쿠키(Cookie)란 무엇인가요?</h2>
            <p>
              쿠키는 웹사이트가 이용자의 컴퓨터 브라우저에 전송하는 아주 작은 크기의 텍스트 파일입니다. 
              이를 통해 이용자의 마이페이지 로그인 상태, 최근 선택한 스프레드 선호 환경 등을 임시로 기억해 한층 쾌적한 웹 서핑을 도울 수 있습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy">2. 타사 광고 파트너 쿠키 수집</h2>
            <p>
              서비스는 지속적인 무료 운세 품질 개선 및 인프라 비용 조달을 위해 Google AdSense 등 타사 서드파티 광고 시스템을 도입할 예정입니다. 
              해당 파트너사들은 회원의 이전 방문 기록을 수집해 더 적합한 맞춤형 관심사 광고를 송출할 수 있습니다.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy">3. 쿠키 수집을 차단하고 싶습니다</h2>
            <p>
              회원은 웹 브라우저 설정을 통해 모든 쿠키를 거부하거나, 쿠키가 설정될 때마다 알림을 보내도록 변경할 수 있습니다. 
              단, 쿠키 수집을 전면 거부할 경우 마이페이지 로그인 유지 등의 특정 서비스 사용에 일부분 제약이 따를 수 있습니다.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
