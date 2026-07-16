import {
  PaymentProvider,
  PreparePaymentParams,
  PreparePaymentResult,
  ConfirmPaymentParams,
  ConfirmPaymentResult,
  RefundPaymentParams,
  RefundPaymentResult
} from "./PaymentProvider";

export class MockPaymentProvider implements PaymentProvider {
  name = "mock" as const;

  async prepare(params: PreparePaymentParams): Promise<PreparePaymentResult> {
    const paymentToken = `mock_token_${Math.random().toString(36).substring(2, 15)}`;
    return {
      success: true,
      paymentToken,
      redirectUrl: `/checkout/mock-gateway?orderId=${params.orderId}&token=${paymentToken}&amount=${params.amount}`
    };
  }

  async confirm(params: ConfirmPaymentParams): Promise<ConfirmPaymentResult> {
    if (params.amount <= 0) {
      return {
        success: false,
        status: "failed",
        error: "결제 금액이 유효하지 않습니다."
      };
    }

    const providerOrderId = `mock_prov_order_${Math.random().toString(36).substring(2, 15)}`;

    // 서버 환경인 경우, 실제 결제사의 비동기 웹훅 처리를 모사하기 위해 백그라운드 fetch 수행
    if (typeof window === "undefined") {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const webhookUrl = `${siteUrl}/api/payment/webhook`;

      const payload = JSON.stringify({
        orderId: params.orderId,
        providerOrderId,
        amount: params.amount,
        status: "paid",
        eventType: "PAYMENT_CONFIRMED"
      });

      const signature = "mock_webhook_sig_valid";

      // Fire and forget
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-signature": signature
        },
        body: payload
      }).catch((err) => {
        console.error("Mock PG webhook simulation async fetch error (can ignore in offline test):", err);
      });
    }

    return {
      success: true,
      providerOrderId,
      paidAt: new Date(),
      status: "paid"
    };
  }

  async refund(params: RefundPaymentParams): Promise<RefundPaymentResult> {
    if (params.amount <= 0) {
      return {
        success: false,
        refundedAmount: 0,
        refundedAt: new Date(),
        error: "환불 금액이 올바르지 않습니다."
      };
    }
    return {
      success: true,
      refundedAmount: params.amount,
      refundedAt: new Date()
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // 가상 서명 검증: 서명이 일치하는 경우만 성공 처리
    return signature === "mock_webhook_sig_valid";
  }
}

export function getPaymentProvider(providerName?: string): PaymentProvider {
  const pgProvider = providerName || process.env.PAYMENT_PROVIDER || "mock";

  // 운영(Production) 환경에서 결제사가 정의되지 않고 mock도 아닐 때는 none 프로바이더를 할당
  if (process.env.NODE_ENV === "production" && pgProvider !== "mock" && !process.env.PAYMENT_PROVIDER) {
    return {
      name: "none",
      async prepare() {
        return { success: false, error: "운영 환경 결제 모듈이 구성되지 않았습니다." };
      },
      async confirm() {
        return { success: false, status: "failed", error: "결제 모듈이 구성되지 않았습니다." };
      },
      async refund() {
        return { success: false, refundedAmount: 0, refundedAt: new Date(), error: "결제 모듈이 구성되지 않았습니다." };
      },
      verifyWebhookSignature() {
        return false;
      }
    };
  }

  if (pgProvider === "mock") {
    return new MockPaymentProvider();
  }

  // fallback none
  return {
    name: "none",
    async prepare() {
      return { success: false, error: "지원하지 않는 결제 제공자입니다." };
    },
    async confirm() {
      return { success: false, status: "failed", error: "지원하지 않는 결제 제공자입니다." };
    },
    async refund() {
      return { success: false, refundedAmount: 0, refundedAt: new Date(), error: "지원하지 않는 결제 제공자입니다." };
    },
    verifyWebhookSignature() {
      return false;
    }
  };
}
