"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useCart, useCartSubtotal } from "@/lib/cart-store";
import { useHasMounted } from "@/lib/use-has-mounted";
import { formatOMR } from "@/lib/format";
import { createOrder } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const VAT_RATE = 0.05;

type Props = {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
};

export function CheckoutClient({ user }: Props) {
  const router = useRouter();
  const mounted = useHasMounted();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const subtotal = useCartSubtotal();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (mounted && items.length === 0 && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push("/cart");
    }
  }, [mounted, items.length, router]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Redirecting to cart...</p>
      </main>
    );
  }

  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const result = await createOrder({
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      address: {
        fullName: formData.get("fullName") as string,
        phone: formData.get("phone") as string,
        city: formData.get("city") as string,
        details: formData.get("details") as string,
      },
    });

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    clear();
    router.push(`/orders/${result.orderId}`);
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardContent className="space-y-4 p-6">
                <h2 className="text-lg font-semibold">Shipping Address</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      name="fullName"
                      defaultValue={user.name || ""}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Phone
                    </label>
                    <Input name="phone" type="tel" required />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">City</label>
                  <Input name="city" defaultValue="Muscat" required />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Address Details
                  </label>
                  <Input name="details" required />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-lg font-semibold">Order Summary</h2>

                <div className="space-y-2 text-sm">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {item.nameEn} × {item.quantity}
                      </span>
                      <span>{formatOMR(item.price * item.quantity)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatOMR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT (5%)</span>
                    <span>{formatOMR(vat)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-semibold">
                    <span>Total</span>
                    <span>{formatOMR(total)}</span>
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </main>
  );
}