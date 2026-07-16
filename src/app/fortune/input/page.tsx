import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMetadata } from "@/utils/seo";

interface PageProps {
  searchParams: Promise<{ type?: string; autoRestore?: string }> | { type?: string; autoRestore?: string };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const type = searchParams?.type || "pyungsaeng";
  
  return getMetadata({
    title: "사주 정보 입력 | 꿈과 운의 사전",
    description: "사주 명조 산출을 위한 통합 입력 페이지로 이동합니다.",
    canonicalPath: "/fortune/input",
  });
}

export default async function FortuneInputPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const type = searchParams?.type || "pyungsaeng";
  
  // 1스텝 입력 방식으로 개편됨에 따라 즉시 통합 입력 페이지(/saju)로 안전 이동시킵니다.
  redirect(`/saju?type=${type}`);
}
