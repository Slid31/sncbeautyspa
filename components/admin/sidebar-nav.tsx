"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Tag,
  Users,
  FileText,
  CreditCard,
  UserCog,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard",    href: "/admin/dashboard",    icon: LayoutDashboard },
  { key: "appointments", href: "/admin/appointments",  icon: CalendarDays },
  { key: "services",     href: "/admin/services",      icon: Scissors },
  { key: "categories",   href: "/admin/categories",    icon: Tag },
  { key: "clients",      href: "/admin/clients",       icon: Users },
  { key: "intakeForms",  href: "/admin/intake-forms",  icon: FileText },
  { key: "transactions", href: "/admin/transactions",  icon: CreditCard, adminOnly: true },
  { key: "users",        href: "/admin/users",          icon: UserCog,    adminOnly: true },
  { key: "settings",     href: "/admin/settings",       icon: Settings,   adminOnly: true },
];

interface Props {
  role: string;
  locale: string;
}

export function SidebarNav({ role }: Props) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  // Strip locale prefix to get canonical path
  const canonical = pathname.replace(/^\/(en|fr)/, "") || "/";

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN");

  return (
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      {items.map(({ key, href, icon: Icon }) => {
        const active = canonical === href || canonical.startsWith(href + "/");

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-100",
              active
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
