import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatOMR } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PayNowButton } from "@/components/pay-now-button";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) notFound();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, address: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order {order.orderNo}</h1>
        <Badge>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.productName} x {item.quantity}
                  </span>
                  <span>{formatOMR(Number(item.unitPrice) * item.quantity)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-semibold">Summary</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatOMR(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">VAT</span>
              <span>{formatOMR(Number(order.vat))}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{formatOMR(Number(order.total))}</span>
            </div>
            {order.status === "PENDING" && (
              <div className="mt-4">
                <PayNowButton orderId={order.id} />
              </div>
            )}
            {order.address && (
              <div className="border-t pt-3 text-sm">
                <p className="font-medium">{order.address.fullName}</p>
                <p className="text-muted-foreground">{order.address.phone}</p>
                <p className="text-muted-foreground">{order.address.city}</p>
                <p className="text-muted-foreground">{order.address.details}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
