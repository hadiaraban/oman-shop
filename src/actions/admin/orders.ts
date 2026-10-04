"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

const statusSchema = z.enum([
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export type OrderActionState = {
  success: boolean;
  message: string;
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<OrderActionState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = statusSchema.safeParse(newStatus);
  if (!parsed.success) {
    return { success: false, message: "Invalid status." };
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: parsed.data },
    });

    revalidatePath("/[locale]/admin/orders", "page");
    revalidatePath(`/[locale]/admin/orders/${orderId}`, "page");
    return { success: true, message: "Status updated." };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update status.";
    return { success: false, message };
  }
}