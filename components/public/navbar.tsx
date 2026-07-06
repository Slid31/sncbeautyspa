import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { PublicLanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";

interface Props {
  locale: string;
}

export async function PublicNavbar({ locale: _locale }: Props) {
  const t = await getTranslations("nav");

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/services", label: t("services") },
    { href: "/policies", label: t("policies") },
    { href: "/book", label: t("booking") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/trans_logo.png"
            alt="SNC Beauty Salon & Spa"
            width={200}
            height={200}
            className="h-20 w-20 object-contain"
            priority
          />
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

        {/* Right: Book Now + Language switcher + Mobile menu toggle */}
        <div className="flex items-center gap-3">
          {/* Book CTA — hidden on small, shown sm+ */}
          <Link
            href="/book"
            className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-full bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
          >
            {t("booking")}
          </Link>

          <PublicLanguageSwitcher />

          <MobileMenu
            links={navLinks}
            bookLabel={t("booking")}
            bookHref="/book"
          />
        </div>
      </div>
    </header>
  );
}
