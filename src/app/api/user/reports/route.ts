import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reportType, orderId, errorCode, versionInfo, content } = body;

    if (!reportType || !content || content.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "신고 종류와 최소 5자 이상의 피드백 내용을 채워주십시오." },
        { status: 400 }
      );
    }

    // 1. PII(개인식별정보) 노출 방지 마스킹 필터
    // 내용 중 전화번호 형태, 카드번호 형태 등을 간단한 정규식으로 마스킹
    let safeContent = content
      .replace(/\d{4}-\d{4}-\d{4}-\d{4}/g, "[CARD_MASKED]") // 카드번호
      .replace(/\d{3}-\d{3,4}-\d{4}/g, "[PHONE_MASKED]")    // 핸드폰번호
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_MASKED]"); // 이메일

    // 2. DB 신고 접수 생성
    const report = await db.userReports.create({
      reportType,
      orderId: orderId || null,
      errorCode: errorCode || null,
      versionInfo: versionInfo || "engine=1.0.0, prompt=1.0.0",
      content: safeContent
    });

    return NextResponse.json({
      success: true,
      report
    });
  } catch (err: any) {
    console.error("User reports creation API error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "신고 접수 중 서버 예외가 발생했습니다." },
      { status: 500 }
    );
  }
}
