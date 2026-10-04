import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { formatOMR } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ShoppingBag, DollarSign, Clock } from "lucide-react";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin.stats");

  const [totalProducts, totalOrders, pendingOrders, revenueAgg] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      }),
    ]);

  const totalRevenue = Number(revenueAgg._sum.total || 0);

  const stats = [
    {
      label: t("totalProducts"),
      value: totalProducts.toString(),
      icon: Package,
    },
    {
      label: t("totalOrders"),
      value: totalOrders.toString(),
      icon: ShoppingBag,
    },
    {
      label: t("pendingOrders"),
      value: pendingOrders.toString(),
      icon: Clock,
    },
    {
      label: t("totalRevenue"),
      value: formatOMR(totalRevenue),
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
    <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}