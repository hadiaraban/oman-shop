import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

type ThawaniWebhookPayload = {
  session_id?: string;
  payment_status?: "paid" | "unpaid" | "cancelled";
  client_reference_id?: string;
  total_amount?: number;
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hmac-signature");
  const secret = process.env.THAWANI_WEBHOOK_SECRET;

  if (secret && signature) {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("base64");

    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: ThawaniWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as ThawaniWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = payload.session_id;
  const paymentStatus = payload.payment_status;

  if (!sessionId || !paymentStatus) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { sessionId },
    include: { order: true },
  });

  if (!payment || !payment.order) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (payment.order.status === "PAID") {
    return NextResponse.json({ ok: true });
  }

  if (paymentStatus === "paid") {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID" },
      }),
      prisma.payment.update({
        where: { orderId: payment.orderId },
        data: { status: "PAID" },
      }),
    ]);
  } else if (paymentStatus === "cancelled") {
    await prisma.payment.update({
      where: { orderId: payment.orderId },
      data: { status: "CANCELLED" },
    });
  }

  return NextResponse.json({ ok: true });
}