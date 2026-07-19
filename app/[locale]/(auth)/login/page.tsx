import Image from "next/image";
import { LoginForm } from "./_components/login-form";

export const metadata = {
  title: "Sign In - SNC Beauty Salon & Spa",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">

      {/* Outer card — two columns */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">

        {/* ── LEFT: form ── */}
        <div className="flex-1 px-10 py-12 flex flex-col justify-between">
          <div>
            {/* Heading */}
            <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Accédez à votre espace sécurisé.
            </p>

            <div className="mt-8">
              <LoginForm />
            </div>
          </div>

          {/* Footer */}
          <p className="mt-10 text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Propriété de SNC Beauty Salon &amp; Spa
          </p>
        </div>

        {/* ── RIGHT: branding ── */}
        <div className="hidden md:flex w-72 shrink-0 bg-slate-200 items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow p-10 flex flex-col items-center text-center w-full">
            {/* Logo */}
            <Image
              src="/trans_logo.png"
              alt="SNC Beauty Salon & Spa"
              width={100}
              height={100}
              className="mb-3 object-contain"
            />
            
          </div>
        </div>

      </div>
    </div>
  );
}
