"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { useTransition } from "react";

export function LanguageSwitcher() {
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
    <div className="flex items-center gap-1.5" aria-label="Language">
      <Globe className="h-3.5 w-3.5 text-slate-500 shrink-0" />
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          disabled={isPending || locale === l}
          className={[
            "text-xs font-medium px-1.5 py-0.5 rounded transition-colors",
            locale === l
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-700",
            isPending ? "opacity-50 cursor-wait" : "",
          ].join(" ")}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
