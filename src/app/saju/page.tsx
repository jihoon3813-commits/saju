import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getMetadata } from "@/utils/seo";
import { Calendar } from "lucide-react";
import SajuInteractiveForm from "@/components/fortune/SajuInteractiveForm";

const MENU_META: Record<string, { serviceName: string; title: string; desc: string }> = {
  manse: {
    serviceName: "무료 만세력 조회",
    title: "무료 만세력 사주",
    desc: "나의 여덟 글자와 오행 분포를 정밀 계산하여 명식표를 도출합니다."
  },
  pyungsaeng: {
    serviceName: "평생 사주 종합",
    title: "평생 사주 종합 분석",
    desc: "타고난 평생 격국과 인생 주기(초/중/말년), 환경 기운의 종합 로드맵을 도출합니다."
  },
  daewun: {
    serviceName: "10대 대운 흐름",
    title: "10대 대운 흐름 분석",
    desc: "일생을 지배하는 10년 단위 대세운의 거시적인 파동과 터닝포인트를 읽습니다."
  },
  tojung: {
    serviceName: "신년 신수 비결",
    title: "2026 신토정비결",
    desc: "병오(丙午)년 한 해의 신년 총론 및 12개월의 상세 세운 비결서를 제작합니다."
  },
  monthly: {
    serviceName: "월간 종합 운세",
    title: "월간 종합 운세 조회",
    desc: "달마다 변화하는 길흉화복 기류와 31일 일자별 신살 및 운세 캘린더를 발행합니다."
  },
  today: {
    serviceName: "오늘의 일진 상세",
    title: "오늘의 일진 상세 분석",
    desc: "오늘 하루 나를 이끄는 핵심 에너지와 시간대별 구체적 행동 지침을 산출합니다."
  }
};

interface PageProps {
  searchParams: Promise<{ type?: string }> | { type?: string };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const type = searchParams?.type || "pyungsaeng";
  const meta = MENU_META[type] || MENU_META.pyungsaeng;
  
  return getMetadata({
    title: `${meta.title} | 꿈과 운의 사전`,
    description: meta.desc,
    canonicalPath: `/saju?type=${type}`,
  });
}

export default async function SajuPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const type = searchParams?.type || "pyungsaeng";
  const meta = MENU_META[type] || MENU_META.pyungsaeng;

  const breadcrumbs = [
    { name: "정통 사주", path: "/saju" },
    { name: meta.serviceName, path: `/saju?type=${type}` }
  ];

  return (
    <Container className="py-8 space-y-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center space-y-2 py-6">
          <span className="p-2.5 bg-navy/10 text-navy rounded-full inline-block mb-2">
            <Calendar className="w-6 h-6 animate-pulse" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy font-serif">{meta.title}</h1>
          <p className="text-sm text-navy/70 max-w-md mx-auto leading-relaxed">
            {meta.desc}
          </p>
        </div>

        {/* 실시간 연산 및 연동 지원 입력/피드백 영역 */}
        <SajuInteractiveForm />
      </div>
    </Container>
  );
}
