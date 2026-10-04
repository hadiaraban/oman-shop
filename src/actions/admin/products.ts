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
  return session.user;
}

const productSchema = z.object({
  nameEn: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().optional(),
  images: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type ProductFormState = {
  success: boolean;
  message: string;
};

function parseImages(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = productSchema.safeParse({
    nameEn: formData.get("nameEn"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId") || undefined,
    images: formData.get("images") || undefined,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid data." };
  }

  const { nameEn, slug, description, price, stock, categoryId, images, isActive } = parsed.data;

  try {
    await prisma.product.create({
      data: {
        nameEn,
        slug,
        description,
        price,
        stock,
        categoryId: categoryId || null,
        images: parseImages(images),
        isActive: isActive ?? true,
      },
    });

    revalidatePath("/[locale]/admin/products", "page");
    return { success: true, message: "Product created." };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create product.";
    return { success: false, message };
  }
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  const parsed = productSchema.safeParse({
    nameEn: formData.get("nameEn"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId") || undefined,
    images: formData.get("images") || undefined,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid data." };
  }

  const { nameEn, slug, description, price, stock, categoryId, images, isActive } = parsed.data;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        nameEn,
        slug,
        description,
        price,
        stock,
        categoryId: categoryId || null,
        images: parseImages(images),
        isActive: isActive ?? true,
      },
    });

    revalidatePath("/[locale]/admin/products", "page");
    return { success: true, message: "Product updated." };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update product.";
    return { success: false, message };
  }
}

export async function deleteProduct(id: string): Promise<ProductFormState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/[locale]/admin/products", "page");
    return { success: true, message: "Product deleted." };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete product.";
    return { success: false, message };
  }
}