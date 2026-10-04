import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LayoutDashboard, Package, ShoppingBag, ArrowLeft } from "lucide-react";

export function AdminSidebar() {
  const t = useTranslations("admin");

  const items = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/products", label: t("products"), icon: Package },
    { href: "/admin/orders", label: t("orders"), icon: ShoppingBag },
  ];

  return (
    <aside className="flex w-64 flex-col border-r bg-background">
      <div className="border-b p-4">
        <h2 className="text-lg font-bold">{t("title")}</h2>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-muted"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToSite")}
        </Link>
      </div>
    </aside>
  );
}