"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", flag: "🇺🇸", label: "EN" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
] as const;

export function PublicLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="flex items-center gap-0.5" aria-label="Language">
      {LOCALES.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          disabled={isPending || locale === code}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium transition-colors",
            locale === code
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            isPending && "opacity-50 cursor-wait"
          )}
        >
          <span aria-hidden="true">{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
