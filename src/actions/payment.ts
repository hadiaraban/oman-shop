"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createThawaniSession, getThawaniCheckoutUrl } from "@/lib/thawani";

export type StartPaymentResult =
  | { success: true; checkoutUrl: string }
  | { success: false; message: string };

export async function startThawaniPayment(
  orderId: string
): Promise<StartPaymentResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: "You must be signed in." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== userId) {
    return { success: false, message: "Order not found." };
  }

  if (order.status !== "PENDING") {
    return { success: false, message: "Order is already paid or cancelled." };
  }

  const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const result = await createThawaniSession({
    clientReferenceId: order.id,
    products: order.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      unitAmount: Math.round(Number(item.unitPrice) * 1000),
    })),
    successUrl: `${origin}/en/checkout/success?orderId=${order.id}`,
    cancelUrl: `${origin}/en/checkout/cancel?orderId=${order.id}`,
    metadata: {
      orderId: order.id,
      orderNo: order.orderNo,
    },
  });

  if (!result.success || !result.data) {
    return { success: false, message: result.message || "Payment failed." };
  }

  // ذخیره session_id در جدول Payment
  await prisma.payment.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      provider: "thawani",
      sessionId: result.data.session_id,
      status: "PENDING",
      amount: order.total,
    },
    update: {
      sessionId: result.data.session_id,
      status: "PENDING",
    },
  });

  return {
    success: true,
    checkoutUrl: getThawaniCheckoutUrl(result.data.session_id),
  };
}