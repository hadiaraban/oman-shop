"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductFormState } from "@/actions/admin/products";

type Category = { id: string; nameEn: string };

type Props = {
  action: (
    prev: ProductFormState,
    formData: FormData
  ) => Promise<ProductFormState>;
  categories: Category[];
  labels: {
    nameEn: string;
    slug: string;
    price: string;
    stock: string;
    category: string;
    description: string;
    images: string;
    isActive: string;
    save: string;
    cancel: string;
  };
  cancelHref: string;
  initialValues?: {
    nameEn: string;
    slug: string;
    price: string;
    stock: number;
    categoryId: string | null;
    description: string | null;
    images: string[];
    isActive: boolean;
  };
};

const initialState: ProductFormState = { success: false, message: "" };

export function ProductForm({
  action,
  categories,
  labels,
  cancelHref,
  initialValues,
}: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <Card>
      <CardContent className="p-6">
        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{labels.nameEn}</label>
            <Input name="nameEn" defaultValue={initialValues?.nameEn} required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{labels.slug}</label>
            <Input
              name="slug"
              defaultValue={initialValues?.slug}
              required
              pattern="[a-z0-9-]+"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">{labels.price}</label>
              <Input
                name="price"
                type="number"
                step="0.001"
                min="0"
                defaultValue={initialValues?.price}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{labels.stock}</label>
              <Input
                name="stock"
                type="number"
                min="0"
                defaultValue={initialValues?.stock}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{labels.category}</label>
            <select
              name="categoryId"
              defaultValue={initialValues?.categoryId || ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{labels.description}</label>
            <textarea
              name="description"
              defaultValue={initialValues?.description || ""}
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{labels.images}</label>
            <textarea
              name="images"
              defaultValue={initialValues?.images.join("\n")}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              defaultChecked={initialValues?.isActive ?? true}
              className="h-4 w-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              {labels.isActive}
            </label>
          </div>

          {state.message && (
            <p
              className={`text-sm ${
                state.success ? "text-green-600" : "text-destructive"
              }`}
            >
              {state.message}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "..." : labels.save}
            </Button>
            <a href={cancelHref}>
              <Button type="button" variant="outline">
                {labels.cancel}
              </Button>
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}