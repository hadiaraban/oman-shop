"use client";

import { useTransition, useState } from "react";
import { startThawaniPayment } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

type Props = {
  orderId: string;
};

export function PayNowButton({ orderId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handlePay = () => {
    setError("");
    startTransition(async () => {
      const result = await startThawaniPayment(orderId);
      if (!result.success) {
        setError(result.message);
        return;
      }
      // هدایت به درگاه Thawani
      window.location.href = result.checkoutUrl;
    });
  };

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className="w-full"
        onClick={handlePay}
        disabled={isPending}
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {isPending ? "Redirecting to payment..." : "Pay Now"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}