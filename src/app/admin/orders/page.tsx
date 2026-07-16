import { db } from "@/lib/db";
import OrderAdminClient from "@/components/admin/OrderAdminClient";

export const dynamic = "force-dynamic";

// 이메일 보안 마스킹 헬퍼
function maskEmail(email: string | null): string | null {
  if (!email) return null;
  const parts = email.split("@");
  if (parts.length < 2) return email;
  const username = parts[0];
  const domain = parts[1];
  if (username.length <= 2) {
    return `${username[0]}*@${domain}`;
  }
  return `${username.slice(0, 2)}${"*".repeat(username.length - 2)}@${domain}`;
}

// 사주 상세 파라미터 보안 마스킹 헬퍼
function maskChartIdInputs(chartIdStr: string | null): string {
  if (!chartIdStr) return "N/A";
  try {
    const inputs = JSON.parse(chartIdStr);
    const masked: Record<string, any> = {};

    if (inputs.profileId) {
      masked.profileId = inputs.profileId.slice(0, 8) + "...";
    }
    
    // 생년월일 날짜 끝자리 및 생년월시 시간 마스킹
    if (inputs.birthDate) {
      // 1990-10-12 -> 1990-10-**
      const dateParts = inputs.birthDate.split("-");
      if (dateParts.length === 3) {
        masked.birthDate = `${dateParts[0]}-${dateParts[1]}-**`;
      } else {
        masked.birthDate = "********";
      }
    }
    
    if (inputs.birthTime) {
      masked.birthTime = "**:**";
    }

    if (inputs.question) {
      // 질문 마스킹 (앞 10자만 노출하고 뒷단 마스킹)
      masked.question = inputs.question.slice(0, 10) + "...[마스킹보안]";
    }

    if (inputs.year) {
      masked.year = inputs.year;
    }

    return JSON.stringify(masked);
  } catch {
    return "데이터오류(마스킹)";
  }
}

export default async function AdminOrdersPage() {
  // 1. 전체 주문 로드 및 역순 정렬
  const orders = await db.orders.findAll();
  const sortedOrders = orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // 2. 전체 웹훅 로그 로드
  const webhookLogs = await db.webhookLogs.findAll();
  const sortedWebhookLogs = webhookLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // 3. 주문자 이메일 연계를 위한 유저 목록 로드
  const users = await db.users.findAll();
  const userEmailMap: Record<string, string> = {};
  users.forEach((u) => {
    userEmailMap[u.id] = u.email;
  });

  const products = await db.products.findAll();
  const productTitleMap: Record<string, string> = {};
  products.forEach((p) => {
    productTitleMap[p.id] = p.title;
  });

  // 4. 보안 마스킹 가공 처리
  const serializedOrders = sortedOrders.map((o) => {
    const rawEmail = o.userId ? userEmailMap[o.userId] : null;
    return {
      id: o.id,
      userId: o.userId,
      userEmail: maskEmail(rawEmail),
      productId: o.productId,
      productTitle: productTitleMap[o.productId] || "알 수 없는 상품",
      amount: o.amount,
      status: o.status,
      createdAt: o.createdAt,
      paidAt: o.paidAt || null,
      chartIdMasked: maskChartIdInputs(o.chartId)
    };
  });

  const serializedWebhookLogs = sortedWebhookLogs.map((wl) => ({
    id: wl.id,
    provider: wl.provider,
    payload: wl.payload,
    signature: wl.signature,
    processed: wl.processed,
    errorMessage: wl.errorMessage,
    createdAt: wl.createdAt
  }));

  return (
    <OrderAdminClient
      initialOrders={serializedOrders}
      webhookLogs={serializedWebhookLogs}
    />
  );
}
