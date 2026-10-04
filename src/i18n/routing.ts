import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // الان فقط انگلیسی. بعداً "ar" رو اضافه کنی.
  locales: ["en"],
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];