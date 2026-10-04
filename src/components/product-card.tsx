import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatOMR } from "@/lib/format";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    nameEn: string;
    price: number | string | { toString(): string };
    images: string[];
    stock: number;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("products");
  const image = product.images[0];

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <Card className="overflow-hidden transition hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.nameEn}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {product.stock === 0 && (
            <Badge variant="destructive" className="absolute left-2 top-2">
              {t("outOfStock")}
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-col gap-2 p-4">
          <h3 className="line-clamp-2 font-medium">{product.nameEn}</h3>
          <p className="text-lg font-semibold">{formatOMR(product.price)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}