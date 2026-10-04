import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t">
      <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <p>
            {t("common.appName")} © {year}
          </p>
          <p>{t("footer.rights")}</p>
        </div>
        <p className="mt-4 text-xs">{t("footer.vatNotice")}</p>
      </div>
    </footer>
  );
}