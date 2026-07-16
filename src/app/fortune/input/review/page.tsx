import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMetadata } from "@/utils/seo";

interface PageProps {
  searchParams: Promise<{ type?: string }> | { type?: string };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const type = searchParams?.type || "pyungsaeng";
  
  return getMetadata({
    title: "사주 정보 최종 확인 | 꿈과 운의 사전",
    description: "사주 명조 정보 최종 확인 페이지로 이동합니다.",
    canonicalPath: "/fortune/input/review",
  });
}

export default async function FortuneInputReviewPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const type = searchParams?.type || "pyungsaeng";

  // 리뷰/동의 단계는 단축 파이프라인에 의해 폐기되었으므로 /saju 로 즉시 리다이렉트합니다.
  redirect(`/saju?type=${type}`);
}
