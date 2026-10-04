"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/actions/admin/products";
import { Button } from "@/components/ui/button";

type Props = {
  productId: string;
  label: string;
};

export function DeleteProductButton({ productId, label }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (!result.success) {
        alert(result.message);
      }
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? "..." : label}
    </Button>
  );
}