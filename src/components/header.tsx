"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartIcon } from "@/components/cart-icon";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const t = useTranslations("common");
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          {t("appName")}
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/" className="transition hover:text-primary">
            {t("home")}
          </Link>
          <Link href="/products" className="transition hover:text-primary">
            {t("products")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label={t("search")}>
            <Search className="h-5 w-5" />
          </Button>

          <CartIcon />

          {status === "loading" ? null : session?.user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm sm:inline">
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label={t("signOut")}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link href="/sign-in">
              <Button variant="ghost" size="icon" aria-label={t("signIn")}>
                <LogIn className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}