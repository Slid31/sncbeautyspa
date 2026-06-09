"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "../actions";
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

type State = { error: string } | null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                 text-white text-base font-semibold tracking-wide
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-150 shadow-sm"
    >
      {pending ? "Connexion en cours…" : "SE CONNECTER"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState<State, FormData>(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state?.error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Nom d'utilisateur"
          className="w-full bg-white pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl text-base
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder:text-gray-400 transition-colors"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          placeholder="Mot de passe"
          className="w-full bg-white pl-11 pr-12 py-3.5 border border-gray-300 rounded-xl text-base
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder:text-gray-400 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {/* Helper row */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-400 leading-snug">
          Assurez-vous d&apos;utiliser vos identifiants personnels.
        </p>
        <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-yellow-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-yellow-700">
          <ShieldCheck className="h-3 w-3" />
          Sécurisé
        </span>
      </div>

      <SubmitButton />
    </form>
  );
}
