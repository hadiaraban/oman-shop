"use client";

import { ShoppingCart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useCartCount } from "@/lib/cart-store";
import { useHasMounted } from "@/lib/use-has-mounted";

export function CartIcon() {
  const mounted = useHasMounted();
  const count = useCartCount();

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
        <ShoppingCart className="h-5 w-5" />
        {mounted && count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </Button>
    </Link>
  );
}