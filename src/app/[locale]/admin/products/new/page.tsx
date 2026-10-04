import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { createProduct } from "@/actions/admin/products";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const t = await getTranslations("admin.productsPage");

  const categories = await prisma.category.findMany({
    orderBy: { nameEn: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("new")}</h1>

      <ProductForm
        action={createProduct}
        categories={categories}
        cancelHref="/admin/products"
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