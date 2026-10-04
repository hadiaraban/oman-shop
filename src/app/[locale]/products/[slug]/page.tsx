import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { formatOMR } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { nameEn: true, description: true, images: true },
  });

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.nameEn,
    description: product.description || `Buy ${product.nameEn} online in Oman.`,
    openGraph: {
      title: product.nameEn,
      description: product.description || undefined,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("products");

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const image = product.images[0];

  return (
    <main className="container mx-auto px-4 py-8">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToProducts")}
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.nameEn}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {product.category && (
            <p className="text-sm text-muted-foreground">
              {product.category.nameEn}
            </p>
          )}

          <h1 className="text-3xl font-bold">{product.nameEn}</h1>

          <p className="text-2xl font-semibold">
            {formatOMR(product.price)}
          </p>

          <div>
            {product.stock > 0 ? (
              <Badge variant="secondary">{t("inStock")}</Badge>
            ) : (
              <Badge variant="destructive">{t("outOfStock")}</Badge>
            )}
          </div>

          {product.description && (
            <div className="pt-2">
              <h2 className="mb-2 text-sm font-semibold">
                {t("description")}
              </h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          <div className="mt-4">
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                nameEn: product.nameEn,
                price: product.price.toString(),
                images: product.images,
              }}
              disabled={product.stock === 0}
            />
          </div>
        </div>
      </div>
    </main>
  );
}