import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Scissors } from "lucide-react";
import { PublicLanguageSwitcher } from "./language-switcher";

interface Props {
  locale: string;
}

export async function PublicNavbar({ locale }: Props) {
  const t = await getTranslations("nav");
  const base = locale === "fr" ? "/fr" : "";

  const navLinks = [
    { href: `${base}/`, label: t("home") },
    { href: `${base}/services`, label: t("services") },
    { href: `${base}/book`, label: t("booking") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href={`${base}/`}
          className="flex items-center gap-2 font-semibold text-slate-900 hover:text-pink-600 transition-colors shrink-0"
        >
          <Scissors className="h-5 w-5 text-pink-500" />
          <span className="text-base sm:text-lg">SNC Beauty Salon</span>
        </Link>

        {/* Nav links — hidden on mobile, shown md+ */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: Book Now (mobile) + Language switcher */}
        <div className="flex items-center gap-3">
          {/* Book CTA — visible on all sizes */}
          <Link
            href={`${base}/book`}
            className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
          >
            {t("booking")}
          </Link>

          <PublicLanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
