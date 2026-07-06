import { PublicNavbar } from "@/components/public/navbar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PublicLayout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar locale={locale} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-100 bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} SNC Beauty Salon &amp; Spa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
