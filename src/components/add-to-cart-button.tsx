"use client";

import { useCart } from "@/lib/cart-store";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check } from "lucide-react";

type Props = {
  product: {
    id: string;
    slug: string;
    nameEn: string;
    price: number | string | { toString(): string };
    images: string[];
  };
  disabled?: boolean;
};

export function AddToCartButton({ product, disabled }: Props) {
  const t = useTranslations("products");
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const priceStr =
      typeof product.price === "object"
        ? product.price.toString()
        : String(product.price);

    addItem({
      productId: product.id,
      slug: product.slug,
      nameEn: product.nameEn,
      price: parseFloat(priceStr),
      image: product.images[0],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Button
      size="lg"
      disabled={disabled}
      onClick={handleAdd}
      className="w-full md:w-auto"
    >
      {added ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          {t("addedToCart")}
        </>
      ) : (
        t("addToCart")
      )}
    </Button>
  );
}