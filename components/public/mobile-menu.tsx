"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  links: NavLink[];
  bookLabel: string;
  bookHref: string;
}

export function MobileMenu({ links, bookLabel, bookHref }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-md z-50 px-4 py-3 flex flex-col gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href={bookHref}
            onClick={() => setOpen(false)}
            className="mt-2 px-4 py-2.5 rounded-full bg-pink-600 text-white text-sm font-medium text-center hover:bg-pink-700 transition-colors"
          >
            {bookLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
