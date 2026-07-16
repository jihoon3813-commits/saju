import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, getOrCreateAnonymousSession } from "@/lib/auth";
import { getManseChartAction } from "@/app/actions/manse";
import { generatePremiumReportPDF } from "@/lib/pdf/pdfGenerator";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. 주문 조회
    const order = await db.orders.findById(id);
    if (!order) {
      return NextResponse.json({ error: "주문 내역을 찾을 수 없습니다." }, { status: 444 });
    }

    if (order.status !== "completed" || !order.interpretationId) {
      return NextResponse.json({ error: "해석 생성이 완수되지 않은 주문건입니다." }, { status: 400 });
    }

    // 2. 권한/소유권 검증
    const user = await getCurrentUser();
    const anonSessionId = await getOrCreateAnonymousSession();

    let isOwner = false;
    if (order.userId) {
      if (user && order.userId === user.id) isOwner = true;
    } else {
      // 익명 프로필 매치
      const anonProfiles = await db.profiles.findByAnonymousSessionId(anonSessionId);
      const anonProfileIds = anonProfiles.map((p) => p.id);
      try {
        const inputs = JSON.parse(order.chartId || "{}");
        if (anonProfileIds.includes(inputs.profileId)) {
          isOwner = true;
        }
      } catch {
        // ignore
      }
    }

    // 관리자 예외 허용
    if (user && user.role === "admin") {
      isOwner = true;
    }

    if (!isOwner) {
      return NextResponse.json({ error: "이 리포트에 접근할 수 있는 권한이 없습니다." }, { status: 403 });
    }

    // 3. 연계 데이터 조회
    const product = await db.products.findById(order.productId);
    if (!product) {
      return NextResponse.json({ error: "상품 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const interpretation = await db.interpretations.findById(order.interpretationId);
    if (!interpretation) {
      return NextResponse.json({ error: "사주 해석서를 찾을 수 없습니다." }, { status: 404 });
    }

    // 대상자 이름 및 만세력 데이터 조회
    const inputs = JSON.parse(order.chartId || "{}");
    const profile = await db.profiles.findById(inputs.profileId || "");
    const chartRes = await getManseChartAction({ profileId: inputs.profileId });
    const chart = chartRes.success && chartRes.chart ? chartRes.chart : null;

    const userName = profile ? profile.alias : "사용자";

    // 4. PDF 생성
    const pdfBuffer = await generatePremiumReportPDF({
      orderId: order.id,
      productTitle: product.title,
      productType: product.productType,
      amount: order.amount,
      userName,
      chart,
      reportData: interpretation.reportData
    });

    // 5. 다운로드 헤더와 함께 스트림 응답
    const response = new NextResponse(new Uint8Array(pdfBuffer));
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename=Antigravity_Premium_Saju_Report_${id.slice(0, 8)}.pdf`
    );
    response.headers.set("Content-Length", pdfBuffer.length.toString());

    return response;
  } catch (err: any) {
    console.error("PDF download stream router error:", err);
    return NextResponse.json({ error: err.message || "PDF 생성 중 장애가 발생했습니다." }, { status: 500 });
  }
}
