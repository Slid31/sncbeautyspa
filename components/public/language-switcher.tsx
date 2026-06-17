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
    <>
      {/* Mobile: compact select */}
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value)}
        disabled={isPending}
        aria-label="Language"
        className={cn(
          "md:hidden text-sm font-medium rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500",
          isPending && "opacity-50 cursor-wait"
        )}
      >
        {LOCALES.map(({ code, flag, label }) => (
          <option key={code} value={code}>
            {flag} {label}
          </option>
        ))}
      </select>

      {/* Desktop: pill buttons */}
      <div className="hidden md:flex items-center gap-0.5" aria-label="Language">
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
    </>
  );
}
