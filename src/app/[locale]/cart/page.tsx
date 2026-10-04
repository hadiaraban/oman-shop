"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart, useCartSubtotal } from "@/lib/cart-store";
import { useHasMounted } from "@/lib/use-has-mounted";
import { formatOMR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Minus, Plus } from "lucide-react";

const VAT_RATE = 0.05;

export default function CartPage() {
  const t = useTranslations("cart");
  const tProducts = useTranslations("products");
  const mounted = useHasMounted();
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCartSubtotal();

  // قبل از mount، برای جلوگیری از hydration mismatch چیزی نشان نده
  if (!mounted) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">...</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">{t("title")}</h1>
        <p className="mb-6 text-muted-foreground">{t("empty")}</p>
        <Link href="/products">
          <Button size="lg">{t("emptyCta")}</Button>
        </Link>
      </main>
    );
  }

  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* لیست آیتم‌ها */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.productId}>
                <CardContent className="flex gap-4 p-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.nameEn}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {item.nameEn}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatOMR(item.price)}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="font-semibold">
                          {formatOMR(item.price * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.productId)}
                          aria-label={t("remove")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* خلاصه سفارش */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold">{t("subtotal")}</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <span>{formatOMR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("vat")}</span>
                  <span>{formatOMR(vat)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                  <span>{t("total")}</span>
                  <span>{formatOMR(total)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full" size="lg">
                  {t("checkout")}
                </Button>
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                {tProducts("title")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}