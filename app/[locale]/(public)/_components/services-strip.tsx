import Link from "next/link";
import {
  Sparkles,
  Eye,
  Smile,
  Scissors,
  Hand,
  Heart,
  Star,
  Leaf,
  Zap,
  User,
} from "lucide-react";

const SERVICES = [
  { icon: Sparkles, label: "Facial" },
  { icon: User,     label: "Man's Ingrown Hair" },
  { icon: Eye,      label: "Brow Lamination · Lash Lift · Extensions" },
  { icon: Zap,      label: "Waxing" },
  { icon: Smile,    label: "Teeth Whitening · Gems" },
  { icon: Hand,     label: "SPA Manicure · Pedicure" },
  { icon: Heart,    label: "SPA Massage Therapy" },
  { icon: Star,     label: "SPA Party" },
  { icon: Scissors, label: "Hair Extensions" },
  { icon: Leaf,     label: "Natural Hair Stylist" },
];

export function ServicesStrip() {
  return (
    <section className="bg-white border-b border-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-pink-500 mb-2">
            What we offer
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            All Our Services
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {SERVICES.map(({ icon: Icon, label }) => (
            <Link
              key={label}
              href="/services"
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:border-pink-200 hover:bg-pink-50 hover:shadow-sm transition-all text-center"
            >
              <span className="h-12 w-12 rounded-full bg-white border border-slate-200 group-hover:border-pink-200 group-hover:bg-pink-100 flex items-center justify-center transition-colors shadow-sm">
                <Icon className="h-5 w-5 text-pink-500 group-hover:text-pink-600 transition-colors" />
              </span>
              <span className="text-xs font-medium text-slate-700 group-hover:text-pink-700 leading-snug transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 active:scale-95 transition-all shadow-md shadow-pink-200"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}
