import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getThawaniSession } from "@/lib/thawani";
import { formatOMR } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  if (!orderId || !userId) redirect("/");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order || order.userId !== userId) redirect("/");

  // اگر پرداخت هنوز تأیید نشده، از Thawani بپرس
  if (order.status === "PENDING" && order.payment?.sessionId) {
    const thawaniSession = await getThawaniSession(order.payment.sessionId);

    if (thawaniSession?.payment_status === "paid") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        }),
        prisma.payment.update({
          where: { orderId: order.id },
          data: { status: "PAID" },
        }),
      ]);
      order.status = "PAID";
    }
  }

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
          <h1 className="mb-2 text-2xl font-bold">Payment Successful</h1>
          <p className="mb-4 text-muted-foreground">
            Your order has been confirmed.
          </p>

          <div className="mb-6 rounded-lg bg-muted p-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order No</span>
              <span className="font-mono">{order.orderNo}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">
                {formatOMR(Number(order.total))}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link href={`/orders/${order.id}`}>
              <Button className="w-full">View Order</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}