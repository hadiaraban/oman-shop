"use client";

import { useSyncExternalStore } from "react";

// تابع subscribe: چون وضعیت mount هرگز تغییر نمی‌کند، یک no-op است
const emptySubscribe = () => () => {};

export function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe, // تابع subscribe
    () => true,     // getSnapshot: روی کلاینت همیشه true
    () => false     // getServerSnapshot: روی سرور همیشه false
  );
}