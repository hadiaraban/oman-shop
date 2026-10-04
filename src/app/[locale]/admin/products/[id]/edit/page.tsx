import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/actions/admin/products";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("admin.productsPage");

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("edit")}</h1>

      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        cancelHref="/admin/products"
        initialValues={{
          nameEn: product.nameEn,
          slug: product.slug,
          price: product.price.toString(),
          stock: product.stock,
          categoryId: product.categoryId,
          description: product.description,
          images: product.images,
          isActive: product.isActive,
        }}
        labels={{
          nameEn: t("nameEn"),
          slug: t("slug"),
          price: t("price"),
          stock: t("stock"),
          category: t("category"),
          description: t("description"),
          images: t("images"),
          isActive: t("isActive"),
          save: t("save"),
          cancel: t("cancel"),
        }}
      />
    </div>
  );
}