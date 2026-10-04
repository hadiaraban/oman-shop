const THAWANI_BASE_URL =
  process.env.THAWANI_MODE === "live"
    ? "https://checkout.thawani.om"
    : "https://uatcheckout.thawani.om";

const THAWANI_API_URL = `${THAWANI_BASE_URL}/api/v1`;

type CreateSessionInput = {
  clientReferenceId: string;
  products: Array<{
    name: string;
    quantity: number;
    unitAmount: number; // به بيسه (1000 baisa = 1 OMR)
  }>;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

type CreateSessionResponse = {
  success: boolean;
  data?: {
    session_id: string;
    checkout_url: string;
  };
  message?: string;
};

export async function createThawaniSession(
  input: CreateSessionInput
): Promise<CreateSessionResponse> {
  const res = await fetch(`${THAWANI_API_URL}/checkout/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "thawani-api-key": process.env.THAWANI_SECRET_KEY!,
    },
    body: JSON.stringify({
      client_reference_id: input.clientReferenceId,
      mode: "payment",
      products: input.products,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: input.metadata,
    }),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    return {
      success: false,
      message: json.message || "Failed to create Thawani session.",
    };
  }

  return { success: true, data: json.data };
}

export function getThawaniCheckoutUrl(sessionId: string): string {
  return `${THAWANI_BASE_URL}/pay/${sessionId}`;
}

// --- دریافت اطلاعات Session (برای تأیید پرداخت) ---

type SessionDetails = {
  session_id: string;
  payment_status: "paid" | "unpaid" | "cancelled";
  client_reference_id: string;
  total_amount: number;
};

export async function getThawaniSession(
  sessionId: string
): Promise<SessionDetails | null> {
  const res = await fetch(`${THAWANI_API_URL}/checkout/session/${sessionId}`, {
    headers: {
      "thawani-api-key": process.env.THAWANI_SECRET_KEY!,
    },
  });

  if (!res.ok) return null;

  const json = await res.json();
  return json.success ? json.data : null;
}