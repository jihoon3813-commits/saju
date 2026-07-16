// 결제 제공자 및 트랜잭션 공통 규격 정의

export interface PreparePaymentParams {
  orderId: string;
  amount: number;
  currency: string;
  productTitle: string;
  returnUrl: string;
  failUrl: string;
}

export interface PreparePaymentResult {
  success: boolean;
  redirectUrl?: string; // 외부 결제창으로 이동할 URL (있는 경우)
  paymentToken?: string; // 결제 진행용 고유 토큰
  error?: string;
}

export interface ConfirmPaymentParams {
  orderId: string;
  amount: number;
  paymentKey?: string; // PG사 제공 결제 식별 키
  paymentToken?: string;
}

export interface ConfirmPaymentResult {
  success: boolean;
  providerOrderId?: string;
  paidAt?: Date;
  status: "paid" | "failed" | "cancelled";
  error?: string;
}

export interface RefundPaymentParams {
  providerOrderId: string;
  amount: number;
  reason: string;
}

export interface RefundPaymentResult {
  success: boolean;
  refundedAmount: number;
  refundedAt: Date;
  error?: string;
}

export interface PaymentProvider {
  name: "tosspayments" | "portone" | "mock" | "none";
  prepare(params: PreparePaymentParams): Promise<PreparePaymentResult>;
  confirm(params: ConfirmPaymentParams): Promise<ConfirmPaymentResult>;
  refund(params: RefundPaymentParams): Promise<RefundPaymentResult>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}
