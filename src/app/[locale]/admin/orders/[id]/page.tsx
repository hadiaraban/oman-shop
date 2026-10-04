import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatOMR } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, address: true, user: true },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{order.orderNo}</h1>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
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

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-2 p-6">
              <h2 className="mb-2 text-lg font-semibold">Customer</h2>
              <p className="text-sm">{order.user?.name || "—"}</p>
              <p className="text-sm text-muted-foreground">{order.user?.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-6">
              <h2 className="mb-2 text-lg font-semibold">Summary</h2>
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
            </CardContent>
          </Card>

          {order.address && (
            <Card>
              <CardContent className="space-y-1 p-6 text-sm">
                <h2 className="mb-2 text-lg font-semibold">Shipping</h2>
                <p className="font-medium">{order.address.fullName}</p>
                <p className="text-muted-foreground">{order.address.phone}</p>
                <p className="text-muted-foreground">{order.address.city}</p>
                <p className="text-muted-foreground">{order.address.details}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}