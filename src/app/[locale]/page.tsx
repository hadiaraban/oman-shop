import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">{t("home.title")}</h1>
      <p className="text-lg text-muted-foreground">{t("home.subtitle")}</p>
      <Link href="/products">
        <Button size="lg">{t("home.shopNow")}</Button>
      </Link>
    </main>
  );
}