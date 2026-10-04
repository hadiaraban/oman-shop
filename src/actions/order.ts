"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  address: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(5),
    city: z.string().min(2),
    details: z.string().min(3),
  }),
});

type CreateOrderInput = z.infer<typeof orderSchema>;

export type CreateOrderResult =
  | { success: true; orderId: string }
  | { success: false; message: string };

const VAT_RATE = 0.05;

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
    const session = await auth();
    const userId = session?.user?.id;
        if (!userId) {
            return { success: false, message: "You must be signed in." };
        }

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Invalid order data." };
  }

  const { items, address } = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // ۱. محصولات را از دیتابیس بخوان (قیمت واقعی، نه قیمت کلاینت)
      const productIds = items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });

      if (products.length !== items.length) {
        throw new Error("One or more products are unavailable.");
      }

      // ۲. چک موجودی
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId)!;
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.nameEn}.`);
        }
      }

      // ۳. محاسبه قیمت‌ها با قیمت واقعی دیتابیس
      let subtotal = 0;
      const orderItems = items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        const unitPrice = Number(product.price);
        subtotal += unitPrice * item.quantity;
        return {
          productId: product.id,
          productName: product.nameEn,
          quantity: item.quantity,
          unitPrice: product.price,
        };
      });

      const vat = subtotal * VAT_RATE;
      const total = subtotal + vat;

      // ۴. ساخت آدرس
      const newAddress = await tx.address.create({
        data: {
          userId: userId,
          fullName: address.fullName,
          phone: address.phone,
          city: address.city,
          details: address.details,
        },
      });

      // ۵. ساخت سفارش با آیتم‌ها
      const orderNo = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newOrder = await tx.order.create({
        data: {
          orderNo,
          userId: userId,
          status: "PENDING",
          subtotal,
          vat,
          total,
          currency: "OMR",
          addressId: newAddress.id,
          items: {
            create: orderItems,
          },
        },
      });

      // ۶. کاهش موجودی
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return { success: true, orderId: order.id };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create order.";
    return { success: false, message };
  }
}